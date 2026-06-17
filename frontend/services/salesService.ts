import axios from "axios";
import { Sale, CreateSaleRequest } from "@/types/Sale";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error("La variable NEXT_PUBLIC_API_BASE_URL no está definida");
}

const api = axios.create({
    baseURL: `${API_BASE_URL}/sales`,
    headers: {
        "Content-Type": "application/json",
    },
});

export async function getSales(
    page: number = 1,
    filters: {
        fechaMin?: string;
        fechaMax?: string;
        totalMin?: string;
        totalMax?: string;
        category?: string;
        status?: string;
    } = {}
) {
    try {
        const { data } = await api.get<{
        total: number;
        page: number;
        totalPages: number;
        sales: Sale[];
        }>("/", {
        params: {
            page,
            ...Object.fromEntries(
            Object.entries(filters).filter(
                ([_, v]) => v !== "" && v !== undefined && v !== null
            )
            ),
        },
        });

        return data;
    } catch (error: any) {
        throw new Error(
        error.response?.data?.message || "Error al obtener ventas"
        );
    }
}

export async function getSale(id: number): Promise<Sale> {
    try {
        const { data } = await api.get<Sale>(`/${id}`);
        return data;
    } catch (error: any) {
        throw new Error(
        error.response?.data?.message || "Error al obtener venta"
        );
    }
}

export async function createSale(
    sale: CreateSaleRequest
): Promise<Sale> {
    try {
        const { data } = await api.post<{ sale: Sale }>(
            "/",
            sale
        );

        return data.sale;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message || "Error al crear venta"
        );
    }
}

export async function updateSaleStatus(
    id: number,
    status: string
): Promise<Sale> {
    try {
        const { data } = await api.patch<{
        message: string;
        sale: Sale;
        }>(`/${id}/status`, { status });

        return data.sale;
    } catch (error: any) {
        throw new Error(
        error.response?.data?.message || "Error al actualizar status"
        );
    }
}

export async function getSaleCategories(): Promise<string[]> {
    try {
        const { data } = await api.get<{
        source: string;
        categories: string[];
        }>("/categories");

        return data.categories;
    } catch (error: any) {
        throw new Error(
        error.response?.data?.message || "Error al obtener categorías"
        );
    }
}