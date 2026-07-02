export interface InventoryMovement {
    id: number;
    tipo: string;
    cantidad: string;
    fecha: string;
    referencia: number | null;
    observacion: string | null;
    products: {
        id: number;
        name: string;
    };
}

export interface InventoryMovementsResponse {
    ok: boolean;
    data: InventoryMovement[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface InventoryMovementsFilters {
    page?: number;
    limit?: number;
    product?: string;
    tipo?: "entrada" | "salida" | "";
    startDate?: string;
    endDate?: string;
    referencia?: string;
    cantidadMin?: string;
    cantidadMax?: string;
}