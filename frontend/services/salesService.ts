import api from "./api";
import { Sale, CreateSaleRequest } from "@/types/Sale";

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
        }>("/sales/", {
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
        const { data } = await api.get<Sale>(`/sales/${id}`);
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
            "/sales/",
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
    status: string,
    refundObservation?: string
): Promise<
    | { ok: true; data: Sale }
    | { ok: false; message: string; code?: string }
> {
    try {
        const { data } = await api.patch<{
            message: string;
            sale: Sale;
        }>(`/sales/${id}/status`, {
            status,
            refundObservation,
        });

        return { ok: true, data: data.sale };

    } catch (error: any) {
        const code = error?.response?.data?.code;
        const message =
            error?.response?.data?.message ||
            "Error al actualizar el status de la venta";

        return {
            ok: false,
            message,
            code,
        };
    }
}

export async function getSaleCategories(): Promise<string[]> {
    try {
        const { data } = await api.get<{
        source: string;
        categories: string[];
        }>("/sales/categories");

        return data.categories;
    } catch (error: any) {
        throw new Error(
        error.response?.data?.message || "Error al obtener categorías"
        );
    }
}