import Sales from "../models/Sales.js";
import sequelize from "../config/database.js";
import { Op } from "sequelize";
import { normalizeDate } from "../utils/formatters.js";
import { clearStatusCache } from "../utils/salesStatusCache.js";
import SaleDetail from "../models/SaleDetails.js";
import InventoryMovService from "../services/Inventory_MovService.js";
import Product from "../models/Products.js";
import { cacheService, CacheKeys } from "../services/cache/index.js";
import Customer from "../models/Customers.js";
import { resetCustomerMarketingAfterPurchase } from "../services/MarketingService.js";
import ProductUnit from "../models/ProductsUnits.js";
import Branch from "../models/Branch.js";

export const getSales = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 6;
        const offset = (page - 1) * limit;

        const { fechaMin, fechaMax, status } = req.query;

        const { business_id, branch_id, rol } = req.user;
        if (!business_id) {
            return res.status(400).json({
                error: "business_required",
                message: "El usuario no tiene un negocio asociado."
            });
        }

        const where = {
            business_id
        };

        if (rol !== "admin" && rol !== "superAdmin") {
            if (!branch_id) {
                return res.status(400).json({
                    error: "branch_required",
                    message: "El usuario no tiene una sucursal asociada."
                });
            }

            where.branch_id = branch_id;
        }

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
        const { business_id, branch_id, rol } = req.user;

        if (!business_id) {
            return res.status(400).json({
                error: "business_required",
                message: "El usuario no tiene un negocio asociado."
            });
        }

        const where = {
            id,
            business_id
        };

        const rolesWithFullBusinessAccess = ["admin", "superAdmin"];

        if (!rolesWithFullBusinessAccess.includes(rol)) {
            if (!branch_id) {
                return res.status(400).json({
                    error: "branch_required",
                    message: "El usuario no tiene una sucursal asociada."
                });
            }

            where.branch_id = branch_id;
        }
        const sale = await Sales.findOne({
            where,
            include: [
                {
                    model: SaleDetail,
                    as: "details"
                },
                {
                    model: Customer,
                    as: "customer",
                    attributes: ["id", "name", "identification"]
                },
                {
                    model: Branch,
                    as: "branch",
                    attributes: ["name"]
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

const isPromotionActive = (productUnit) => {
    const now = new Date();

    const promotionStart = productUnit.promotionStart
        ? new Date(productUnit.promotionStart)
        : null;

    const promotionEnd = productUnit.promotionEnd
        ? new Date(productUnit.promotionEnd)
        : null;

    if (promotionEnd) {
        promotionEnd.setUTCDate(
            promotionEnd.getUTCDate() + 1
        );
    }

    return (
        productUnit.hasPromotion === true &&
        productUnit.promotionPrice != null &&
        Number(productUnit.promotionQuantity || 0) > 0 &&
        (!promotionStart || promotionStart <= now) &&
        (!promotionEnd || now < promotionEnd)
    );
};

export const createSale = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { fecha, category, client_id, payment_type, items } = req.body;

        if (!fecha) {
            await t.rollback();

            return res.status(400).json({
                error: "validation_error",
                message: "El campo 'fecha' es obligatorio."
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            await t.rollback();

            return res.status(400).json({
                error: "validation_error",
                message: "Debes enviar al menos un item en la venta."
            });
        }

        const sale = await Sales.create(
            {
                fecha: normalizeDate(fecha),
                total: 0,
                category,
                client_id,
                payment_type,
                created_by: req.user.id,
                updated_by: req.user.id,
                business_id: req.user.business_id,
                branch_id: req.user.branch_id
            },
            {
                transaction: t
            }
        );

        let total = 0;
        const details = [];

        for (const item of items) {

            const productUnit = await ProductUnit.findOne({
                where: {
                    id: item.product_unit_id
                },
                include: [
                    {
                        model: Product,
                        as: "product",
                        attributes: [
                            "id",
                            "name",
                            "type_item"
                        ],
                        where: {
                            business_id: req.user.business_id
                        }
                    }
                ],
                transaction: t
            });

            if (!productUnit) {
                throw new Error(
                    `Unidad de producto no encontrada: ${item.product_unit_id}`
                );
            }

            const product = productUnit.product;
            const isService = product.type_item === "Servicio";
            const quantity = Number(item.cantidad);

            if (!Number.isFinite(quantity) || quantity <= 0) {
                throw new Error(
                    `Cantidad inválida para ${product.name}: ${item.cantidad}`
                );
            }
            if (isService) {
                const servicePrice = Number(productUnit.price);
                if ( !Number.isFinite(servicePrice) || servicePrice < 0 ) {
                    throw new Error(
                        `Precio inválido para el servicio ${product.name}`
                    );
                }

                const subtotal = quantity * servicePrice;
                total += subtotal;

                details.push({
                    sale_id: sale.id,
                    product_unit_id: productUnit.id,
                    descripcion:
                        item.descripcion ||
                        `${product.name} - ${productUnit.unit}`,
                    cantidad: quantity,
                    precio_unitario: servicePrice,
                    subtotal,
                    tipo_item: product.type_item,
                    business_id: req.user.business_id,
                    branch_id: req.user.branch_id
                });

                continue;
            }

            const stock = Number(productUnit.stock);
            const promotionQuantity = Number( productUnit.promotionQuantity || 0 );

            if ( !Number.isFinite(stock) || stock < 0 ) {
                throw new Error(
                    `Stock inválido para ${product.name} - ${productUnit.unit}`
                );
            }

            if ( !Number.isFinite(promotionQuantity) || promotionQuantity < 0 ) {
                throw new Error(
                    `Stock promocional inválido para ${product.name} - ${productUnit.unit}`
                );
            }

            const promotionActive =
                isPromotionActive(productUnit);

            const availablePromotionStock =
                promotionActive
                    ? promotionQuantity
                    : 0;

            const totalAvailableStock = availablePromotionStock + stock;

            if (totalAvailableStock < quantity) {
                throw new Error(
                    `Stock insuficiente para ${product.name} - ${productUnit.unit}. ` +
                    `Disponible: ${totalAvailableStock}, solicitado: ${quantity}`
                );
            }
            const normalPrice = Number(productUnit.price);

            if ( !Number.isFinite(normalPrice) || normalPrice < 0 ) {
                throw new Error(
                    `Precio normal inválido para ${product.name} - ${productUnit.unit}`
                );
            }

            let promotionQuantityUsed = 0;
            if ( promotionActive && availablePromotionStock > 0 ) {
                promotionQuantityUsed =
                    Math.min(
                        quantity,
                        availablePromotionStock
                    );
            }

            const normalQuantity = quantity - promotionQuantityUsed;
            let promotionPrice = 0;

            if (promotionQuantityUsed > 0) {
                promotionPrice = Number(productUnit.promotionPrice);
                if ( !Number.isFinite(promotionPrice) || promotionPrice < 0 ) {
                    throw new Error(
                        `El producto ${product.name} tiene una promoción activa ` +
                        `pero no tiene un precio promocional válido.`
                    );
                }
            }

            const promotionSubtotal = promotionQuantityUsed * promotionPrice;
            const normalSubtotal = normalQuantity * normalPrice;
            const subtotal = promotionSubtotal + normalSubtotal;

            const precioUnitarioReal =
                quantity > 0
                    ? subtotal / quantity
                    : 0;

            if (normalQuantity > 0) {
                await productUnit.update(
                    {
                        stock: stock - normalQuantity
                    },
                    {
                        transaction: t
                    }
                );
            }

            if (promotionQuantityUsed > 0) {
                await productUnit.update(
                    {
                        promotionQuantity: promotionQuantity - promotionQuantityUsed
                    },
                    {
                        transaction: t
                    }
                );
            }
            await InventoryMovService.create(
                {
                    product_unit_id:
                        productUnit.id,
                    tipo: "salida",
                    cantidad: quantity,
                    referencia: sale.id,
                    observacion:
                        promotionQuantityUsed > 0
                            ? normalQuantity > 0
                                ? "Venta con promoción"
                                : "Venta con promoción"
                            : "Venta",

                    business_id: req.user.business_id,
                    branch_id: req.user.branch_id
                },
                t
            );

            total += subtotal;

            details.push({
                sale_id: sale.id,
                product_unit_id:
                    productUnit.id,
                descripcion:
                    item.descripcion ||
                    `${product.name} - ${productUnit.unit}`,
                cantidad: quantity,
                precio_unitario: precioUnitarioReal,
                subtotal,
                tipo_item: product.type_item,
                business_id: req.user.business_id,
                branch_id: req.user.branch_id
            });
        }
        await SaleDetail.bulkCreate(
            details,
            {
                transaction: t
            }
        );

        await sale.update(
            {
                total
            },
            {
                transaction: t
            }
        );
        if ( payment_type === "CREDIT" && client_id ) {

            const customer =
                await Customer.findOne({
                    where: {
                        id: client_id,
                        business_id:
                            req.user.business_id
                    },
                    transaction: t
                });

            if (!customer) {
                throw new Error(
                    "Cliente no encontrado"
                );
            }

            const newBalance = Number(customer.balance) + Number(total);
            if ( customer.credit_limit > 0 && newBalance > Number(customer.credit_limit)) {
                throw new Error(
                    "El cliente supera su límite de crédito"
                );
            }

            await customer.update(
                {
                    balance: newBalance
                },
                {
                    transaction: t
                }
            );
        }
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
        console.error( "CREATE SALE ERROR FULL:",error);
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
    const { id } = req.params;
    const { status, refundObservation } = req.body;

    if (!status) {
        return res.status(400).json({
            error: "validation_error",
            message: "El campo 'status' es obligatorio."
        });
    }

    if (
        status === "REFUNDED" &&
        (!refundObservation || refundObservation.trim() === "")
    ) {
        return res.status(400).json({
            error: "validation_error",
            code: "REFUND_OBSERVATION_REQUIRED",
            message: "Debe ingresar una observación cuando se procesa un reembolso."
        });
    }

    const t = await sequelize.transaction();

    try {
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

        const paidStatuses = ["PAID", "COMPLETED"];

        const unpaidStatuses = [
            "PENDING",
            "CANCELLED",
            "REFUSED"
        ];

        sale.status = status;
        sale.updated_by = req.user.id;
        if (paidStatuses.includes(status)) {
            if (!sale.paidAt) {
                sale.paidAt = new Date();
            }
        }
        else if (unpaidStatuses.includes(status)) {
            sale.paidAt = null;
        }

        if (status === "REFUNDED") {
            sale.observation = refundObservation;
        }

        await sale.save({
            transaction: t
        });

        if (sale.payment_type === "CREDIT" && sale.client_id) {
            const previousAffectsBalance =
                previousStatus === "PENDING";

            const currentAffectsBalance =
                status === "PENDING";

            if (previousAffectsBalance !== currentAffectsBalance) {

                const customer = await Customer.findOne({
                    where: {
                        id: sale.client_id,
                        business_id: req.user.business_id
                    },
                    transaction: t
                });

                if (!customer) {
                    throw new Error("Cliente no encontrado");
                }

                let newBalance = Number(customer.balance);

                if (
                    previousAffectsBalance &&
                    !currentAffectsBalance
                ) {
                    newBalance -= Number(sale.total);
                }

                if (
                    !previousAffectsBalance &&
                    currentAffectsBalance
                ) {
                    newBalance += Number(sale.total);
                }
                await customer.update(
                    {
                        balance: newBalance
                    },
                    {
                        transaction: t
                    }
                );
            }
        }

        if (
            status === "CANCELLED" &&
            previousStatus !== "CANCELLED"
        ) {
            const details = await SaleDetail.findAll({
                where: {
                    sale_id: id,
                    business_id: req.user.business_id
                },
                transaction: t
            });

            for (const item of details) {
                const productUnit = await ProductUnit.findOne({
                    where: {
                        id: item.product_unit_id
                    },
                    include: [
                        {
                            model: Product,
                            as: "product",
                            attributes: ["id", "name", "type_item"],
                            where: {
                                business_id: req.user.business_id
                            }
                        }
                    ],
                    transaction: t
                });

                if (!productUnit) {
                    throw new Error(
                        `Unidad de producto no encontrada: ${item.product_unit_id}`
                    );
                }

                const product = productUnit.product;

                if (product.type_item !== "Servicio") {

                    const quantity = Number(item.cantidad);

                    const salePrice = Number(item.precio_unitario);
                    const promotionPrice = Number(
                        productUnit.promotionPrice
                    );

                    const wasPromotion =
                        productUnit.hasPromotion === true &&
                        promotionPrice === salePrice;

                    if (wasPromotion) {
                        await productUnit.update(
                            {
                                promotionQuantity:
                                    Number(productUnit.promotionQuantity || 0) +
                                    quantity
                            },
                            {
                                transaction: t
                            }
                        );

                    } else {
                        await productUnit.update(
                            {
                                stock:
                                    Number(productUnit.stock) +
                                    quantity
                            },
                            {
                                transaction: t
                            }
                        );
                    }

                    await InventoryMovService.create({
                        product_unit_id: productUnit.id,
                        tipo: "entrada",
                        cantidad: quantity,
                        referencia: sale.id,
                        observacion: wasPromotion
                            ? "Cancelación de venta promocional"
                            : "Cancelación de venta",
                        business_id: req.user.business_id
                    }, t);
                }
            }
        }

        if (
            status === "COMPLETED" &&
            previousStatus === "CANCELLED"
        ) {
            const details = await SaleDetail.findAll({
                where: {
                    sale_id: id,
                    business_id: req.user.business_id
                },
                transaction: t
            });

            for (const item of details) {
                const productUnit = await ProductUnit.findOne({
                    where: {
                        id: item.product_unit_id
                    },
                    include: [
                        {
                            model: Product,
                            as: "product",
                            attributes: ["id", "name", "type_item"],
                            where: {
                                business_id: req.user.business_id
                            }
                        }
                    ],
                    transaction: t
                });

                if (!productUnit) {
                    throw new Error(
                        `Unidad de producto no encontrada: ${item.product_unit_id}`
                    );
                }

                const product = productUnit.product;

                if (product.type_item !== "Servicio") {

                    const cantidadVenta = Number(item.cantidad);
                    let cantidadRestante = cantidadVenta;

                    const now = new Date();

                    const promotionStart = productUnit.promotionStart
                        ? new Date(productUnit.promotionStart)
                        : null;

                    const promotionEnd = productUnit.promotionEnd
                        ? new Date(productUnit.promotionEnd)
                        : null;

                    if (promotionEnd) {
                        promotionEnd.setUTCDate(
                            promotionEnd.getUTCDate() + 1
                        );
                    }

                    const promotionActive =
                        productUnit.hasPromotion === true &&
                        productUnit.promotionPrice != null &&
                        Number(productUnit.promotionQuantity) > 0 &&
                        (!promotionStart || promotionStart <= now) &&
                        (!promotionEnd || now < promotionEnd);

                    if (promotionActive) {

                        const promotionAvailable =
                            Number(productUnit.promotionQuantity);

                        const fromPromotion = Math.min(
                            cantidadRestante,
                            promotionAvailable
                        );

                        if (fromPromotion > 0) {
                            await productUnit.update(
                                {
                                    promotionQuantity:
                                        promotionAvailable - fromPromotion
                                },
                                {
                                    transaction: t
                                }
                            );

                            cantidadRestante -= fromPromotion;
                        }
                    }

                    if (cantidadRestante > 0) {

                        const currentStock =
                            Number(productUnit.stock);

                        if (currentStock < cantidadRestante) {
                            throw new Error(
                                `Stock insuficiente para ${product.name} - ${productUnit.unit}`
                            );
                        }

                        await productUnit.update(
                            {
                                stock:
                                    currentStock - cantidadRestante
                            },
                            {
                                transaction: t
                            }
                        );
                    }

                    await InventoryMovService.create(
                        {
                            product_unit_id: productUnit.id,
                            tipo: "salida",
                            cantidad: cantidadVenta,
                            referencia: sale.id,
                            observacion:
                                "Reactivación de venta cancelada",
                            business_id: req.user.business_id
                        },
                        t
                    );
                }
            }
        }

        if (
            status === "COMPLETED" &&
            ["PENDING", "PAID"].includes(previousStatus) &&
            sale.client_id
        ) {
            await resetCustomerMarketingAfterPurchase(
                sale.client_id,
                req.user.business_id,
                sale.paidAt
            );
        }


        clearStatusCache();

        await t.commit();

        cacheService.del(
            CacheKeys.DASHBOARDCARDS,
            req.user.business_id
        );

        cacheService.del(
            CacheKeys.PROFITABILITY,
            req.user.business_id
        );

        cacheService.del(
            CacheKeys.RANKINGMETRICS,
            req.user.business_id
        );

        cacheService.del(
            CacheKeys.INVENTORYALERTS,
            req.user.business_id
        );

        cacheService.del(
            CacheKeys.PRODUCTSALERTS,
            req.user.business_id
        );

        cacheService.delOtherByPrefix(
            CacheKeys.EXPIRINGPRODUCTS,
            req.user.business_id
        );

        return res.json({
            message: "Status actualizado correctamente",
            sale
        });

    } catch (error) {
        if (!t.finished) {
            await t.rollback();
        }
        console.error(
            "updateSaleStatus error:",
            error
        );

        return res.status(500).json({
            error: "update_status_error",
            message: "Ocurrió un error al actualizar el status de la venta"
        });
    }
};

export default { getSales, getSaleById, createSale, getCategories, updateSaleStatus };