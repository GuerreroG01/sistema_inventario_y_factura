export type Expense = {
    id: number;

    description: string;
    amount: number;
    category: string;

    date: string;
    payment_method?: string;
    business_id: number;
    branch_id: number;
    branch: {
        id: number;
        name: string;
    };
    created_by?: number;
    updated_by?: number;
    status: string;
    removal_date?: string | null;
    createdAt?: string;
    updatedAt?: string;
};
export type CurrentMonthTotal = {
    month: number;
    year: number;
    total: number;
}