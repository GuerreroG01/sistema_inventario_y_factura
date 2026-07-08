import api from "./api";
import { DashboardResponse } from "@/types/dashboard/dashboardMetrics";
import { ProfitabilityResponse } from "@/types/dashboard/profitabilityMetrics";
import { SalesRankingResponse } from "@/types/dashboard/salesRankingMetrics";
import { InventoryAlertsResponse } from "@/types/dashboard/inventoryAlertsMetrics";
import { ExpiringProductsResponse } from "@/types/dashboard/expiringProductsMetrics";

export async function getDashboardMetrics(): Promise<DashboardResponse> {
    try {
        const { data } = await api.get<DashboardResponse>(
            "/dashboard/dashboardMetrics"
        );
        return data;

    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            "Error obteniendo métricas del dashboard"
        );
    }
}

export async function getProfitabilityMetrics(): Promise<ProfitabilityResponse> {
    try {
        const { data } = await api.get<ProfitabilityResponse>(
            "/dashboard/profitabilityMetrics"
        );
        return data;

    } catch(error:any) {
        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            "Error obteniendo métricas de rentabilidad"
        );
    }
}

export async function getSalesRankingMetrics(): Promise<SalesRankingResponse> {
    try {
        const { data } = await api.get<SalesRankingResponse>(
            "/dashboard/salesRankingMetrics"
        );
        return data;

    } catch(error:any) {
        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            "Error obteniendo ranking de ventas"
        );
    }
}

export async function getInventoryAlertsMetrics(): Promise<InventoryAlertsResponse> {
    try {
        const { data } = await api.get<InventoryAlertsResponse>(
            "/dashboard/inventoryAlertsMetrics"
        );
        return data;

    } catch(error:any) {
        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            "Error obteniendo alertas de inventario"
        );
    }
}

export async function getExpiringProductsMetrics(
    page:number = 1,
    limit:number = 10
): Promise<ExpiringProductsResponse> {

    try {
        const { data } = await api.get<ExpiringProductsResponse>(
            "/dashboard/expiringProductsMetrics",
            {
                params:{
                    page,
                    limit
                }
            }
        );
        return data;

    } catch(error:any) {
        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            "Error obteniendo productos próximos a vencer"
        );
    }
}