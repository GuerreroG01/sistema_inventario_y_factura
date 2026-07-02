import axios from "axios";
import { InventoryMovementsResponse, InventoryMovementsFilters } from "../types/inventoryMov";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!API_BASE_URL) {
    throw new Error(
        "La variable NEXT_PUBLIC_API_BASE_URL no está definida"
    );
}

const api = axios.create({
    baseURL: `${API_BASE_URL}/inventory-movements`,
    headers: {
        "Content-Type": "application/json",
    }
});

export async function getInventoryMovements(
    filters: InventoryMovementsFilters = {}
): Promise<InventoryMovementsResponse> {

    try {
        const { data } = await api.get<InventoryMovementsResponse>(
            "/",
            {
                params: {
                    page: filters.page ?? 1,
                    limit: filters.limit ?? 10,
                    product: filters.product || undefined,
                    tipo: filters.tipo || undefined,
                    startDate: filters.startDate || undefined,
                    endDate: filters.endDate || undefined,
                    referencia: filters.referencia || undefined,
                    cantidadMin: filters.cantidadMin || undefined,
                    cantidadMax: filters.cantidadMax || undefined
                }
            }
        );
        return data;

    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            "Error obteniendo movimientos de inventario"
        );
    }
}