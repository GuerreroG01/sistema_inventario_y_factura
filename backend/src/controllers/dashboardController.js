import { getDashboardMetrics } from "../services/dashboardService.js";

export const dashboardController = async (req, res) => {
    try {
        const result = await getDashboardMetrics();

        if (!result.success) {
            console.warn(
                "[DashboardController] Dashboard con errores",
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
            message: "Error obteniendo métricas del dashboard",
            error: error.message,
        });
    }
};