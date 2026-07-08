"use client";

import { useCallback, useEffect, useState } from "react";
import { getExpiringProductsMetrics } from "../../../../services/dashboardService"
import type { DashboardError, ExpiringProductsData } from "../../../../types/dashboard/expiringProductsMetrics"

const initialData: ExpiringProductsData = {
    products: [],
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    },
};

export function useExpiringProductsMetrics() {
    const [data, setData] = useState<ExpiringProductsData>(initialData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [warnings, setWarnings] = useState<string[]>([]);
    const [errors, setErrors] = useState<DashboardError[]>([]);
    const [page, setPage] = useState(1);
    const limit = 10;

    const fetchMetrics = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await getExpiringProductsMetrics(page, limit);
            
            setData(response.data);
            setWarnings(response.warnings);
            setErrors(response.errors);
            if (!response.success) {
                setError(
                    "No fue posible obtener los productos próximos a vencer."
                );
            }
        } catch (error:any) {
            setError(error.message);
            setData(initialData);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchMetrics();
    }, [fetchMetrics]);

    return {
        data, loading, error, warnings, errors, page, setPage, reload: fetchMetrics,
    };
}