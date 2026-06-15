export type Product = {
    id: number;
    name: string;
    barcode?: string;
    category?: string;
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