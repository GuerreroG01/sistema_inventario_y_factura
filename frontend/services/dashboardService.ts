import axios from "axios";
import { DashboardResponse } from "@/types/dashboard/dashboardMetrics";

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