import type { Product } from "../product";

export type StockAlertProduct = Pick<
    Product,
    "barcode" | "name" | "category" | "price" | "stock"
>;


export interface InventoryAlertsProductsData {
    exhausted: StockAlertProduct[];
    critical: StockAlertProduct[];
}


export interface InventoryAlertsProductsResponse {
    success: boolean;
    data: InventoryAlertsProductsData;
}