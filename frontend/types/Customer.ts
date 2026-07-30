export type Customer = {
    id:number;
    name:string;
    phone:string | null;
    email:string | null;
    address:string | null;
    identification:string | null;
    credit_limit:number;
    balance:number;
    status:"ACTIVE" | "INACTIVE";
    created_by?:number;
    updated_by?:number;
    business_id:number;
    createdAt?:string;
    updatedAt?:string;
}

export type CustomerResponse = {
    success: boolean;
    data: Customer;
};

export type CustomerAutocomplete = {
    id: number;
    name: string;
    identification: string | null;
}

export type CustomerSummary = {
    totalSales: number;
    totalPurchased: number;
    creditPurchases: number;
    cashPurchases: number;
    pendingSales: number;
    pendingAmount: number;
    lastPurchase: string | null;
}

export type CustomerIndicators = {
    customerSince: string;
    lastPurchase: string | null;
    pendingSales: number;
}

export type PaymentType =
    | "CASH"
    | "CREDIT"
    | "CARD"
    | "TRANSFER";

export type SaleStatus =
    | "PENDING"
    | "PAID"
    | "COMPLETED"
    | "CANCELLED"
    | "REFUNDED";

export type CustomerSaleHistory = {
    id: number;
    fecha: string;
    total: number;
    paymentType: PaymentType;
    status: SaleStatus;
    createdAt: string;
}

export type CustomerSalesHistoryResponse = {
    sales: CustomerSaleHistory[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export type CustomerPreferences = {
    mostPurchasedCategory: string | null;
    mostRepeatedQuantity: number | null;
    averageQuantity: string | number;
    favoritePaymentType: PaymentType;
    creditBehavior: {
        creditPurchases: number;
        averagePaymentDays: number;
        description: string;
    } | null;
};