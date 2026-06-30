import Product from "../models/Products.js";
import { Op } from "sequelize";
import { cacheService, CacheTTL, CacheKeys } from "./cache/index.js";

export const getCriticalStockProducts = async () => {
    return await cacheService.remember(
        CacheKeys.PRODUCTSALERTS,
        async () => {
            const attributes = [
                "barcode",
                "name",
                "category",
                "price",
                "stock"
            ];
            const exhausted = await Product.findAll({
                attributes,
                where: {
                    active: true,
                    stock: 0
                }
            });

            const critical = await Product.findAll({
                attributes,
                where: {
                    active: true,
                    stock: {
                        [Op.between]: [1, 5]
                    }
                }
            });

            return {
                exhausted,
                critical
            };

        },
        CacheTTL.FIVE_MINUTES
    );
};