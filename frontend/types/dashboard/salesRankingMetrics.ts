export interface SalesRankingProduct {
    posicion: number;
    producto: string;
    unidadesVendidas: number;
    ingresos: number;
}


export interface SalesRankingCategory {
    posicion: number;
    categoria: string;
    ventas: number;
}


export interface SalesRankingData {
    topProductos: SalesRankingProduct[];
    topCategorias: SalesRankingCategory[];
}


export interface DashboardError {
    module: string;
    message: string;
}


export interface SalesRankingResponse {
    success: boolean;
    data?: SalesRankingData;
    warnings?: string[];
    errors?: DashboardError[];
    message?: string;
    error?: string;
}