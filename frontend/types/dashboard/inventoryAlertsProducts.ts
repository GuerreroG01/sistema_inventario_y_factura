import type { Product } from "../product";

export type StockAlertProduct = Pick<
    Product,
    | "barcode" | "name" | "category" | "price" | "stock" | "hasPromotion" | "promotionPrice"
    | "promotionStart" | "promotionEnd"
>;


export interface InventoryAlertsProductsData {
    exhausted: StockAlertProduct[];
    critical: StockAlertProduct[];
}


export interface InventoryAlertsProductsResponse {
    success: boolean;
    data: InventoryAlertsProductsData;
}