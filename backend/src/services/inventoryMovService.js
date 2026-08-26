import Inventory_mov from "../models/Inventory_mov.js";
import ProductUnit from "../models/ProductsUnits.js";
import Product from "../models/Products.js";
import { Op } from "sequelize";

export const getInventoryMovements = async ({
    page = 1, limit = 10, product, tipo, startDate, endDate, referencia, cantidadMin, cantidadMax
} = {}, businessId) => {

    page = Number(page);
    limit = Number(limit);
    const offset = (page - 1) * limit;

    const where = {
        business_id: businessId
    };
    if (tipo) {
        where.tipo = tipo;
    }
    if (referencia) {
        where.referencia = referencia;
    }
    if (cantidadMin !== undefined || cantidadMax !== undefined) {

        where.cantidad = {};

        if (cantidadMin !== undefined) {
            where.cantidad[Op.gte] = Number(cantidadMin);
        }

        if (cantidadMax !== undefined) {
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
    const productWhere = {
        business_id: businessId
    };
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
            "referencia",
            "observacion",
            "product_unit_id"
        ],

        where,

        include: [
            {
                model: ProductUnit,
                as: "productUnit",
                attributes: [
                    "id",
                    "product_id",
                    "unit"
                ],
                required: true,

                include: [
                    {
                        model: Product,
                        as: "product",
                        attributes: [
                            "id",
                            "name"
                        ],
                        where: productWhere,
                        required: true
                    }
                ]
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
            totalPages: Math.ceil(count / limit)
        }
    };
};