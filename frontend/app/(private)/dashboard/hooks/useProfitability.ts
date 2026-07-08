"use client";

import { useEffect, useState } from "react";
import { getProfitabilityMetrics } from "@/services/dashboardService";
import { ProfitabilityData } from "@/types/dashboard/profitabilityMetrics";


export function useProfitability() {
    const [data, setData] = useState<ProfitabilityData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfitability = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getProfitabilityMetrics();


            if (!response.success) {
                throw new Error(
                    response.errors?.[0]?.message ||
                    "Error obteniendo rentabilidad"
                );
            }
            setData(response.data);
        } catch(error:any) {
            setError(
                error.message ||
                "Error cargando rentabilidad"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfitability();
    }, []);

    return {
        data, loading, error,
        refetch: fetchProfitability,
    };
}