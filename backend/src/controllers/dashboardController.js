import { 
    getDashboardMetrics, getProfitabilityTrendMetrics, getSalesRankingMetrics, getInventoryAlertsMetrics, getExpiringProductsMetrics
} from "../services/dashboardService.js";

export const dashboardMetrics = async (req, res) => {
    try {
        const result = await getDashboardMetrics(req.user.business_id);

        if (!result.success) {
            console.warn(
                "[dashboardMetrics] Dashboard con errores",
                result.errors
            );
        }

        return res.status(200).json({
            success: result.success,
            data: result.data,
            warnings: result.warnings,
            errors: result.errors,
        });

    } catch (error) {
        console.error(
            "[dashboardMetrics] Error crítico",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Error obteniendo métricas del dashboard",
            error: error.message,
        });
    }
};

export const profitabilityMetrics = async (req, res) => {
    try {
        const result = await getProfitabilityTrendMetrics(req.user.business_id);

        if (!result.success) {
            console.warn(
                "[profitabilityMetrics] Error obteniendo rentabilidad",
                result.errors
            );
        }

        return res.status(200).json({
            success: result.success,
            data: result.data,
            warnings: result.warnings,
            errors: result.errors,
        });

    } catch (error) {
        console.error(
            "[profitabilityMetrics] Error crítico rentabilidad",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Error obteniendo métricas de rentabilidad",
            error: error.message,
        });
    }
};
export const rankingMetrics = async (req, res) => {
    try {
        const result = await getSalesRankingMetrics(req.user.business_id);

        if (!result.success) {
            console.warn(
                "[DashboardController] Error obteniendo los rankings",
                result.errors
            );
        }

        return res.status(200).json({
            success: result.success,
            data: result.data,
            warnings: result.warnings,
            errors: result.errors,
        });

    } catch (error) {
        console.error(
            "[DashboardController] Error crítico",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Error obteniendo métricas",
            error: error.message,
        });
    }
};
export const InventoryAlertsMetrics = async (req, res) => {
    try {
        const result = await getInventoryAlertsMetrics(req.user.business_id);
        if (!result.success) {
            console.warn(
                "[InventoryAlertsMetrics] Error obteniendo los rankings",
                result.errors
            );
        }
        return res.status(200).json({
            success: result.success,
            data: result.data,
            warnings: result.warnings,
            errors: result.errors,
        });
    } catch (error) {
        console.error(
            "[InventoryAlertsMetrics] Error crítico",
            error
        );
        return res.status(500).json({
            success: false,
            message: "Error obteniendo métricas",
            error: error.message,
        });
    }
};
export const ExpiringProductsMetrics = async (req, res) => {
    try {
        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 10);
        const result = await getExpiringProductsMetrics(req.user.business_id, page, limit);
        if (!result.success) {
            console.warn(
                "[InventoryAlertsMetrics] Error obteniendo los rankings",
                result.errors
            );
        }
        return res.status(200).json({
            success: result.success,
            data: result.data,
            warnings: result.warnings,
            errors: result.errors,
        });
    } catch (error) {
        console.error(
            "[ExpiringProductsMetrics] Error crítico",
            error
        );
        return res.status(500).json({
            success: false,
            message: "Error obteniendo métricas",
            error: error.message,
        });
    }
};