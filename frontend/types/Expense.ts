export type Expense = {
    id: number;

    description: string;
    amount: number;
    category: string;

    date: string;
    payment_method?: string;

    createdAt?: string;
    updatedAt?: string;
};
export type CurrentMonthTotal = {
    month: number;
    year: number;
    total: number;
}