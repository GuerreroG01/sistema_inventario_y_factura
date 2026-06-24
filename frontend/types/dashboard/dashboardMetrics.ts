export interface DashboardMetrics {
    ventasHoy: number;
    ventasMes: number;
    ganancia: number;
    stockBajo: number;
    productosActivos: number;
}

export interface DashboardResponse {
    success: boolean;
    data: DashboardMetrics;
    warnings: string[];
    errors: {
        module: string;
        message: string;
    }[];
}