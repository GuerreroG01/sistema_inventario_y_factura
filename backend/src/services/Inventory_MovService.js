import { Op } from "sequelize";
import InventoryMov from "../models/Inventory_mov.js";
import Product from "../models/Products.js";
import Sales from "../models/Sales.js";

class InventoryMovService {

    static async create({
        product_unit_id,
        tipo,
        cantidad,
        referencia = null,
        observacion = null,
        business_id,
        branch_id
    }, transaction = null) {

        const movement = await InventoryMov.create({
            product_unit_id,
            tipo,
            cantidad,
            referencia,
            observacion,
            business_id,
            branch_id
        }, {
            transaction
        });

        return movement;
    }

    static async getMovements({
        page = 1,
        limit = 10,
        startDate,
        endDate,
        business_id
    }) {

        const offset = (page - 1) * limit;

        const where = {business_id};

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
                    model: ProductUnit,
                    as: "productUnit",
                    include: [
                        {
                            model: Product,
                            as: "product"
                        }
                    ]
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
        product_unit_id,
        quantity,
        business_id
    }, transaction = null) {

        const productUnit = await ProductUnit.findOne({
            where: {
                id: product_unit_id
            },
            include: [
                {
                    model: Product,
                    as: "product",
                    where: {
                        business_id
                    }
                }
            ],
            transaction
        });

        if (!productUnit) {
            throw new Error(
                `Unidad de producto no encontrada: ${product_unit_id}`
            );
        }

        const newStock = Number(productUnit.stock) + Number(quantity);

        if (newStock < 0) {
            throw new Error(
                `Stock insuficiente para unidad de producto ${product_unit_id}`
            );
        }

        await productUnit.update({
            stock: newStock
        }, { transaction });

        return productUnit;
    }
}

export default InventoryMovService;