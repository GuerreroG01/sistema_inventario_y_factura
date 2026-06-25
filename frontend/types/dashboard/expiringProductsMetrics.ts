export interface ExpiringProduct {
    id: number;
    nombre: string;
    codigo: string | null;
    categoria: string | null;
    stock: number;
    fechaVencimiento: string;
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