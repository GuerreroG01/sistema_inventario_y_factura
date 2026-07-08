import { useEffect, useState } from "react";
import {
    SalesRankingCategory,
    SalesRankingProduct,
    SalesRankingResponse,
} from "../../../../types/dashboard/salesRankingMetrics"

import { getSalesRankingMetrics } from "@/services/dashboardService";


interface UseSalesRankingMetricsReturn {
    topProductos: SalesRankingProduct[];
    topCategorias: SalesRankingCategory[];

    loading: boolean;

    warnings: string[];

    errors: string[];

    reload: () => Promise<void>;
}


export function useSalesRankingMetrics(): UseSalesRankingMetricsReturn {

    const [topProductos, setTopProductos] = useState<SalesRankingProduct[]>([]);
    const [topCategorias, setTopCategorias] = useState<SalesRankingCategory[]>([]);

    const [warnings, setWarnings] = useState<string[]>([]);
    const [errors, setErrors] = useState<string[]>([]);

    const [loading, setLoading] = useState<boolean>(true);


    const loadRanking = async () => {

        try {

            setLoading(true);

            setErrors([]);
            setWarnings([]);


            const response: SalesRankingResponse =
                await getSalesRankingMetrics();


            if (!response.success) {

                setErrors(
                    response.errors?.map(
                        error => error.message
                    ) || [
                        "Error obteniendo rankings"
                    ]
                );

                return;
            }


            setTopProductos(
                response.data?.topProductos ?? []
            );


            setTopCategorias(
                response.data?.topCategorias ?? []
            );


            setWarnings(
                response.warnings ?? []
            );


        } catch(error:any) {

            setErrors([
                error.message ||
                "Error cargando ranking de ventas"
            ]);

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        loadRanking();
    }, []);


    return {
        topProductos,
        topCategorias,

        loading,

        warnings,

        errors,

        reload: loadRanking,
    };
}