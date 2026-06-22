import { Op } from "sequelize";
import InventoryMov from "../models/Inventory_mov.js";
import Product from "../models/Product.js";
import Sales from "../models/Sales.js";

class InventoryMovService {

    static async create({
        product_id,
        tipo,
        cantidad,
        referencia = null,
        observacion = null
    }, transaction = null) {

        const movement = await InventoryMov.create({
            product_id,
            tipo,
            cantidad,
            referencia,
            observacion
        }, {
            transaction
        });

        return movement;
    }

    static async getMovements({
        page = 1,
        limit = 10,
        startDate,
        endDate
    }) {

        const offset = (page - 1) * limit;

        const where = {};

        if (startDate && endDate) {
            where.fecha = {
                [Op.between]: [startDate, endDate]
            };
        } else if (startDate) {
            where.fecha = {
                [Op.gte]: startDate
            };
        } else if (endDate) {
            where.fecha = {
                [Op.lte]: endDate
            };
        }

        const { count, rows } = await InventoryMov.findAndCountAll({
            where,
            limit,
            offset,
            order: [["fecha", "DESC"]],
            include: [
                {
                    model: Product,
                    as: "product"
                },
                {
                    model: Sales,
                    as: "sale"
                }
            ]
        });

        return {
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            }
        };
    }
    static async updateStockOnly({
        product_id,
        quantity
    }, transaction = null) {

        const product = await Product.findByPk(product_id, { transaction });

        if (!product) {
            throw new Error(`Producto no encontrado: ${product_id}`);
        }

        const newStock = Number(product.stock) + Number(quantity);

        if (newStock < 0) {
            throw new Error(`Stock insuficiente para producto ${product_id}`);
        }

        await product.update({
            stock: newStock
        }, { transaction });

        return product;
    }
}

export default InventoryMovService;