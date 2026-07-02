import Inventory_mov from "../models/Inventory_mov.js";
import Product from "../models/Products.js";
import { Op } from "sequelize";

export const getInventoryMovements = async ({
    page = 1, limit = 10, product, tipo, startDate, endDate, referencia, cantidadMin,
    cantidadMax } = {}) => {

    page = Number(page);
    limit = Number(limit);
    const offset = (page - 1) * limit;
    const where = {};
    const productWhere = {};

    if (tipo) {
        where.tipo = tipo;
    }
    if (referencia) {
        where.referencia = referencia;
    }
    if (cantidadMin || cantidadMax) {

        where.cantidad = {};

        if (cantidadMin) {
            where.cantidad[Op.gte] = Number(cantidadMin);
        }

        if (cantidadMax) {
            where.cantidad[Op.lte] = Number(cantidadMax);
        }
    }
    if (startDate || endDate) {

        where.fecha = {};

        if (startDate) {
            where.fecha[Op.gte] = new Date(startDate);
        }

        if (endDate) {
            where.fecha[Op.lte] = new Date(
                `${endDate}T23:59:59`
            );
        }
    }
    if (product) {

        productWhere.name = {
            [Op.iLike]: `%${product}%`
        };

    }
    const { count, rows } = await Inventory_mov.findAndCountAll({
        attributes: [
            "id",
            "tipo",
            "cantidad",
            "fecha",
            "referencia"
        ],
        where,
        include: [
            {
                model: Product,
                as: "products",
                attributes: [
                    "id",
                    "name"
                ],
                where: Object.keys(productWhere).length
                    ? productWhere
                    : undefined
            }
        ],
        limit,
        offset,
        order: [
            ["fecha", "DESC"]
        ],

        distinct: true
    });

    return {
        data: rows,
        pagination: {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(
                count / limit
            )
        }
    };
};