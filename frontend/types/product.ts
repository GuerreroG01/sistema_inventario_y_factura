export type Product = {
    id: number;
    name: string;
    barcode?: string;
    category?: string;
    type_item: "Producto" | "Servicio";
    unit?: string;
    price: number;
    cost?: number;
    stock: number;

    entryDate?: string;        // YYYY-MM-DD
    expirationDate?: string;   // YYYY-MM-DD

    active?: boolean;
    createdAt?: string;
    updatedAt?: string;
};
export type StockAlertProduct = {
    barcode?: string;
    name: string;
    category?: string;
    price: number;
    stock: number;
};

export type StockAlerts = {
    exhausted: StockAlertProduct[];
    critical: StockAlertProduct[];
};