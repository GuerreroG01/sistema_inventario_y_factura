export interface ExpiringProductUnit {
    id: number;
    unidad: string;
    stock: number;
    fechaVencimiento: string;
}

export interface ExpiringProduct {
    id: number;
    product_id: number;
    nombre: string;
    categoria: string | null;
    fechaVencimiento: string;
    unidades: ExpiringProductUnit[];
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ExpiringProductsData {
    products: ExpiringProduct[];
    pagination: Pagination;
}

export interface DashboardError {
    module: string;
    message: string;
}

export interface ExpiringProductsResponse {
    success: boolean;
    data: ExpiringProductsData;
    warnings: string[];
    errors: DashboardError[];
}