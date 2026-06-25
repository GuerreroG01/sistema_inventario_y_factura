export interface ProfitabilityMetric {
    ventas: number;
    costos: number;
    ganancia: number;
    margen: number;
    ratioRetornoCosto: number;
    roi: number;
}

export interface ProfitabilityTrendItem {
    change: number;
    percentage: number | null;
    direction: "up" | "down" | "neutral";
}

export interface ProfitabilityTrend {
    ventas: ProfitabilityTrendItem;
    costos: ProfitabilityTrendItem;
    ganancia: ProfitabilityTrendItem;
    margen: ProfitabilityTrendItem;
    ratioRetornoCosto: ProfitabilityTrendItem;
    roi: ProfitabilityTrendItem;
}

export interface ProfitabilityData {
    current: ProfitabilityMetric;
    previous: ProfitabilityMetric;
    trend: ProfitabilityTrend;
}


export interface DashboardError {
    module: string;
    message: string;
}


export interface ProfitabilityResponse {
    success: boolean;
    data: ProfitabilityData;
    warnings: string[];
    errors: DashboardError[];
}