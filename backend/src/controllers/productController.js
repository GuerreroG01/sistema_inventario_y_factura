import Product from "../models/Product.js";
import { ValidationError, UniqueConstraintError, fn, col, literal, Op } from "sequelize";

const generateBarcode = async () => {
    let barcode;
    let exists = true;

    while (exists) {
        barcode = Math.floor(1000000000000 + Math.random() * 9000000000000).toString();
        const product = await Product.findOne({ where: { barcode } });
        exists = !!product;
    }

    return barcode;
};
const normalizeDate = (value) => {
    if (!value || value === "") return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
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
            barcode = await generateBarcode();
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
        });

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

        const { count, rows: products } = await Product.findAndCountAll({
            order: [['id', 'DESC']],
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
        return res.status(500).json({
            error: "internal_error",
            message: error.message
        });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({
                error: "not_found",
                message: `No se encontró un producto con id ${id}`
            });
        }

        return res.json(product);

    } catch (error) {
        console.error("❌ getProductById error:", error);
        return res.status(500).json({
            error: "internal_error",
            message: "Ocurrió un error al obtener el producto"
        });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, barcode, category, unit, price, cost, stock, entryDate, expirationDate, active } = req.body;

        const product = await Product.findByPk(id);
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
        });

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
        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({
                error: "not_found",
                message: `No se encontró un producto con id ${id}.`
            });
        }

        await product.destroy();

        return res.json({
            message: `Producto con id ${id} eliminado correctamente.`
        });

    } catch (error) {
        return res.status(500).json({
            error: "delete_product_error",
            message: "Ocurrió un error inesperado al eliminar el producto."
        });
    }
};
export const getProductStats = async (req, res) => {
    try {
        const totalProducts = await Product.count();
        const totalStock = await Product.sum('stock');
        const activeProducts = await Product.count({ where: { active: true } });
        const lowStock = await Product.count({ where: { stock: { [Op.between]: [1, 20] } } });

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

export default { createProduct, getProducts, getProductById, updateProduct, deleteProduct, getProductStats };