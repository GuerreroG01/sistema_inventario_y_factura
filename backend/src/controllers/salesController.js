import Sales from "../models/Sales.js";
import sequelize from "../config/database.js";
import { ValidationError, UniqueConstraintError, Op } from "sequelize";
import { normalizeDate } from "../utils/formatters.js";
import { clearCategoryCache } from "../utils/categoryCache.js";
import { getSaleStatuses, clearStatusCache } from "../utils/salesStatusCache.js";
import SaleDetail from "../models/SaleDetails.js";
import InventoryMovService from "../Services/Inventory_MovService.js";
import Product from "../models/Products.js";
import { cacheService, CacheKeys } from "../services/cache/index.js";

export const getSales = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 6;
        const offset = (page - 1) * limit;

        const { fechaMin, fechaMax, status } = req.query;
        const where = {};

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

        const sale = await Sales.findByPk(id, {
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
            client_id
        }, { transaction: t });


        let total = 0;

        const details = [];

        for (const item of items) {

            const product = await Product.findByPk(item.product_id, { transaction: t });

            if (!product) {
                throw new Error(`Producto no encontrado: ${item.product_id}`);
            }

            if (product.stock < item.cantidad) {
                throw new Error(`Stock insuficiente para el producto ${product.name}`);
            }

            const subtotal = item.cantidad * item.precio_unitario;
            total += subtotal;

            await product.update({
                stock: product.stock - item.cantidad
            }, { transaction: t });

            await InventoryMovService.create({
                product_id: product.id,
                tipo: "salida",
                cantidad: item.cantidad,
                referencia: sale.id,
                observacion: null
            }, t);

            details.push({
                sale_id: sale.id,
                product_id: item.product_id,
                descripcion: item.descripcion || null,
                cantidad: item.cantidad,
                precio_unitario: item.precio_unitario,
                subtotal,
                tipo_item: item.tipo_item
            });
        }

        await SaleDetail.bulkCreate(details, { transaction: t });

        await sale.update({ total }, { transaction: t });
        await t.commit();
        cacheService.del(CacheKeys.DASHBOARDCARDS);
        cacheService.del(CacheKeys.PROFITABILITY);
        cacheService.del(CacheKeys.RANKINGMETRICS);
        cacheService.del(CacheKeys.INVENTORYALERTS);
        cacheService.delByPrefix(CacheKeys.EXPIRINGPRODUCTS);
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
        const now = Date.now();

        if (categoriesCache && now - categoriesCacheTime < CACHE_TTL) {
            return res.json({
                source: "cache",
                categories: categoriesCache
            });
        }

        const categories = await Product.findAll({
            attributes: [
                [fn("DISTINCT", col("category")), "category"]
            ],
            where: {
                category: {
                    [Op.ne]: null
                }
            },
            raw: true
        });

        const clean = categories
            .map(c => c.category)
            .filter(Boolean);

        categoriesCache = clean;
        categoriesCacheTime = now;

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

        const sale = await Sales.findByPk(id, { transaction: t });

        if (!sale) {
            await t.rollback();
            return res.status(404).json({
                error: "not_found",
                message: `No se encontró una venta con id ${id}`
            });
        }

        const previousStatus = sale.status;

        sale.status = status;

        if (status === "REFUNDED") {
            sale.observation = refundObservation;
        }

        await sale.save({ transaction: t });

        if (status === "CANCELLED" && previousStatus !== "CANCELLED") {

            const details = await SaleDetail.findAll({
                where: { sale_id: id },
                transaction: t
            });

            for (const item of details) {

                const product = await Product.findByPk(item.product_id, { transaction: t });

                if (!product) {
                    throw new Error(`Producto no encontrado: ${item.product_id}`);
                }

                await product.update({
                    stock: Number(product.stock) + Number(item.cantidad)
                }, { transaction: t });

                await InventoryMovService.create({
                    product_id: item.product_id,
                    tipo: "entrada",
                    cantidad: item.cantidad,
                    referencia: sale.id,
                    observacion: "Cancelación de venta"
                }, t);
            }
        }

        if (status === "COMPLETED" && previousStatus === "CANCELLED") {
            const details = await SaleDetail.findAll({
                where: { sale_id: id },
                transaction: t
            });
            for (const item of details) {
                const product = await Product.findByPk(item.product_id, { 
                    transaction: t 
                });

                if (!product) {
                    throw new Error(`Producto no encontrado: ${item.product_id}`);
                }

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
                    observacion: "Reactivación de venta cancelada"
                }, t);
            }
        }

        clearStatusCache();

        await t.commit();
        cacheService.del(CacheKeys.DASHBOARDCARDS);
        cacheService.del(CacheKeys.PROFITABILITY);
        cacheService.del(CacheKeys.RANKINGMETRICS);
        cacheService.del(CacheKeys.INVENTORYALERTS);
        cacheService.del(CacheKeys.EXPIRINGPRODUCTS);

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