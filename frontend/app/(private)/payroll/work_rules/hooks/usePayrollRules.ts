import { useCallback, useEffect, useState } from "react";
import { getPayrollRules, deletePayrollRule, activePayrollRule } from "@/services/Worksheet/Payroll/PayrollRuleService";
import {PayrollRule,PayrollRuleFilters } from "@/types/worksheet/payroll/PayrollRule";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

export function usePayrollRules() {
    const [rules, setRules] = useState<PayrollRule[]>([]);
    const [pagination, setPagination] = useState({
        total: 0,
        page: DEFAULT_PAGE,
        limit: DEFAULT_LIMIT,
        totalPages: 0,
    });
    const [filters, setFilters] = useState<PayrollRuleFilters>({
        page: DEFAULT_PAGE,
        limit: DEFAULT_LIMIT,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRules = useCallback(
        async (currentFilters: PayrollRuleFilters) => {
            try {
                setLoading(true);
                setError(null);

                const response = await getPayrollRules(currentFilters);
                console.log("[HOOK]:",response.data);
                setRules(response.data);
                setPagination(response.pagination);
            } catch (error: any) {
                setError(
                    error?.message ||
                    "Error al obtener las reglas de nómina"
                );
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchRules(filters);
    }, [filters, fetchRules]);

    const updateRuleStatus = useCallback(
        async (id: number, active: boolean) => {
            try {
                setLoading(true);
                setError(null);

                const response = active
                    ? await activePayrollRule(id)
                    : await deletePayrollRule(id);

                await fetchRules(filters);

                return response;
            } catch (error: any) {
                const message =
                    error?.message ||
                    `Error al ${active ? "activar" : "desactivar"} la regla de nómina`;

                setError(message);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [filters, fetchRules]
    );

    const updateFilters = useCallback(
        (newFilters: Partial<PayrollRuleFilters>) => {
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
        fetchRules(filters);
    }, [filters, fetchRules]);

    return {
        rules, pagination, filters, loading, error,
        updateFilters, setPage, setLimit, resetFilters, refresh, updateRuleStatus
    };
}