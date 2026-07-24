import Sales from "../models/Sales.js";
import sequelize from "../config/database.js";
import { ValidationError, UniqueConstraintError, Op } from "sequelize";
import { normalizeDate } from "../utils/formatters.js";
import { clearCategoryCache } from "../utils/categoryCache.js";
import { getSaleStatuses, clearStatusCache } from "../utils/salesStatusCache.js";
import SaleDetail from "../models/SaleDetails.js";
import InventoryMovService from "../services/Inventory_MovService.js";
import Product from "../models/Products.js";
import { cacheService, CacheKeys } from "../services/cache/index.js";

export const getSales = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 6;
        const offset = (page - 1) * limit;

        const { fechaMin, fechaMax, status } = req.query;
        const where = {business_id: req.user.business_id};

        if (fechaMin || fechaMax) {
            where.fecha = {};
            if (fechaMin) {
                where.fecha[Op.gte] = normalizeDate(fechaMin);
            }
            if (fechaMax) {
                where.fecha[Op.lte] = normalizeDate(fechaMax);
            }
        }

        if (status) {
            where.status = status;
        }

        const { count, rows: sales } = await Sales.findAndCountAll({
            where,
            order: [["id", "DESC"]],
            limit,
            offset
        });

        return res.json({
            total: count,
            page,
            totalPages: Math.ceil(count / limit),
            sales
        });

    } catch (error) {
        console.error("getSales error:", error);
        return res.status(500).json({
            error: "internal_error",
            message: error.message
        });
    }
};

export const getSaleById = async (req, res) => {
    try {
        const { id } = req.params;
        const business_id = req.user.business_id;
        const sale = await Sales.findOne({
            where: {
                id,
                business_id
            },
            include: [
                {
                    model: SaleDetail,
                    as: "details"
                }
            ]
        });

        if (!sale) {
            return res.status(404).json({
                error: "not_found",
                message: `No se encontró una venta con id ${id}`
            });
        }

        return res.json(sale);

    } catch (error) {
        console.error("getSaleById error:", error);
        return res.status(500).json({
            error: "internal_error",
            message: "Ocurrió un error al obtener la venta"
        });
    }
};

export const createSale = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        let { fecha, category, client_id, items } = req.body;

        if (!fecha) {
            return res.status(400).json({
                error: "validation_error",
                message: "El campo 'fecha' es obligatorio."
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                error: "validation_error",
                message: "Debes enviar al menos un item en la venta."
            });
        }

        const sale = await Sales.create({
            fecha: normalizeDate(fecha),
            total: 0,
            category,
            client_id,
            created_by: req.user.id,
            updated_by: req.user.id,
            business_id: req.user.business_id
        }, { transaction: t });


        let total = 0;

        const details = [];

        for (const item of items) {

            const product = await Product.findOne({
                where: {
                    id: item.product_id,
                    business_id: req.user.business_id
                },
                transaction: t
            });

            if (!product) {
                throw new Error(`Producto no encontrado: ${item.product_id}`);
            }

            const subtotal = item.cantidad * item.precio_unitario;
            total += subtotal;
            const isService = product.type_item === "Servicio";
            if (!isService) {
                if (product.stock < item.cantidad) {
                    throw new Error(`Stock insuficiente para el producto ${product.name}`);
                }

                await product.update({
                    stock: product.stock - item.cantidad
                }, { transaction: t });

                await InventoryMovService.create({
                    product_id: product.id,
                    tipo: "salida",
                    cantidad: item.cantidad,
                    referencia: sale.id,
                    observacion: null,
                    business_id: req.user.business_id
                }, t);
            }

            details.push({
                sale_id: sale.id,
                product_id: item.product_id,
                descripcion: item.descripcion || null,
                cantidad: item.cantidad,
                precio_unitario: item.precio_unitario,
                subtotal,
                tipo_item: item.tipo_item,
                business_id: req.user.business_id
            });
        }

        await SaleDetail.bulkCreate(details, { transaction: t });

        await sale.update({ total }, { transaction: t });
        await t.commit();
        cacheService.del(CacheKeys.DASHBOARDCARDS,req.user.business_id);
        cacheService.del(CacheKeys.PROFITABILITY,req.user.business_id);
        cacheService.del(CacheKeys.RANKINGMETRICS,req.user.business_id);
        cacheService.del(CacheKeys.INVENTORYALERTS,req.user.business_id);
        cacheService.del(CacheKeys.PRODUCTSALERTS,req.user.business_id);
        cacheService.delOtherByPrefix(CacheKeys.EXPIRINGPRODUCTS,req.user.business_id);
        return res.status(201).json({
            message: "Venta creada correctamente",
            sale,
            total
        });
        

    } catch (error) {
        await t.rollback();

        console.error("CREATE SALE ERROR FULL:", error);
        console.error("STACK:", error?.stack);

        return res.status(500).json({
            error: "create_sale_error",
            message: error.message,
            stack: error.stack
        });
    }
};

export const getCategories = async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const now = Date.now();

        const cached = categoriesCache.get(businessId);

        if (cached && now - cached.time < CACHE_TTL) {
            return res.json({
                source: "cache",
                categories: cached.data
            });
        }

        const categories = await Product.findAll({
            attributes: [
                [fn("DISTINCT", col("category")), "category"]
            ],
            where: {
                business_id: businessId,
                category: {
                    [Op.ne]: null
                }
            },
            raw: true
        });

        const clean = categories
            .map(c => c.category)
            .filter(Boolean);

        categoriesCache.set(businessId, {
            data: clean,
            time: now
        });

        return res.json({
            source: "db",
            categories: clean
        });

    } catch (error) {
        console.error("getCategories error:", error);

        return res.status(500).json({
            error: "internal_error",
            message: "Error al obtener categorías"
        });
    }
};

export const updateSaleStatus = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { id } = req.params;
        const { status, refundObservation } = req.body;

        if (!status) {
            return res.status(400).json({
                error: "validation_error",
                message: "El campo 'status' es obligatorio."
            });
        }

        if (status === "REFUNDED" && (!refundObservation || refundObservation.trim() === "")) {
            return res.status(400).json({
                error: "validation_error",
                code: "REFUND_OBSERVATION_REQUIRED",
                message: "Debe ingresar una observación cuando se procesa un reembolso."
            });
        }

        const sale = await Sales.findOne({
            where: {
                id,
                business_id: req.user.business_id
            },
            transaction: t
        });

        if (!sale) {
            await t.rollback();
            return res.status(404).json({
                error: "not_found",
                message: `No se encontró una venta con id ${id}`
            });
        }

        const previousStatus = sale.status;

        sale.status = status;
        sale.updated_by = req.user.id;

        if (status === "REFUNDED") {
            sale.observation = refundObservation;
        }

        await sale.save({ transaction: t });

        if (status === "CANCELLED" && previousStatus !== "CANCELLED") {

            const details = await SaleDetail.findAll({
                where: {
                    sale_id: id,
                    business_id: req.user.business_id
                },
                transaction: t
            });

            for (const item of details) {

                const product = await Product.findOne({
                    where: {
                        id: item.product_id,
                        business_id: req.user.business_id
                    },
                    transaction: t
                });

                if (!product) {
                    throw new Error(`Producto no encontrado: ${item.product_id}`);
                }

                if (product.type_item === "Producto") {
                    await product.update({
                        stock: Number(product.stock) + Number(item.cantidad)
                    }, { transaction: t });

                    await InventoryMovService.create({
                        product_id: item.product_id,
                        tipo: "entrada",
                        cantidad: item.cantidad,
                        referencia: sale.id,
                        observacion: "Cancelación de venta",
                        business_id: req.user.business_id
                    }, t);
                }
            }
        }

        if (status === "COMPLETED" && previousStatus === "CANCELLED") {
            const details = await SaleDetail.findAll({
                where: {
                    sale_id: id,
                    business_id: req.user.business_id
                },
                transaction: t
            });
            for (const item of details) {
                const product = await Product.findOne({
                    where: {
                        id: item.product_id,
                        business_id: req.user.business_id
                    },
                    transaction: t
                });

                if (!product) {
                    throw new Error(`Producto no encontrado: ${item.product_id}`);
                }

                if (product.type_item === "Producto") {
                    await product.update({
                        stock: Number(product.stock) - Number(item.cantidad)
                    }, {
                        transaction: t
                    });

                    await InventoryMovService.create({
                        product_id: item.product_id,
                        tipo: "salida",
                        cantidad: item.cantidad,
                        referencia: sale.id,
                        observacion: "Reactivación de venta cancelada",
                        business_id: req.user.business_id
                    }, t);
                }
            }
        }

        clearStatusCache();

        await t.commit();
        cacheService.del(CacheKeys.DASHBOARDCARDS,req.user.business_id);
        cacheService.del(CacheKeys.PROFITABILITY,req.user.business_id);
        cacheService.del(CacheKeys.RANKINGMETRICS,req.user.business_id);
        cacheService.del(CacheKeys.INVENTORYALERTS,req.user.business_id);
        cacheService.del(CacheKeys.PRODUCTSALERTS,req.user.business_id);
        cacheService.delOtherByPrefix(CacheKeys.EXPIRINGPRODUCTS,req.user.business_id);

        return res.json({
            message: "Status actualizado correctamente",
            sale
        });

    } catch (error) {
        await t.rollback();
        
        console.error("updateSaleStatus error:", error);

        return res.status(500).json({
            error: "update_status_error",
            message: "Ocurrió un error al actualizar el status de la venta"
        });
    }
};

export default { getSales, getSaleById, createSale, getCategories, updateSaleStatus };