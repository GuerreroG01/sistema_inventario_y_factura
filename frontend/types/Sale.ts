export interface Sale {
    id: number;
    fecha: string;
    total: number;
    category?: string;
    status: string;
    client_id?: number;
    updatedAt: string;

    details?: SaleDetail[];
}
export interface SaleDetail {
    id?: number;
    sale_id?: number;
    product_id: number;
    descripcion?: string | null;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    tipo_item: string;
}

export interface CreateSaleItem {
    product_id: number;
    descripcion?: string;
    cantidad: number;
    precio_unitario: number;
    tipo_item: string;
}

export interface CreateSaleRequest {
    fecha: string;
    category?: string;
    client_id?: number;
    items: CreateSaleItem[];
}