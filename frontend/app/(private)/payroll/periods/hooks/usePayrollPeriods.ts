import { useCallback, useEffect, useState } from "react";
import {
    getPayrollPeriods, createPayrollPeriod, updatePayrollPeriod, deletePayrollPeriod, updatePayrollPeriodStatus,
    calculatePayrollPeriod
} from "@/services/Worksheet/Payroll/PayrollPeriodService";
import { 
    PayrollPeriod, PayrollPeriodFilters, CreatePayrollPeriodData, UpdatePayrollPeriodData, PayrollPeriodStatus,
    CalculatePayrollResult
} from "@/types/worksheet/payroll/PayrollPeriod";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

export function usePayrollPeriods() {
    const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
    const [pagination, setPagination] = useState({
        total: 0,
        page: DEFAULT_PAGE,
        limit: DEFAULT_LIMIT,
        totalPages: 0,
    });
    const [filters, setFilters] = useState<PayrollPeriodFilters>({
        page: DEFAULT_PAGE,
        limit: DEFAULT_LIMIT,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const fetchPeriods = useCallback(
        async (currentFilters: PayrollPeriodFilters) => {
            try {
                setLoading(true);
                setError(null);

                const response = await getPayrollPeriods(currentFilters);
                
                setPeriods(response.data);
                setPagination({
                    total: response.pagination.total,
                    page: response.pagination.page,
                    limit: response.pagination.limit,
                    totalPages: response.pagination.totalPages,
                });
            } catch (err: any) {
                setError(
                    err?.message ||
                    "Error al obtener los períodos de nómina"
                );
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchPeriods(filters);
    }, [filters, fetchPeriods]);

    const createNewPeriod = useCallback(
        async (periodData: CreatePayrollPeriodData) => {
            try {
                setLoading(true);
                setFormError(null);

                const newPeriod = await createPayrollPeriod(periodData);
                await fetchPeriods(filters);

                return newPeriod;
            } catch (err: any) {
                const message = err?.message || "Error al crear el período de nómina";
                setFormError(message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [filters, fetchPeriods]
    );

    const editPeriod = useCallback(
        async (id: number, periodData: UpdatePayrollPeriodData) => {
            try {
                setLoading(true);
                setFormError(null);

                const updatedPeriod = await updatePayrollPeriod(id, periodData);
                await fetchPeriods(filters);

                return updatedPeriod;
            } catch (err: any) {
                const message = err?.message || "Error al actualizar el período de nómina";
                console.log("Error captado:",message);
                setFormError(message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [filters, fetchPeriods]
    );

    const calculatePeriod = useCallback(
        async (id: number): Promise<CalculatePayrollResult | null> => {
            try {
                setActionError(null);

                const result = await calculatePayrollPeriod(id);

                // Actualización local sin skeleton (sin setLoading)
                setPeriods((prev) =>
                    prev.map((p) =>
                        p.id === id
                            ? { ...p, status: "CALCULATED" as PayrollPeriodStatus }
                            : p
                    )
                );

                // await fetchPeriods(filters);  // solo si necesitara datos frescos completos

                return result;
            } catch (err: any) {
                const message =
                    err?.message || "Error al calcular la nómina del período";
                setActionError(message);
                return null;
            }
        },
        []
    );

    const handleUpdateStatus = async (id: number, newStatus: PayrollPeriodStatus) => {
        try {
            setActionError(null);
            const updatedPeriod = await updatePayrollPeriodStatus(id, newStatus);
            await fetchPeriods(filters); 
            return updatedPeriod;
        } catch (err: any) {
            const message = err?.message || "Error al actualizar el estado del período";
            setActionError(message);
        }
    };

    const removePeriod = useCallback(
        async (id: number) => {
            try {
                setLoading(true);
                setError(null);

                const result = await deletePayrollPeriod(id);
                await fetchPeriods(filters);

                return result;
            } catch (err: any) {
                const message = err?.message || "Error al eliminar el período de nómina";
                setError(message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [filters, fetchPeriods]
    );

    const updateFilters = useCallback(
        (newFilters: Partial<PayrollPeriodFilters>) => {
            setFilters((prev) => ({
                ...prev,
                ...newFilters,
                page: 1,
            }));
        },
        []
    );

    const setPage = useCallback((page: number) => {
        setFilters((prev) => ({
            ...prev,
            page,
        }));
    }, []);

    const setLimit = useCallback((limit: number) => {
        setFilters((prev) => ({
            ...prev,
            limit,
            page: 1,
        }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters({
            page: DEFAULT_PAGE,
            limit: pagination.limit || DEFAULT_LIMIT,
        });
    }, [pagination.limit]);

    const refresh = useCallback(() => {
        fetchPeriods(filters);
    }, [filters, fetchPeriods]);

    return {
        periods, pagination, filters, loading, error, formError, actionError,
        updateFilters, setPage, setLimit, resetFilters, refresh, createNewPeriod,
        editPeriod, handleUpdateStatus, removePeriod, calculatePeriod
    };
}