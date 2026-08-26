import { Op, QueryTypes } from "sequelize";
import db from "../config/database.js";
import Sales from "../models/Sales.js";
import Product from "../models/Products.js";
import ProductUnit from "../models/ProductsUnits.js";
import { cacheService, CacheKeys, CacheTTL } from "./cache/index.js";
import { getMonthDateRange} from "../utils/getMonthDateRange.js"

export const getDashboardMetrics = async (businessId) => {
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

                const endOfDay = new Date(now);
                endOfDay.setHours(23, 59, 59, 999);

                const {
                    startDate: startOfMonth,
                    endDate: startOfNextMonth,
                } = getMonthDateRange(
                    now.getMonth() + 1,
                    now.getFullYear()
                );
                try {
                    const ventasHoy = await Sales.sum("total", {
                        where: {
                            business_id: businessId,
                            paidAt: {
                                [Op.gte]: startOfDay,
                                [Op.lt]: endOfDay,
                            },
                            status: {
                                [Op.in]: ["COMPLETED", "PAID"],
                            },
                        },
                    });

                    const ventasMes = await Sales.sum("total", {
                        where: {
                            business_id: businessId,
                            paidAt: {
                                [Op.gte]: startOfMonth,
                                [Op.lt]: startOfNextMonth,
                            },
                            status: {
                                [Op.in]: ["COMPLETED", "PAID"],
                            },
                        },
                    });

                    response.ventasHoy = Number(ventasHoy ?? 0);
                    response.ventasMes = Number(ventasMes ?? 0);

                    if (ventasHoy === null && ventasMes === null) {
                        warnings.push( "No se encontraron registros de ventas" );
                    }
                } catch (error) {
                    console.error( "[getDashboardMetrics] Error ventas", error );
                    errors.push({ module: "ventas", message: error.message });
                }
                try {
                    response.productosActivos = await Product.count({
                        where: {
                            business_id: businessId,
                            active: true,
                        },
                    });

                    if (response.productosActivos === 0) {
                        warnings.push( "No existen productos activos" );
                    }
                } catch (error) {
                    console.error( "[getDashboardMetrics] Error productos activos", error );
                    errors.push({ module: "productosActivos", message: error.message });
                }
                try {
                    response.stockBajo = await ProductUnit.count({
                        where: {
                            stock: {
                                [Op.lte]: 5,
                            },
                        },

                        include: [
                            {
                                model: Product,
                                as: "product",
                                attributes: [],
                                required: true,

                                where: {
                                    business_id: businessId,
                                    active: true,
                                },
                            },
                        ],
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
                                SUM(
                                    (
                                        sd.precio_unitario
                                        - COALESCE(pu.cost, 0)
                                    ) * sd.cantidad
                                ),
                                0
                            ) AS ganancia

                        FROM "SaleDetails" sd
                        INNER JOIN "ProductsUnits" pu
                            ON pu.id = sd.product_unit_id
                        INNER JOIN "Products" p
                            ON p.id = pu.product_id
                        INNER JOIN "Sales" s
                            ON s.id = sd.sale_id
                        WHERE s.business_id = :businessId
                        AND p.business_id = :businessId
                        AND s.status IN ('PAID', 'COMPLETED')
                        AND s."paidAt" >= :startOfMonth
                        AND s."paidAt" < :startOfNextMonth
                        `,
                        {
                            replacements: {
                                businessId,
                                startOfMonth,
                                startOfNextMonth,
                            },

                            type: QueryTypes.SELECT,
                        }
                    );
                    response.ganancia = Number( result?.[0]?.ganancia ?? 0 );

                    if (response.ganancia === 0) {
                        warnings.push( "No se encontraron datos para calcular la ganancia" );
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
                console.error( "[getDashboardMetrics]: Error general", error );

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
        CacheTTL.ONE_HOUR, businessId
    );
};
export const getProfitabilityMetrics = async (month, year, businessId) => {
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
        const { startDate, endDate } = getMonthDateRange(month, year);

        const salesResult = await db.query(
            `
            SELECT
                COALESCE(SUM(total), 0) AS ventas
            FROM "Sales"
            WHERE business_id = :businessId
                AND status IN ('COMPLETED', 'PAID')
                AND "paidAt" >= :startDate
                AND "paidAt" < :endDate
            `,
            {
                replacements: {
                    businessId,
                    startDate,
                    endDate,
                },
                type: QueryTypes.SELECT,
            }
        );

        const expensesResult = await db.query(
            `
            SELECT
                COALESCE(SUM(amount), 0) AS gastos
            FROM "Expenses"
            WHERE business_id = :businessId
                AND date >= :startDate
                AND date < :endDate
                AND status = 'Activo'
            `,
            {
                replacements: {
                    businessId,
                    startDate,
                    endDate,
                },
                type: QueryTypes.SELECT,
            }
        );

        const ventas = Number(salesResult[0]?.ventas || 0);
        const gastos = Number(expensesResult[0]?.gastos || 0);

        const costosTotales = gastos;

        const ganancia = ventas - costosTotales;

        const margen = ventas > 0
            ? (ganancia / ventas) * 100
            : 0;

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
            warnings.push("No existen ventas cobradas para el período seleccionado");
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

export const getProfitabilityTrendMetrics = async (businessId) => {

    const key = `${CacheKeys.PROFITABILITY}`;

    return cacheService.remember(key, async () => {
        try {
            const today = new Date();

            const month = today.getMonth() + 1;
            const year = today.getFullYear();

            const current = await getProfitabilityMetrics(month, year, businessId);

            let previousMonth = month - 1;
            let previousYear = year;

            if (previousMonth === 0) {
                previousMonth = 12;
                previousYear--;
            }

            const previous = await getProfitabilityMetrics(previousMonth, previousYear, businessId);

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
    }, CacheTTL.ONE_HOUR, businessId);
};

export const getSalesRankingMetrics = async (businessId) => {
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
                        p.id AS "productId",
                        p.name AS producto,
                        COALESCE(SUM(sd.cantidad), 0) AS "unidadesVendidas",
                        COALESCE(SUM(sd.subtotal), 0) AS ingresos
                    FROM "SaleDetails" sd
                    INNER JOIN "ProductsUnits" pu
                        ON pu.id = sd.product_unit_id
                    INNER JOIN "Products" p
                        ON p.id = pu.product_id
                    INNER JOIN "Sales" s
                        ON s.id = sd.sale_id
                    WHERE s.business_id = :businessId
                      AND s.status = 'COMPLETED'
                    GROUP BY p.id, p.name
                    ORDER BY "unidadesVendidas" DESC
                    LIMIT 5
                    `,
                    {
                        replacements: {
                            businessId,
                        },
                        type: QueryTypes.SELECT,
                    }
                );
                if (productos.length > 0) {
                    const productIds = productos.map(
                        (item) => item.productId
                    );
                    const unidades = await db.query(
                        `
                        SELECT
                            p.id AS "productId",
                            pu.id AS "productUnitId",
                            pu.unit AS unit,
                            COALESCE(SUM(sd.cantidad), 0) AS "unidadesVendidas"
                        FROM "SaleDetails" sd
                        INNER JOIN "ProductsUnits" pu
                            ON pu.id = sd.product_unit_id
                        INNER JOIN "Products" p
                            ON p.id = pu.product_id
                        INNER JOIN "Sales" s
                            ON s.id = sd.sale_id
                        WHERE s.business_id = :businessId
                          AND s.status = 'COMPLETED'
                          AND p.id IN (:productIds)
                        GROUP BY
                            p.id,
                            pu.id,
                            pu.unit
                        HAVING SUM(sd.cantidad) > 0
                        ORDER BY
                            p.id,
                            "unidadesVendidas" DESC
                        `,
                        {
                            replacements: {
                                businessId,
                                productIds,
                            },
                            type: QueryTypes.SELECT,
                        }
                    );
                    const unidadesPorProducto = {};
                    for (const item of unidades) {
                        if (!unidadesPorProducto[item.productId]) {
                            unidadesPorProducto[item.productId] = [];
                        }
                        unidadesPorProducto[item.productId].push({
                            productUnitId: item.productUnitId,
                            unit: item.unit,
                            unidadesVendidas: Number(
                                item.unidadesVendidas
                            ),
                        });
                    }
                    response.topProductos = productos.map((item, index) => ({
                        posicion: index + 1,
                        producto: item.producto,
                        unidadesVendidas: Number(
                            item.unidadesVendidas
                        ),
                        ingresos: Number(
                            Number(item.ingresos).toFixed(2)
                        ),
                        unidades:
                            unidadesPorProducto[item.productId] || [],
                    }));
                }
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
                    INNER JOIN "ProductsUnits" pu
                        ON pu.id = sd.product_unit_id
                    INNER JOIN "Products" p
                        ON p.id = pu.product_id
                    INNER JOIN "Sales" s
                        ON s.id = sd.sale_id
                    WHERE s.business_id = :businessId
                      AND s.status = 'COMPLETED'
                    GROUP BY p.category
                    ORDER BY ventas DESC
                    LIMIT 5
                    `,
                    {
                        replacements: {
                            businessId,
                        },
                        type: QueryTypes.SELECT,
                    }
                );

                response.topCategorias = categorias.map((item, index) => ({
                    posicion: index + 1,
                    categoria: item.categoria,
                    ventas: Number(
                        Number(item.ventas).toFixed(2)
                    ),
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
            console.error( "[getSalesRankingMetrics] Error ranking ventas",error );

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
    }, CacheTTL.ONE_HOUR, businessId);
};
export const getInventoryAlertsMetrics = async (businessId) => {
    const key = CacheKeys.INVENTORYALERTS;

    return cacheService.remember(
        key,
        async () => {
            const warnings = [];
            const errors = [];

            const response = {
                stockCritico: 0,
                agotados: 0,
            };

            try {
                try {
                    response.stockCritico = await ProductUnit.count({
                        include: [
                            {
                                model: Product,
                                as: "product",
                                required: true,
                                where: {
                                    business_id: businessId,
                                    active: true,
                                    type_item: "Producto",
                                },
                            },
                        ],
                        where: {
                            active: true,
                            stock: {
                                [Op.gt]: 0,
                                [Op.lte]: 10,
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
                    response.agotados = await ProductUnit.count({
                        include: [
                            {
                                model: Product,
                                as: "product",
                                required: true,
                                where: {
                                    business_id: businessId,
                                    active: true,
                                    type_item: "Producto",
                                },
                            },
                        ],
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
                if ( response.stockCritico === 0 && response.agotados === 0 ) {
                    warnings.push( "No existen alertas de inventario" );
                }

                return {
                    success: errors.length === 0,
                    data: response,
                    warnings,
                    errors,
                };

            } catch (error) {
                console.error("[getInventoryAlertsMetrics] Error alertas inventario",error);

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

        },
        CacheTTL.ONE_HOUR, businessId
    );
};

export const getExpiringProductsMetrics = async (
    businessId,
    page = 1,
    limit = 10
) => {
    const key = `${CacheKeys.EXPIRINGPRODUCTS}:${businessId}:${page}:${limit}`;
    return cacheService.remember(
        key,
        async () => {
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
                const products = await ProductUnit.findAll({
                    where: {
                        active: true,
                        stock: {
                            [Op.ne]: 0,
                        },
                        expirationDate: {
                            [Op.lte]: db.literal(
                                "CURRENT_DATE + INTERVAL '30 days'"
                            ),
                            [Op.gte]: db.literal("CURRENT_DATE"),
                        },
                    },

                    attributes: [
                        "id",
                        "product_id",
                        "unit",
                        "stock",
                        "expirationDate",
                    ],

                    include: [
                        {
                            model: Product,
                            as: "product",
                            attributes: [
                                "id",
                                "name",
                                "category",
                            ],
                            where: {
                                business_id: businessId,
                                active: true,
                                type_item: "Producto",
                            },
                            required: true,
                        },
                    ],

                    order: [["expirationDate", "ASC"]],
                });

                const groupedProducts = new Map();

                for (const productUnit of products) {
                    const productId = productUnit.product_id;

                    if (!groupedProducts.has(productId)) {
                        groupedProducts.set(productId, {
                            id: productUnit.product?.id,
                            product_id: productId,
                            nombre: productUnit.product?.name,
                            categoria:
                                productUnit.product?.category ??
                                "Sin categoría",
                            fechaVencimiento:
                                productUnit.expirationDate,
                            unidades: [],
                        });
                    }

                    const groupedProduct =
                        groupedProducts.get(productId);

                    groupedProduct.unidades.push({
                        id: productUnit.id,
                        unidad: productUnit.unit,
                        stock: productUnit.stock,
                        fechaVencimiento:
                            productUnit.expirationDate,
                    });

                    if ( new Date(productUnit.expirationDate) < new Date(groupedProduct.fechaVencimiento) ) {
                        groupedProduct.fechaVencimiento = productUnit.expirationDate;
                    }
                }

                const groupedArray = Array.from(
                    groupedProducts.values()
                );

                groupedArray.sort(
                    (a, b) =>
                        new Date(a.fechaVencimiento) -
                        new Date(b.fechaVencimiento)
                );
                const total = groupedArray.length;
                const offset = (page - 1) * limit;
                const paginatedProducts = groupedArray.slice(
                    offset,
                    offset + limit
                );
                response.pagination.total = total;
                response.pagination.totalPages = Math.ceil(
                    total / limit
                );
                response.products = paginatedProducts;

                if (paginatedProducts.length === 0) {
                    warnings.push(
                        "No existen productos próximos a vencer"
                    );
                }

                return {
                    success: true,
                    data: response,
                    warnings,
                    errors,
                };
            } catch (error) {
                console.error( "[getExpiringProductsMetrics] Error:", error );
                console.error(
                    "[getExpiringProductsMetrics] Error completo:",
                    error?.original ||
                        error?.parent ||
                        error
                );

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
        },
        CacheTTL.ONE_HOUR,
        businessId
    );
};