export type Product = {
    id: number;
    name: string;
    category?: string;
    type_item: "Producto" | "Servicio";
    active: boolean;
    created_by?: number;
    updated_by?: number;
    business_id: number;
    units: ProductUnit[];
    createdAt?: string;
    updatedAt?: string;
};
export type Branch = {
    id: number;
    name: string;
}
export type ProductUnit = {
    id: number;
    product_id: number;
    branch?: Branch | null;
    unit: string;
    barcode?: string;
    price: number;
    cost?: number;
    stock: number;
    hasPromotion: boolean;
    promotionPrice?: number;
    promotionQuantity?: number;
    promotionStart?: string;
    promotionEnd?: string;
    entryDate?: string;
    expirationDate?: string;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
};
export type ProductsResponse = {
    total: number;
    page: number;
    totalPages: number;
    products: Product[];
};

export type CreateProductUnit = {
    unit: string;
    barcode?: string;
    price: number;
    cost?: number;
    stock?: number;
    hasPromotion?: boolean;
    promotionPrice?: number;
    promotionQuantity?: number;
    promotionStart?: string;
    promotionEnd?: string;
    entryDate?: string;
    expirationDate?: string;
    active?: boolean;
};

export type CreateProduct = {
    name: string;
    category?: string;
    type_item?: "Producto" | "Servicio";
    active?: boolean;
    units: CreateProductUnit[];
};

export type UpdateProductUnit = {
    product_unit_id?: number;
    unit?: string;
    barcode?: string;
    price?: number;
    cost?: number;
    stock?: number;
    stockObservation?: string;
    hasPromotion?: boolean;
    promotionPrice?: number;
    promotionQuantity?: number;
    promotionStart?: string;
    promotionEnd?: string;
    entryDate?: string;
    expirationDate?: string;
    active?: boolean;
};

export type UpdateProduct = {
    name?: string;
    category?: string;
    type_item?: "Producto" | "Servicio";
    active?: boolean;
    units?: UpdateProductUnit[];
};

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

export type StockAlerts = {
  exhausted: StockAlertProduct[];
  critical: StockAlertProduct[];
};