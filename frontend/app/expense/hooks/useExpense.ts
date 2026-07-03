import { useEffect, useState } from "react";
import { getExpenses, createExpense, updateExpense, deleteExpense } from "@/services/expenseService";
import { Expense } from "@/types/Expense"

type Filters = {
    category?: string;
    from?: string;
    to?: string;
};

type Pagination = {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

export function useExpenses(initialPage: number = 1, initialFilters: Filters = {}) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [page, setPage] = useState(initialPage);
    const [filters, setFilters] = useState<Filters>(initialFilters);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await getExpenses(page, filters);

            setExpenses(res.data);
            setPagination(res.pagination);

        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [page, filters]);

    const addExpense = async (expense: Omit<Expense, "id">) => {
        try {
            await createExpense(expense);
            await fetchExpenses();
        } catch (err) {
            setError(err);
        }
    };

    const editExpense = async (id: number, data: Partial<Expense>) => {
        try {
            const res = await updateExpense(id, data);

            if (res.ok) {
                await fetchExpenses();
            } else {
                setError(res.message);
            }
        } catch (err) {
            setError(err);
        }
    };

    const removeExpense = async (id: number) => {
        try {
            await deleteExpense(id);
            await fetchExpenses();
        } catch (err) {
            setError(err);
        }
    };

    return {
        expenses, pagination, loading, error, page, setPage, filters, setFilters, addExpense,
        editExpense, removeExpense, refresh: fetchExpenses
    };
}