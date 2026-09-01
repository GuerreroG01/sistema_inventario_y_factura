import Product from "../models/Products.js";
import ProductUnit from "../models/ProductsUnits.js";
import { ValidationError, UniqueConstraintError, fn, col, Op } from "sequelize";
import { normalizeDate } from "../utils/formatters.js"
import { invalidateCategoryCache, clearCategoryCache, getCategoryCache, setCategoryCache  } from "../utils/categoryCache.js";
import { cacheService, CacheKeys } from "../services/cache/index.js";
import { getCriticalStockProducts } from "../services/ProductService.js";
import { 
    create, findByProduct, update, resetStockForService, deactivateByProduct,
    getTotalStock, getLowStock
} from "../services/ProductsUnitsService.js";
import sequelize from "../config/database.js";
import Branch from "../models/Branch.js";

export const createProduct = async (req, res) => {
    try {
        const {
            name, category, type_item, units, active
        } = req.body;

        const business_id = req.user.business_id;

        if (!name || name.trim() === "") {
            return res.status(400).json({
                error: "validation_error",
                message: "El campo 'name' es obligatorio."
            });
        }

        if (!Array.isArray(units) || units.length === 0) {
            return res.status(400).json({
                error: "validation_error",
                message: "El producto debe tener al menos una unidad."
            });
        }

        const newType = type_item ?? "Producto";

        for (const [index, unitData] of units.entries()) {

            if (!unitData.unit || unitData.unit.trim() === "") {
                return res.status(400).json({
                    error: "validation_error",
                    message: `La unidad #${index + 1} es obligatoria.`
                });
            }

            if (
                unitData.price === undefined ||
                isNaN(unitData.price)
            ) {
                return res.status(400).json({
                    error: "validation_error",
                    message: `El precio de la unidad #${index + 1} es obligatorio y debe ser un número.`
                });
            }

            if (
                Boolean(unitData.hasPromotion) &&
                unitData.promotionPrice !== undefined &&
                unitData.promotionPrice !== null &&
                Number(unitData.promotionPrice) >= Number(unitData.price)
            ) {
                return res.status(400).json({
                    error: "validation_error",
                    message: `El precio de promoción de la unidad #${index + 1} debe ser menor al precio normal.`
                });
            }

            if (
                Boolean(unitData.hasPromotion) &&
                unitData.promotionStart &&
                unitData.promotionEnd &&
                new Date(unitData.promotionStart) >
                    new Date(unitData.promotionEnd)
            ) {
                return res.status(400).json({
                    error: "validation_error",
                    message: `La fecha de inicio de promoción de la unidad #${index + 1} debe ser anterior a la fecha de fin.`
                });
            }
        }

        const product = await Product.create({
            name,
            category,
            type_item: newType,
            active: active ?? true,
            created_by: req.user.id,
            updated_by: req.user.id,
            business_id
        });

        const productUnits = [];
        for (const unitData of units) {

            const productUnit =
                await create({
                    product_id: product.id,
                    business_id,
                    unit: unitData.unit,
                    barcode: unitData.barcode,
                    price: unitData.price,
                    cost: unitData.cost,
                    hasPromotion: unitData.hasPromotion,
                    promotionPrice: unitData.promotionPrice,
                    promotionQuantity: unitData.promotionQuantity,
                    promotionStart: normalizeDate(unitData.promotionStart),
                    promotionEnd:normalizeDate(unitData.promotionEnd),
                    stock:
                        newType === "Servicio"
                            ? 0
                            : (unitData.stock ?? 0),
                    entryDate: normalizeDate(unitData.entryDate),
                    expirationDate: normalizeDate(unitData.expirationDate),
                    active: unitData.active ?? true
                });
            productUnits.push(productUnit);
        }

        invalidateCategoryCache(business_id, category);
        cacheService.del(CacheKeys.DASHBOARDCARDS, business_id);
        cacheService.del(CacheKeys.PROFITABILITY, business_id);
        cacheService.del(CacheKeys.RANKINGMETRICS, business_id);
        cacheService.del(CacheKeys.INVENTORYALERTS, business_id);
        cacheService.del(CacheKeys.PRODUCTSALERTS, business_id);
        cacheService.delOtherByPrefix(
            CacheKeys.EXPIRINGPRODUCTS,
            business_id
        );

        await cacheService.del(
            `${CacheKeys.MARKETING_PRODUCTS_CATEGORY}:${category}`,
            business_id
        );

        return res.status(201).json({
            ...product.toJSON(),
            productUnits
        });

    } catch (error) {

        console.error(
            "createProduct error:",
            error
        );

        if (error instanceof ValidationError) {
            return res.status(400).json({
                error: "validation_error",
                message: error.errors.map(
                    err => err.message
                )
            });
        }

        if (error instanceof UniqueConstraintError) {
            return res.status(400).json({
                error: "unique_constraint_error",
                message: error.errors.map(
                    err => err.message
                )
            });
        }

        return res.status(500).json({
            error: "create_product_error",
            message:
                "Ocurrió un error inesperado al crear el producto."
        });
    }
};

export const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const offset = (page - 1) * limit;

        const { name, barcode, category, active, priceMin, priceMax, hasPromotion } = req.query;

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

        if (name) {
            where.name = {
                [Op.iLike]: `%${name}%`
            };
        }

        if (category) {
            where.category = category;
        }

        if (active !== undefined) {
            where.active = active === "true";
        }

        const productUnitWhere = {};
        if (rol !== "admin" && rol !== "superAdmin") {
            if (!branch_id) {
                return res.status(400).json({
                    error: "branch_required",
                    message: "El usuario no tiene una sucursal asociada."
                });
            }

            productUnitWhere.branch_id = branch_id;
        }

        if (barcode) {
            productUnitWhere.barcode = barcode;
        }

        if (priceMin || priceMax) {
            productUnitWhere.price = {};

            if (priceMin) {
                productUnitWhere.price[Op.gte] = parseFloat(priceMin);
            }

            if (priceMax) {
                productUnitWhere.price[Op.lte] = parseFloat(priceMax);
            }
        }

        if (hasPromotion === "true") {
            productUnitWhere.hasPromotion = true;

            productUnitWhere[Op.and] = [
                {
                    [Op.or]: [
                        { promotionStart: null },
                        {
                            promotionStart: {
                                [Op.lte]: new Date()
                            }
                        }
                    ]
                },
                {
                    [Op.or]: [
                        { promotionEnd: null },
                        {
                            promotionEnd: {
                                [Op.gte]: new Date()
                            }
                        }
                    ]
                }
            ];
        }

        if (hasPromotion === "false") {
            productUnitWhere[Op.or] = [
                {
                    hasPromotion: false
                },
                {
                    hasPromotion: true,
                    promotionEnd: {
                        [Op.lt]: new Date()
                    }
                }
            ];
        }

        const { count, rows: products } = await Product.findAndCountAll({
            where,
            include: [
                {
                    model: ProductUnit,
                    as: "units",

                    attributes: [
                        "id", "product_id", "branch_id", "unit", "barcode", "price", "cost", "stock",  "hasPromotion",
                        "promotionPrice", "promotionQuantity", "promotionStart", "promotionEnd", "entryDate", 
                        "expirationDate", "active"
                    ],
                    where: productUnitWhere,
                    required: false,
                    include: [
                        {
                            model: Branch,
                            as: "branch",
                            attributes: ["id", "name"]
                        }
                    ]
                }
            ],

            order: [["id", "DESC"]],
            limit,
            offset,
            distinct: true
        });

        return res.json({
            total: count,
            page,
            totalPages: Math.ceil(count / limit),
            products
        });

    } catch (error) {
        console.error("getProducts error:", error);

        return res.status(500).json({
            error: "internal_error",
            message: error.message
        });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const { business_id, branch_id, rol } = req.user;
        if (!business_id) {
            return res.status(400).json({
                error: "business_required",
                message: "El usuario no tiene un negocio asociado."
            });
        }

        const product = await Product.findOne({
            where: {
                id,
                business_id
            }
        });

        if (!product) {
            return res.status(404).json({
                error: "not_found",
                message: `No se encontró un producto con id ${id}`
            });
        }

        const units = await findByProduct(
            product.id,
            business_id,
            branch_id,
            rol
        );

        return res.json({
            ...product.toJSON(),
            units
        });

    } catch (error) {
        console.error("getProductById error:", error);

        return res.status(500).json({
            error: "internal_error",
            message: "Ocurrió un error al obtener el producto"
        });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { business_id, branch_id } = req.user;

        const {
            name, category, type_item, active, units
        } = req.body;

        const product = await Product.findOne({
            where: { id, business_id }
        });

        if (!product) {
            return res.status(404).json({
                error: "not_found",
                message: `No se encontró un producto con id ${id}.`
            });
        }

        if ( name !== undefined && name.trim() === "" ) {
            return res.status(400).json({
                error: "validation_error",
                message:  "El campo 'name' no puede estar vacío."
            });
        }

        if ( units !== undefined && !Array.isArray(units) ) {
            return res.status(400).json({
                error: "validation_error",
                message: "El campo 'units' debe ser un arreglo."
            });
        }

        const newType = type_item ?? product.type_item;
        const oldType = product.type_item;
        const oldCategory = product.category;

        const result = await sequelize.transaction(
            async (transaction) => {

                await product.update(
                    {
                        name: name ?? product.name,
                        category: category ??  product.category,
                        type_item: newType,
                        active: active ?? product.active,
                        updated_by: req.user.id
                    },
                    {
                        transaction
                    }
                );

                const updatedUnits = [];

                if (Array.isArray(units)) {
                    for (const productUnit of units) {
                        if ( productUnit.product_unit_id === undefined || productUnit.product_unit_id === null ) {
                            const newUnit = await create({
                                product_id: product.id,
                                branch_id,
                                unit: productUnit.unit,
                                barcode: productUnit.barcode,
                                price: productUnit.price,
                                cost: productUnit.cost,
                                stock: productUnit.stock,
                                hasPromotion: productUnit.hasPromotion,
                                promotionPrice: productUnit.promotionPrice,
                                promotionQuantity: productUnit.promotionQuantity,
                                promotionStart: productUnit.promotionStart,
                                promotionEnd: productUnit.promotionEnd,
                                entryDate: productUnit.entryDate,
                                expirationDate: productUnit.expirationDate,
                                active: productUnit.active,
                                business_id,
                                transaction
                            });
                            updatedUnits.push(newUnit);
                            continue;
                        }
                        const currentUnit = await ProductUnit.findOne({
                            where: {
                                id: productUnit.product_unit_id,
                                product_id: product.id
                            },
                            transaction,
                            lock: transaction.LOCK.UPDATE
                        });

                        if (!currentUnit) {
                            throw new Error("PRODUCT_UNIT_NOT_FOUND");
                        }

                        const oldStock = Number(currentUnit.stock ?? 0);
                        const oldPromotionQuantity =
                            Number(currentUnit.promotionQuantity ?? 0);

                        const newPromotionQuantity =
                            Number(productUnit.promotionQuantity ?? 0);
                        const promotionDifference =
                            newPromotionQuantity - oldPromotionQuantity;
                        const newStock =
                            oldStock - promotionDifference;

                        if (newStock < 0) {
                            throw new Error("INSUFFICIENT_STOCK_FOR_PROMOTION");
                        }
                        const updatedUnit = await update(
                            productUnit.product_unit_id,
                            business_id,
                            {
                                unit: productUnit.unit,
                                barcode: productUnit.barcode,
                                price: productUnit.price,
                                cost: productUnit.cost,
                                stock: newStock,
                                stockChangeSource: "promotion",
                                stockObservation: productUnit.stockObservation,
                                hasPromotion: productUnit.hasPromotion,
                                promotionPrice: productUnit.promotionPrice,
                                promotionQuantity: newPromotionQuantity,
                                promotionStart: productUnit.promotionStart,
                                promotionEnd: productUnit.promotionEnd,
                                entryDate: productUnit.entryDate,
                                expirationDate: productUnit.expirationDate,
                                active: productUnit.active
                            },
                            transaction
                        );

                        if (!updatedUnit) {
                            throw new Error(
                                "PRODUCT_UNIT_NOT_FOUND"
                            );
                        }
                        updatedUnits.push( updatedUnit );
                    }
                }

                if ( oldType !== newType && newType === "Servicio" ) {
                    await resetStockForService(
                        product.id,
                        business_id,
                        transaction
                    );
                }

                return { updatedUnits };
            }
        );

        if ( category !== undefined && oldCategory !== category ) {
            invalidateCategoryCache(
                business_id,
                oldCategory
            );

            invalidateCategoryCache(business_id,category);
        }
        cacheService.del(CacheKeys.DASHBOARDCARDS,business_id);
        cacheService.del(CacheKeys.PROFITABILITY,business_id);
        cacheService.del(CacheKeys.RANKINGMETRICS,business_id);
        cacheService.del(CacheKeys.INVENTORYALERTS,business_id);
        cacheService.del(CacheKeys.PRODUCTSALERTS,business_id);
        cacheService.delOtherByPrefix(CacheKeys.EXPIRINGPRODUCTS,business_id);

        await cacheService.del(
            `${CacheKeys.MARKETING_PRODUCTS_CATEGORY}:${
                category ?? oldCategory
            }`,
            business_id
        );

        const finalUnits =
            await ProductUnit.findAll({
                where: {
                    product_id: product.id
                }
            });

        return res.json({
            ...product.toJSON(),
            units: finalUnits
        });

    } catch (error) {
        if ( error.message === "PRODUCT_UNIT_NOT_FOUND" ) {
            return res.status(404).json({
                error: "product_unit_not_found",
                message: "No se encontró la unidad de medida."
            });
        }

        if ( error.code === "STOCK_REDUCTION_REASON_REQUIRED" ) {
            return res.status(400).json({
                error: "validation_error",
                message: error.message
            });
        }

        if ( error instanceof ValidationError ) {
            return res.status(400).json({
                error: "validation_error",
                message: error.errors.map( err => err.message )
            });
        }

        if ( error instanceof UniqueConstraintError) {
            return res.status(400).json({
                error: "unique_constraint_error",
                message: error.errors.map( err => err.message )
            });
        }

        console.error("updateProduct error:",error);
        return res.status(500).json({
            error: "update_product_error",
            message: "Ocurrió un error inesperado al actualizar el producto."
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const business_id = req.user.business_id;

        const product = await Product.findOne({
            where: {
                id,
                business_id
            }
        });

        if (!product) {
            return res.status(404).json({
                error: "not_found",
                message: `No se encontró un producto con id ${id}.`
            });
        }

        await product.update({
            active: false,
            updated_by: req.user.id
        });

        await deactivateByProduct(
            product.id,
            business_id
        );

        cacheService.del(CacheKeys.DASHBOARDCARDS,req.user.business_id);
        cacheService.del(CacheKeys.PROFITABILITY,req.user.business_id);
        cacheService.del(CacheKeys.RANKINGMETRICS,req.user.business_id);
        cacheService.del(CacheKeys.INVENTORYALERTS,req.user.business_id);
        cacheService.del(CacheKeys.PRODUCTSALERTS,req.user.business_id);
        cacheService.delOtherByPrefix(CacheKeys.EXPIRINGPRODUCTS,req.user.business_id);
        await cacheService.del(
            `${CacheKeys.MARKETING_PRODUCTS_CATEGORY}:${product.category}`,
            req.user.business_id
        );
        clearCategoryCache(req.user.business_id);

        return res.json({
            message: `Producto con id ${id} desactivado correctamente.`
        });

    } catch (error) {
        console.error("[deleteProduct]", error);

        return res.status(500).json({
            error: "delete_product_error",
            message: "Ocurrió un error inesperado al eliminar el producto."
        });
    }
};
export const getProductStats = async (req, res) => {
    const business_id = req.user.business_id;

    try {
        const totalProducts = await Product.count({
            where: { business_id }
        });

        const activeProducts = await Product.count({
            where: {
                business_id,
                active: true
            }
        });

        const totalStock = await getTotalStock(business_id);
        const lowStock = await getLowStock(business_id);

        return res.json({
            totalProducts,
            totalStock,
            activeProducts,
            lowStock
        });

    } catch (error) {
        console.error("getProductStats error:", error);

        return res.status(500).json({
            error: "internal_error",
            message: "Ocurrió un error al obtener las estadísticas de productos."
        });
    }
};

export const getCategories = async (req, res) => {
    try {
        const cached = getCategoryCache(req.user.business_id);

        if (cached) {
            return res.json({
                source: "cache",
                categories: cached
            });
        }

        const categories = await Product.findAll({
            attributes: [
                [fn("DISTINCT", col("category")), "category"]
            ],
            where: {
                business_id:req.user.business_id,
                category: {
                    [Op.ne]: null
                }
            },
            raw: true
        });

        const clean = categories
            .map(c => c.category)
            .filter(Boolean);

        setCategoryCache(req.user.business_id,clean);

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

export const getProductsAutocomplete = async (req, res) => {
    try {
        const { name, barcode } = req.query;

        if (!name && !barcode) {
            return res.json([]);
        }

        const business_id = req.user.business_id;

        const where = {
            active: true,
            business_id
        };

        if (barcode) {
            const products = await Product.findAll({
                where,
                attributes: [
                    "id",
                    "name",
                    "category",
                    "type_item"
                ],
                include: [
                    {
                        model: ProductUnit,
                        as: "units",
                        attributes: [
                            "id", "product_id", "unit", "barcode", "price", 
                            "cost", "stock", "hasPromotion", "promotionPrice",
                            "promotionQuantity", "promotionStart", "promotionEnd", "entryDate",
                            "expirationDate", "active"
                        ],
                        where: {
                            barcode,
                            active: true
                        },
                        required: true
                    }
                ],
                limit: 10
            });

            return res.json(products);
        }

        if (name) {
            where.name = {
                [Op.iLike]: `%${name}%`
            };

            const products = await Product.findAll({
                where,
                attributes: [
                    "id", "name", "category", "type_item"
                ],
                include: [
                    {
                        model: ProductUnit,
                        as: "units",
                        attributes: [
                            "id", "product_id", "unit", "barcode","price",
                            "cost", "stock", "hasPromotion", "promotionPrice",
                            "promotionQuantity", "promotionStart", "promotionEnd",
                            "entryDate", "expirationDate", "active"
                        ],
                        where: {
                            active: true
                        },
                        required: false
                    }
                ],
                limit: 10,
                order: [["name", "ASC"]]
            });

            return res.json(products);
        }

        return res.json([]);

    } catch (error) {
        console.error(
            "getProductsAutocomplete error:",
            error
        );

        return res.status(500).json({
            error: "internal_error",
            message: error.message
        });
    }
};

export const getStockAlerts = async (req, res) => {
    try {
        const alerts = await getCriticalStockProducts(req.user.business_id);

        res.status(200).json({
            success: true,
            data: alerts,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export default { 
    createProduct, getProducts, getProductById, updateProduct, deleteProduct, getProductStats, 
    getCategories, getProductsAutocomplete, getStockAlerts
};