import { Op, QueryTypes } from "sequelize";
import db from "../config/database.js";
import Sales from "../models/Sales.js";
import Product from "../models/Products.js";
import { cacheService, CacheKeys, CacheTTL } from "./cache/index.js";

export const getDashboardMetrics = async () => {
    return cacheService.remember(
        CacheKeys.DASHBOARDCARDS,
        async () => {
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
                    const ventasHoy = await Sales.sum("total", {
                        where: {
                            fecha: {
                                [Op.gte]: startOfDay,
                            },
                            status: {
                                [Op.in]: ["COMPLETED", "PAID"/*, "PENDING"*/],
                            },
                        },
                    });

                    const ventasMes = await Sales.sum("total", {
                        where: {
                            fecha: {
                                [Op.gte]: startOfMonth,
                            },
                            status: {
                                [Op.in]: ["COMPLETED", "PAID"/*, "PENDING"*/],
                            },
                        },
                    });

                    response.ventasHoy = Number(ventasHoy ?? 0);
                    response.ventasMes = Number(ventasMes ?? 0);

                    if (ventasHoy === null && ventasMes === null) {
                        warnings.push("No se encontraron registros de ventas");
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
                        "[getDashboardMetrics] Error productos activos",
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
                        "[getDashboardMetrics] Error stock bajo",
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
                                SUM((sd.precio_unitario - p.cost) * sd.cantidad),
                                0
                            ) AS ganancia
                        FROM "SaleDetails" sd
                        INNER JOIN "Products" p
                            ON p.id = sd.product_id
                        INNER JOIN "Sales" s
                            ON s.id = sd.sale_id
                        WHERE s.status NOT IN ('PENDING', 'REFUNDED', 'CANCELLED')
                        `,
                        {
                            type: QueryTypes.SELECT,
                        }
                    );

                    response.ganancia = Number(result?.[0]?.ganancia ?? 0);

                    if (response.ganancia === 0) {
                        warnings.push(
                            "No se encontraron datos para calcular la ganancia"
                        );
                    }
                } catch (error) {
                    console.error(
                        "[getDashboardMetrics] Error ganancia",
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
                    "[getDashboardMetrics]: Error general",
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
        },
        CacheTTL.ONE_HOUR
    );
};
export const getProfitabilityMetrics = async (month, year) => {
    const warnings = [];
    const errors = [];

    const response = {
        ventas: 0,
        costos: 0,
        gastos: 0,
        ganancia: 0,
        margen: 0,
        ratioRetornoCosto: 0,
        roi: 0,
    };

    try {
        // Ventas + costo de productos
        const salesResult = await db.query(
            `
            SELECT
                COALESCE(SUM(total), 0) AS ventas
            FROM "Sales"
            WHERE status IN ('COMPLETED', 'PAID')
                AND EXTRACT(MONTH FROM "createdAt") = :month
                AND EXTRACT(YEAR FROM "createdAt") = :year
            `,
            {
                replacements: { month, year },
                type: QueryTypes.SELECT,
            }
        );

        // Gastos adicionales (Expenses)
        const expensesResult = await db.query(
            `
            SELECT COALESCE(SUM(amount), 0) AS gastos
            FROM "Expenses"
            WHERE EXTRACT(MONTH FROM date) = :month
                AND EXTRACT(YEAR FROM date) = :year
            `,
            {
                replacements: { month, year },
                type: QueryTypes.SELECT,
            }
        );

        const ventas = Number(salesResult[0]?.ventas || 0);
        const gastos = Number(expensesResult[0]?.gastos || 0);

        const costosTotales = gastos;

        const ganancia = ventas - costosTotales;

        const margen = ventas > 0 ? (ganancia / ventas) * 100 : 0;

        const ratioRetornoCosto = costosTotales > 0
            ? ganancia / costosTotales
            : 0;

        const roi = costosTotales > 0
            ? (ganancia / costosTotales) * 100
            : 0;

        response.ventas = Number(ventas.toFixed(2));
        response.costos = Number(costosTotales.toFixed(2));
        response.gastos = Number(gastos.toFixed(2));
        response.ganancia = Number(ganancia.toFixed(2));
        response.margen = Number(margen.toFixed(2));
        response.ratioRetornoCosto = Number(ratioRetornoCosto.toFixed(2));
        response.roi = Number(roi.toFixed(2));

        if (ventas === 0) {
            warnings.push("No existen ventas registradas para el período seleccionado");
        }

        return {
            success: true,
            data: response,
            warnings,
            errors,
        };

    } catch (error) {
        console.error("[getProfitabilityMetrics] Error rentabilidad", error);

        return {
            success: false,
            data: response,
            warnings,
            errors: [
                {
                    module: "rentabilidad",
                    message: error.message,
                },
            ],
        };
    }
};

export const getProfitabilityTrendMetrics = async () => {

    const key = `${CacheKeys.PROFITABILITY}`;

    return cacheService.remember(key, async () => {
        try {
            const today = new Date();

            const month = today.getMonth() + 1;
            const year = today.getFullYear();

            const current = await getProfitabilityMetrics(month, year);

            let previousMonth = month - 1;
            let previousYear = year;

            if (previousMonth === 0) {
                previousMonth = 12;
                previousYear--;
            }

            const previous = await getProfitabilityMetrics(previousMonth, previousYear);

            const calculateTrend = (currentValue, previousValue) => {
                if (previousValue === 0) {
                    return {
                        change: currentValue,
                        percentage: currentValue > 0 ? 100 : 0,
                        direction: currentValue > 0 ? "up" : "neutral",
                    };
                }

                const change = currentValue - previousValue;
                const percentage = (change / previousValue) * 100;

                return {
                    change: Number(change.toFixed(2)),
                    percentage: Number(percentage.toFixed(2)),
                    direction:
                        change > 0
                            ? "up"
                            : change < 0
                                ? "down"
                                : "neutral",
                };
            };

            return {
                success: true,
                data: {
                    current: current.data,
                    previous: previous.data,
                    trend: {
                        ventas: calculateTrend(
                            current.data.ventas,
                            previous.data.ventas
                        ),
                        costos: calculateTrend(
                            current.data.costos,
                            previous.data.costos
                        ),
                        ganancia: calculateTrend(
                            current.data.ganancia,
                            previous.data.ganancia
                        ),
                        margen: calculateTrend(
                            current.data.margen,
                            previous.data.margen
                        ),
                        ratioRetornoCosto: calculateTrend(
                            current.data.ratioRetornoCosto,
                            previous.data.ratioRetornoCosto
                        ),
                        roi: calculateTrend(
                            current.data.roi,
                            previous.data.roi
                        ),
                    },
                },
                warnings: [
                    ...(current.warnings || []),
                    ...(previous.warnings || []),
                ],
                errors: [],
            };

        } catch (error) {
            console.error("[getProfitabilityTrendMetrics] Error trend", error);

            return {
                success: false,
                data: null,
                warnings: [],
                errors: [
                    {
                        module: "rentabilidad_trend",
                        message: error.message,
                    },
                ],
            };
        }
    }, CacheTTL.ONE_HOUR);
};

export const getSalesRankingMetrics = async () => {
    const key = CacheKeys.RANKINGMETRICS;

    return cacheService.remember(key, async () => {
        const warnings = [];
        const errors = [];

        const response = {
            topProductos: [],
            topCategorias: [],
        };

        try {
            try {
                const productos = await db.query(
                    `
                    SELECT
                        p.name AS producto,

                        COALESCE(SUM(sd.cantidad), 0) AS "unidadesVendidas",
                        COALESCE(SUM(sd.subtotal), 0) AS ingresos

                    FROM "SaleDetails" sd
                    INNER JOIN "Products" p
                        ON p.id = sd.product_id
                    INNER JOIN "Sales" s
                        ON s.id = sd.sale_id
                    WHERE s.status = 'COMPLETED'
                    GROUP BY p.id, p.name
                    ORDER BY "unidadesVendidas" DESC
                    LIMIT 5
                    `,
                    { type: QueryTypes.SELECT }
                );

                response.topProductos = productos.map((item, index) => ({
                    posicion: index + 1,
                    producto: item.producto,
                    unidadesVendidas: Number(item.unidadesVendidas),
                    ingresos: Number(Number(item.ingresos).toFixed(2)),
                }));
            } catch (error) {
                errors.push({
                    module: "topProductos",
                    message: error.message,
                });
            }

            try {
                const categorias = await db.query(
                    `
                    SELECT
                        COALESCE(p.category, 'Sin categoría') AS categoria,
                        COALESCE(SUM(sd.subtotal), 0) AS ventas
                    FROM "SaleDetails" sd
                    INNER JOIN "Products" p
                        ON p.id = sd.product_id
                    INNER JOIN "Sales" s
                        ON s.id = sd.sale_id
                    WHERE s.status = 'COMPLETED'
                    GROUP BY p.category
                    ORDER BY ventas DESC
                    LIMIT 5
                    `,
                    { type: QueryTypes.SELECT }
                );

                response.topCategorias = categorias.map((item, index) => ({
                    posicion: index + 1,
                    categoria: item.categoria,
                    ventas: Number(Number(item.ventas).toFixed(2)),
                }));
            } catch (error) {
                errors.push({
                    module: "topCategorias",
                    message: error.message,
                });
            }

            if (
                response.topProductos.length === 0 &&
                response.topCategorias.length === 0
            ) {
                warnings.push(
                    "No existen datos de ventas para generar rankings"
                );
            }

            return {
                success: errors.length === 0,
                data: response,
                warnings,
                errors,
            };

        } catch (error) {
            console.error("[getSalesRankingMetrics] Error ranking ventas", error);

            return {
                success: false,
                data: response,
                warnings,
                errors: [
                    {
                        module: "rankingVentas",
                        message: error.message,
                    },
                ],
            };
        }

    }, CacheTTL.ONE_HOUR);
};
export const getInventoryAlertsMetrics = async () => {
    const key = CacheKeys.INVENTORYALERTS;

    return cacheService.remember(key, async () => {
        const warnings = [];
        const errors = [];

        const response = {
            stockCritico: 0,
            agotados: 0,
        };

        try {
            try {
                response.stockCritico = await Product.count({
                    where: {
                        active: true,
                        stock: {
                            [Op.gt]: 0,
                            [Op.lte]: 5,
                        },
                    },
                });
            } catch (error) {
                errors.push({
                    module: "stockCritico",
                    message: error.message,
                });
            }

            try {
                response.agotados = await Product.count({
                    where: {
                        active: true,
                        stock: 0,
                    },
                });
            } catch (error) {
                errors.push({
                    module: "agotados",
                    message: error.message,
                });
            }

            if (
                response.stockCritico === 0 &&
                response.agotados === 0
            ) {
                warnings.push("No existen alertas de inventario");
            }

            return {
                success: errors.length === 0,
                data: response,
                warnings,
                errors,
            };

        } catch (error) {
            console.error("[getInventoryAlertsMetrics] Error alertas inventario", error);

            return {
                success: false,
                data: response,
                warnings,
                errors: [
                    {
                        module: "inventario",
                        message: error.message,
                    },
                ],
            };
        }

    }, CacheTTL.ONE_HOUR);
};
export const getExpiringProductsMetrics = async (page = 1, limit = 10) => {
    const key = `${CacheKeys.EXPIRINGPRODUCTS}:${page}:${limit}`;

    return cacheService.remember(key, async () => {
        const warnings = [];
        const errors = [];

        const response = {
            products: [],
            pagination: {
                page,
                limit,
                total: 0,
                totalPages: 0,
            },
        };

        try {
            const offset = (page - 1) * limit;

            const total = await Product.count({
                where: {
                    active: true,
                    expirationDate: {
                        [Op.lte]: db.literal("CURRENT_DATE + INTERVAL '30 days'"),
                        [Op.gte]: db.literal("CURRENT_DATE"),
                    },
                    stock: {
                        [Op.ne]: 0,
                    },
                },
            });

            response.pagination.total = total;
            response.pagination.totalPages = Math.ceil(total / limit);

            const products = await Product.findAll({
                where: {
                    active: true,
                    expirationDate: {
                        [Op.lte]: db.literal("CURRENT_DATE + INTERVAL '30 days'"),
                        [Op.gte]: db.literal("CURRENT_DATE"),
                    },
                    stock: {
                        [Op.ne]: 0,
                    },
                },
                attributes: [
                    "id",
                    "name",
                    "barcode",
                    "category",
                    "stock",
                    "expirationDate",
                ],
                order: [["expirationDate", "ASC"]],
                limit,
                offset,
            });

            response.products = products.map(product => ({
                id: product.id,
                nombre: product.name,
                codigo: product.barcode,
                categoria: product.category,
                stock: product.stock,
                fechaVencimiento: product.expirationDate,
            }));

            if (products.length === 0) {
                warnings.push("No existen productos próximos a vencer");
            }

            return {
                success: errors.length === 0,
                data: response,
                warnings,
                errors,
            };

        } catch (error) {
            console.error("[getExpiringProductsMetrics] Error productos próximos a vencer", error);

            return {
                success: false,
                data: response,
                warnings,
                errors: [
                    {
                        module: "productosVencimiento",
                        message: error.message,
                    },
                ],
            };
        }

    }, CacheTTL.ONE_HOUR);
};