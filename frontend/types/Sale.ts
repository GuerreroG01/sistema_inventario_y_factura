import {Customer} from "../types/Customer"

export interface Sale {
    id: number;
    fecha: string;
    total: number;
    category?: string;
    status: string;
    updatedAt: string;
    created_by: number;
    details?: SaleDetail[];
    customer?: Customer | null;
    payment_type: "CASH" | "CREDIT" | "CARD" | "TRANSFER" | null;
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
    payment_type: "CASH" | "CREDIT" | "CARD" | "TRANSFER";
    items: CreateSaleItem[];
}