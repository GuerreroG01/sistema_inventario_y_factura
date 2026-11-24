
import { useCallback, useEffect, useState } from "react";
import { BenefitResume, EmployeeBenefitFilters, EmployeeBenefitPagination } from "@/types/worksheet/benefit/EmployeeBenefit";
import { getEmployeeBenefits } from "@/services/Worksheet/Benefit/EmployeeBenefitService";

const INITIAL_FILTERS: EmployeeBenefitFilters = {
    page: 1,
    limit: 10,
};

const INITIAL_PAGINATION: EmployeeBenefitPagination["pagination"] = {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
};

export function useEmployeeBenefits(employeeId: number) {
    const [benefits, setBenefits] = useState<BenefitResume[]>([]);
    const [pagination, setPagination] = useState(INITIAL_PAGINATION);
    const [filters, setFiltersState] = useState<EmployeeBenefitFilters>(INITIAL_FILTERS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBenefits = useCallback(async () => {
        if (!employeeId || employeeId <= 0) {
            setBenefits([]);
            setPagination(INITIAL_PAGINATION);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await getEmployeeBenefits(
                employeeId,
                filters
            );

            setBenefits(response.data);
            setPagination(response.pagination);
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Error al obtener los beneficios del empleado"
            );
        } finally {
            setLoading(false);
        }
    }, [employeeId, filters]);

    useEffect(() => {
        void fetchBenefits();
    }, [fetchBenefits]);

    const setFilters = useCallback(
        (newFilters: Partial<EmployeeBenefitFilters>) => {
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

    return {
       benefits, pagination, filters, loading, error, setFilters, changePage, resetFilters,
        refresh: fetchBenefits,
    };
}