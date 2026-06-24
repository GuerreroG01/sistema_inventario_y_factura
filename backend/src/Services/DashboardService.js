import { Op, QueryTypes } from "sequelize";
import db from "../config/database.js";
import Sales from "../models/Sales.js";
import Product from "../models/Products.js";

export const getDashboardMetrics = async () => {
    const warnings = [];
    const errors = [];

    const response = {
        ventasHoy: 0,
        ventasMes: 0,
        ganancia: 0,
        stockBajo: 0,
        productosActivos: 0,
    };

    try {
        const now = new Date();

        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );
        try {
            const ventas = await Sales.findOne({
                attributes: [
                    [
                        db.literal(`
                            COALESCE(
                                SUM(
                                    CASE 
                                        WHEN fecha >= '${startOfDay.toISOString()}'
                                        THEN total
                                        ELSE 0
                                    END
                                ),0
                            )
                        `),
                        "ventasHoy",
                    ],
                    [
                        db.literal(`
                            COALESCE(
                                SUM(
                                    CASE 
                                        WHEN fecha >= '${startOfMonth.toISOString()}'
                                        THEN total
                                        ELSE 0
                                    END
                                ),0
                            )
                        `),
                        "ventasMes",
                    ],
                ],
                raw: true,
            });

            if (!ventas) {
                warnings.push("No se encontraron registros de ventas");
            } else {
                response.ventasHoy = Number(ventas.ventasHoy || 0);
                response.ventasMes = Number(ventas.ventasMes || 0);
            }
        } catch (error) {
            errors.push({
                module: "ventas",
                message: error.message,
            });
        }
        try {
            response.productosActivos = await Product.count({
                where: {
                    active: true,
                },
            });

            if (response.productosActivos === 0) {
                warnings.push("No existen productos activos");
            }
        } catch (error) {
            console.error(
                "[DashboardService] Error productos activos",
                error
            );

            errors.push({
                module: "productosActivos",
                message: error.message,
            });
        }
        try {
            response.stockBajo = await Product.count({
                where: {
                    active: true,
                    stock: {
                        [Op.lte]: 5,
                    },
                },
            });
        } catch (error) {
            console.error(
                "[DashboardService] Error stock bajo",
                error
            );

            errors.push({
                module: "stockBajo",
                message: error.message,
            });
        }
        try {
            const result = await db.query(
                `
                SELECT
                    COALESCE(
                        SUM(
                            (sd.precio_unitario - p.cost)
                            * sd.cantidad
                        ),
                        0
                    ) AS ganancia
                FROM "SaleDetails" sd
                INNER JOIN "Products" p
                    ON p.id = sd.product_id
                `,
                {
                    type: QueryTypes.SELECT,
                }
            );

            response.ganancia = Number(
                result?.[0]?.ganancia || 0
            );

            if (!result?.length) {
                warnings.push(
                    "No se encontraron datos para calcular la ganancia"
                );
            }
        } catch (error) {
            console.error(
                "[DashboardService] Error ganancia",
                error
            );

            errors.push({
                module: "ganancia",
                message: error.message,
            });
        }

        return {
            success: errors.length === 0,
            data: response,
            warnings,
            errors,
        };
    } catch (error) {
        console.error(
            "[DashboardService] ❌ Error general",
            error
        );

        return {
            success: false,
            data: response,
            warnings,
            errors: [
                {
                    module: "dashboard",
                    message: error.message,
                },
            ],
        };
    }
};