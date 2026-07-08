"use client";

import { useCallback, useEffect, useState } from "react";
import { getDashboardMetrics } from "../../../../services/dashboardService";
import { DashboardResponse } from "../../../../types/dashboard/dashboardMetrics";

const initialMetrics: DashboardResponse = {
    success: false,
    data: {
        ventasHoy: 0,
        ventasMes: 0,
        ganancia: 0,
        stockBajo: 0,
        productosActivos: 0,
    },
    warnings: [],
    errors: [],
};

export function useDashboardMetrics() {

    const [metrics, setMetrics] = useState<DashboardResponse>(initialMetrics);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    const loadMetrics = useCallback(async () => {

        try {

            setLoading(true);
            setError("");

            const response = await getDashboardMetrics();

            setMetrics(response);

            // Logs solamente para debugging
            if (response.warnings?.length) {
                console.warn("[Dashboard Warnings]", response.warnings);
            }

            if (response.errors?.length) {
                console.error("[Dashboard Errors]", response.errors);
            }


        } catch (err: unknown) {

            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Error desconocido al cargar métricas");
            }

        } finally {

            setLoading(false);

        }

    }, []);


    useEffect(() => {
        loadMetrics();
    }, [loadMetrics]);


    return {
        metrics,
        loading,
        error,
        reload: loadMetrics,
    };
}