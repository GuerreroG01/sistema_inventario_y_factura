export type StockAlertProduct = {
    id: number;
    product_id: number;
    unit: string;
    barcode: string;
    price: string;
    stock: number;
    hasPromotion: boolean;
    promotionPrice: string | null;
    promotionQuantity: number | null;
    promotionStart: string | null;
    promotionEnd: string | null;
    product: {
        id: number;
        name: string;
        category: string | null;
    };
};

export interface InventoryAlertsProductsData {
    exhausted: StockAlertProduct[];
    critical: StockAlertProduct[];
}

export interface InventoryAlertsProductsResponse {
    success: boolean;
    data: InventoryAlertsProductsData;
}
export type StockAlerts = InventoryAlertsProductsData;