import { useEffect, useState } from "react";
import { getExpenses, createExpense, updateExpense, deleteExpense, getExpenseCategories, getCurrentMonthTotal } from "@/services/expenseService";
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
    const [errorTitle, setErrorTitle] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<string[]>([]);
    const [categoriesLoaded, setCategoriesLoaded] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [currentMonthTotal, setCurrentMonthTotal] = useState<number>(0);
    
    const getErrorMessage = (err: unknown): string => {
        if (err instanceof Error) {
            return err.message;
        }

        return "Ocurrió un error inesperado";
    };
    
    const fetchExpenses = async () => {
        try {
            setLoading(true);
            setError(null);
            setErrorTitle("");

            const res = await getExpenses(page, filters);

            setExpenses(res.data);
            setPagination(res.pagination);

        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };
    const fetchCategories = async () => {
        try {
            setCategoriesLoading(true);

            const data = await getExpenseCategories();
            setCategories(data);

            setCategoriesLoaded(true);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setCategoriesLoading(false);
        }
    };
    const fetchCurrentMonthTotal = async () => {
        try {
            const data = await getCurrentMonthTotal();
            setCurrentMonthTotal(data.total);
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [page, filters]);
    useEffect(() => {
        fetchCurrentMonthTotal();
    }, []);

    const addExpense = async (expense: Omit<Expense, "id">) => {
        try {
            await createExpense(expense);
            await fetchExpenses();
            await fetchCurrentMonthTotal()
        } catch (err) {
            setErrorTitle("No se puede crear el egreso");
            setError(getErrorMessage(err));
        }
    };

    const editExpense = async (id: number, data: Partial<Expense>) => {
        try {
            const result = await updateExpense(id, data);

            if (!result.ok) {
                setErrorTitle("No se puede actualizar el egreso");
                setError(result.message);
                return;
            }

            await fetchExpenses();
            await fetchCurrentMonthTotal();

        } catch (err) {
            setErrorTitle("No se puede actualizar  el egreso");
            setError(getErrorMessage(err));
        }
    };

    const removeExpense = async (id: number) => {
        try {
            await deleteExpense(id);
            await fetchExpenses();
            await fetchCurrentMonthTotal();
        } catch (err) {
            setErrorTitle("No se puede eliminar el egreso");
            setError(getErrorMessage(err));
        }
    };

    const updateFilter = (
        key: keyof Filters,
        value: string
    ) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));

        setPage(1);
    };

    return {
        expenses, pagination, loading, error, page, setPage, filters, setFilters, updateFilter, addExpense, currentMonthTotal,
        editExpense, removeExpense, refresh: fetchExpenses, fetchCategories, categories, categoriesLoaded, categoriesLoading,
        setError, errorTitle, setErrorTitle
    };
}