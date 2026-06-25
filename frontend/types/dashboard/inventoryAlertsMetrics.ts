export interface InventoryAlertsData {
    stockCritico: number;
    agotados: number;
}


export interface DashboardError {
    module: string;
    message: string;
}


export interface InventoryAlertsResponse {
    success: boolean;
    data: InventoryAlertsData;
    warnings: string[];
    errors: DashboardError[];
}