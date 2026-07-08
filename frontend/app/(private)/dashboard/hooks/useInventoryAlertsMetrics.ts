import { useEffect, useState, useCallback } from "react";
import { getInventoryAlertsMetrics } from "../../../../services/dashboardService";
import type { InventoryAlertsData, DashboardError } from "../../../../types/dashboard/inventoryAlertsMetrics";

interface UseInventoryAlertsMetricsReturn {
    data: InventoryAlertsData;
    loading: boolean;
    error: string | null;
    warnings: string[];
    errors: DashboardError[];
    reload: () => Promise<void>;
}

const initialData: InventoryAlertsData = {
    stockCritico: 0,
    agotados: 0,
};

export const useInventoryAlertsMetrics = (): UseInventoryAlertsMetricsReturn => {
    const [data, setData] = useState<InventoryAlertsData>(initialData);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [warnings, setWarnings] = useState<string[]>([]);
    const [errors, setErrors] = useState<DashboardError[]>([]);

    const fetchInventoryAlerts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getInventoryAlertsMetrics();
            setData(response.data);
            setWarnings(response.warnings);
            setErrors(response.errors);

            if (!response.success) {
                setError(
                    "No fue posible obtener todas las métricas de inventario"
                );
            }
        } catch(error:any) {
            setError(
                error.message ||
                "Error obteniendo alertas de inventario"
            );
            setData(initialData);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInventoryAlerts();
    }, [fetchInventoryAlerts]);
    
    return {
        data, loading, error, warnings, errors, reload: fetchInventoryAlerts
    };
};