import axios from "axios";
import { DashboardResponse } from "@/types/dashboard/dashboardMetrics";
import { ProfitabilityResponse } from "@/types/dashboard/profitabilityMetrics";
import { SalesRankingResponse } from "@/types/dashboard/salesRankingMetrics";
import { InventoryAlertsResponse } from "@/types/dashboard/inventoryAlertsMetrics";
import { ExpiringProductsResponse } from "@/types/dashboard/expiringProductsMetrics";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error(
        "La variable NEXT_PUBLIC_API_BASE_URL no está definida"
    );
}

const api = axios.create({
    baseURL: `${API_BASE_URL}/dashboard`,
    headers: {
        "Content-Type": "application/json",
    }
});

export async function getDashboardMetrics(): Promise<DashboardResponse> {
    try {
        const { data } = await api.get<DashboardResponse>(
            "/dashboardMetrics"
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
            "/profitabilityMetrics"
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
            "/salesRankingMetrics"
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
            "/inventoryAlertsMetrics"
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
            "/expiringProductsMetrics",
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