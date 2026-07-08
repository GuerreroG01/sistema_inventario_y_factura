import api from "./api";
import { InventoryMovementsResponse, InventoryMovementsFilters } from "../types/inventoryMov";

export async function getInventoryMovements(
    filters: InventoryMovementsFilters = {}
): Promise<InventoryMovementsResponse> {

    try {
        const { data } = await api.get<InventoryMovementsResponse>(
            "/inventory-movements/",
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