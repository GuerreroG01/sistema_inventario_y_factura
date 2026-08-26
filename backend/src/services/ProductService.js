import Product from "../models/Products.js";
import ProductUnit from "../models/ProductsUnits.js";
import { Op } from "sequelize";
import { cacheService, CacheTTL, CacheKeys } from "./cache/index.js";

export const getCriticalStockProducts = async (business_id) => {
    return await cacheService.remember(
        `${CacheKeys.PRODUCTSALERTS}:${business_id}`,
        async () => {
            const attributes = [
                "id",
                "product_id",
                "unit",
                "barcode",
                "price",
                "stock",
                "hasPromotion",
                "promotionPrice",
                "promotionQuantity",
                "promotionStart",
                "promotionEnd"
            ];

            const productInclude = {
                model: Product,
                as: "product",
                where: {
                    business_id,
                    active: true,
                    type_item: "Producto"
                },
                attributes: [
                    "id",
                    "name",
                    "category"
                ]
            };

            const exhausted = await ProductUnit.findAll({
                attributes,
                where: {
                    active: true,
                    stock: 0
                },
                include: [productInclude],
                order: [["stock", "ASC"]]
            });

            const critical = await ProductUnit.findAll({
                attributes,
                where: {
                    active: true,
                    stock: {
                        [Op.between]: [1, 10]
                    }
                },
                include: [productInclude],
                order: [["stock", "ASC"]]
            });

            return {
                exhausted: exhausted.map(item => item.toJSON()),
                critical: critical.map(item => item.toJSON())
            };
        },
        CacheTTL.ONE_HOUR
    );
};