import Product from "../models/Products.js";
import { ValidationError, UniqueConstraintError, fn, col, literal, Op, where } from "sequelize";
import { normalizeDate } from "../utils/formatters.js"
import { invalidateCategoryCache, clearCategoryCache, getCategoryCache, setCategoryCache  } from "../utils/categoryCache.js";
import InventoryMovService from "../Services/Inventory_MovService.js";
import { cacheService, CacheKeys } from "../services/cache/index.js";
import { getCriticalStockProducts } from "../services/ProductService.js";

const generateBarcode = async (business_id) => {
    let barcode;
    let exists = true;

    while (exists) {
        barcode = Math.floor(1000000000000 + Math.random() * 9000000000000).toString();
        const product = await Product.findOne({ where: { barcode, business_id } });
        exists = !!product;
    }

    return barcode;
};

export const createProduct = async (req, res) => {
    try {
        let { name, barcode, category, unit, price, cost, stock, entryDate, expirationDate, active } = req.body;

        if (!name || name.trim() === "") {
            return res.status(400).json({
                error: "validation_error",
                message: "El campo 'name' es obligatorio."
            });
        }

        if (price === undefined || isNaN(price)) {
            return res.status(400).json({
                error: "validation_error",
                message: "El campo 'price' es obligatorio y debe ser un número."
            });
        }

        if (!barcode || barcode.trim() === "") {
            barcode = await generateBarcode(req.user.business_id);
        }

        const product = await Product.create({
            name,
            barcode,
            category,
            unit,
            price,
            cost,
            stock,
            entryDate: normalizeDate(entryDate),
            expirationDate: normalizeDate(expirationDate),
            active,
            created_by: req.user.id,
            updated_by: req.user.id,
            business_id: req.user.business_id
        });

        if (stock && Number(stock) > 0) {
            await InventoryMovService.create({
                product_id: product.id,
                tipo: "entrada",
                cantidad: stock,
                observacion: null,
                business_id: req.user.business_id
            });
        }

        invalidateCategoryCache(req.user.business_id,category);
        cacheService.del(CacheKeys.DASHBOARDCARDS,req.user.business_id);
        cacheService.del(CacheKeys.PROFITABILITY,req.user.business_id);
        cacheService.del(CacheKeys.RANKINGMETRICS,req.user.business_id);
        cacheService.del(CacheKeys.INVENTORYALERTS,req.user.business_id);
        cacheService.del(CacheKeys.PRODUCTSALERTS,req.user.business_id);
        cacheService.delOtherByPrefix(CacheKeys.EXPIRINGPRODUCTS,req.user.business_id);
        return res.status(201).json(product);

    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({
                error: "validation_error",
                message: error.errors.map(err => err.message)
            });
        }

        if (error instanceof UniqueConstraintError) {
            return res.status(400).json({
                error: "unique_constraint_error",
                message: error.errors.map(err => err.message)
            });
        }

        return res.status(500).json({
            error: "create_product_error",
            message: "Ocurrió un error inesperado al crear el producto."
        });
    }
};

export const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const { name, barcode, category, active, priceMin, priceMax, costMin, costMax } = req.query;
        const where = {business_id: req.user.business_id};

        if (name) {
            where.name = {
                [Op.iLike]: `%${name}%`
            };
        }

        if (barcode) {
            where.barcode = barcode;
        }

        if (category) {
            where.category = category;
        }

        if (active !== undefined) {
            where.active = active === "true";
        }

        if (priceMin || priceMax) {
            where.price = {};
            if (priceMin) {
                where.price[Op.gte] = parseFloat(priceMin);
            }
            if (priceMax) {
                where.price[Op.lte] = parseFloat(priceMax);
            }
        }

        if (costMin || costMax) {
            where.cost = {};
            if (costMin) {
                where.cost[Op.gte] = parseFloat(costMin);
            }
            if (costMax) {
                where.cost[Op.lte] = parseFloat(costMax);
            }
        }

        const { count, rows: products } = await Product.findAndCountAll({
            where,
            order: [["id", "DESC"]],
            limit,
            offset
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

        const product = await Product.findOne({
            where:{
                id,
                business_id:req.user.business_id
            }
        });

        if (!product) {
            return res.status(404).json({
                error: "not_found",
                message: `No se encontró un producto con id ${id}`
            });
        }

        return res.json(product);

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
        const { name, barcode, category, unit, price, cost, stock, entryDate, expirationDate, active, stockObservation } = req.body;

        const product = await Product.findOne({
            where:{
                id,
                business_id:req.user.business_id
            }
        });
        if (!product) {
            return res.status(404).json({
                error: "not_found",
                message: `No se encontró un producto con id ${id}.`
            });
        }

        if (name !== undefined && name.trim() === "") {
            return res.status(400).json({
                error: "validation_error",
                message: "El campo 'name' no puede estar vacío."
            });
        }

        if (price !== undefined && isNaN(price)) {
            return res.status(400).json({
                error: "validation_error",
                message: "El campo 'price' debe ser un número válido."
            });
        }

        const oldStock = product.stock;
        const oldCategory = product.category;

        if (stock !== undefined && Number(stock) !== Number(oldStock)) {

            const diff = Number(stock) - Number(oldStock);

            if (diff < 0 && (!stockObservation || stockObservation.trim() === "")) {
                return res.status(400).json({
                    error: "validation_error",
                    message: "Debe ingresar una razón cuando se reduce el inventario."
                });
            }

            await InventoryMovService.create({
                product_id: product.id,
                tipo: "ajuste",
                cantidad: diff,
                observacion: diff < 0
                    ? stockObservation
                    : "Aumento manual de stock",
                business_id: req.user.business_id
            });
        }
        await product.update({
            name: name ?? product.name,
            barcode: barcode ?? product.barcode,
            category: category ?? product.category,
            unit: unit ?? product.unit,
            price: price ?? product.price,
            cost: cost ?? product.cost,
            stock: stock ?? product.stock,
            entryDate: normalizeDate(entryDate) ?? product.entryDate,
            expirationDate: normalizeDate(expirationDate) ?? product.expirationDate,
            active: active ?? product.active,
            updated_by: req.user.id
        });

        if (category !== undefined && oldCategory !== product.category) {
            invalidateCategoryCache(
                req.user.business_id,
                category
            );
        }
        cacheService.del(CacheKeys.DASHBOARDCARDS,req.user.business_id);
        cacheService.del(CacheKeys.PROFITABILITY,req.user.business_id);
        cacheService.del(CacheKeys.RANKINGMETRICS,req.user.business_id);
        cacheService.del(CacheKeys.INVENTORYALERTS,req.user.business_id);
        cacheService.del(CacheKeys.PRODUCTSALERTS,req.user.business_id);
        cacheService.delOtherByPrefix(CacheKeys.EXPIRINGPRODUCTS,req.user.business_id);
        return res.json(product);

    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({
                error: "validation_error",
                message: error.errors.map(err => err.message)
            });
        }

        if (error instanceof UniqueConstraintError) {
            return res.status(400).json({
                error: "unique_constraint_error",
                message: error.errors.map(err => err.message)
            });
        }

        return res.status(500).json({
            error: "update_product_error",
            message: "Ocurrió un error inesperado al actualizar el producto."
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findOne({
            where:{
                id,
                business_id:req.user.business_id
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

        cacheService.del(CacheKeys.DASHBOARDCARDS,req.user.business_id);
        cacheService.del(CacheKeys.PROFITABILITY,req.user.business_id);
        cacheService.del(CacheKeys.RANKINGMETRICS,req.user.business_id);
        cacheService.del(CacheKeys.INVENTORYALERTS,req.user.business_id);
        cacheService.del(CacheKeys.PRODUCTSALERTS,req.user.business_id);
        cacheService.delOtherByPrefix(CacheKeys.EXPIRINGPRODUCTS,req.user.business_id);
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
        const totalProducts = await Product.count({where:{business_id}});
        const totalStock = await Product.sum('stock',{where:{business_id}});
        const activeProducts = await Product.count({ where: { business_id, active: true } });
        const lowStock = await Product.count({ where: { business_id, stock: { [Op.between]: [1, 20] } } });

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

        const where = {
            active: true,
            business_id:req.user.business_id
        };

        if (barcode) {
            where.barcode = barcode;

            const products = await Product.findAll({
                where,
                attributes: ["id", "name", "barcode", "price", "stock", "category"],
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
                attributes: ["id", "name", "barcode", "price", "stock", "category"],
                limit: 10,
                order: [["name", "ASC"]]
            });

            return res.json(products);
        }
        return res.json([]);
    } catch (error) {
        console.error("getProductsAutocomplete error:", error);
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