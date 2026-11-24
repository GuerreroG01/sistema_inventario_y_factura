
import { useCallback, useEffect, useState } from "react";
import { BenefitRule, BenefitRuleFilters, BenefitRulePaginationData } from "@/types/worksheet/benefit/BenefitRule";
import { getBenefitRules, activateBenefitRule, deactivateBenefitRule } from "@/services/Worksheet/Benefit/BenefitRuleService";

const INITIAL_FILTERS: BenefitRuleFilters = {
    page: 1,
    limit: 10,
};

export function useBenefitRules() {
    const [rules, setRules] = useState<BenefitRule[]>([]);
    const [pagination, setPagination] =
        useState<BenefitRulePaginationData>({
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
        });
    const [filters, setFiltersState] = useState<BenefitRuleFilters>(INITIAL_FILTERS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
    const fetchRules = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await getBenefitRules(filters);

            setRules(response.data);
            setPagination(response.pagination);
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Error al obtener las reglas de beneficios"
            );
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        void fetchRules();
    }, [fetchRules]);

    const setFilters = useCallback(
        (newFilters: Partial<BenefitRuleFilters>) => {
            setFiltersState((previous) => ({
                ...previous,
                ...newFilters,
                page: 1,
            }));
        },
        []
    );

    const changePage = useCallback((page: number) => {
        setFiltersState((previous) => ({
            ...previous,
            page,
        }));
    }, []);

    const resetFilters = useCallback(() => {
        setFiltersState(INITIAL_FILTERS);
    }, []);

    const toggleRuleStatus = useCallback(
        async (rule: BenefitRule) => {
            setActionLoadingId(rule.id);
            setError(null);

            try {
                if (rule.is_active) {
                    await deactivateBenefitRule(rule.id);
                } else {
                    await activateBenefitRule(rule.id);
                }

                await fetchRules();
            } catch (err: unknown) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Error al cambiar el estado de la regla"
                );
            } finally {
                setActionLoadingId(null);
            }
        },
        [fetchRules]
    );

    return {
        rules, pagination, filters, loading, error, actionLoadingId,
        setFilters, changePage, resetFilters, refresh: fetchRules, toggleRuleStatus,
    };
}