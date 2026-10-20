
import { useCallback, useEffect, useState } from "react";
import { getPayrollPeriodSummary, getPayrollItemsByEmployee } from "@/services/Worksheet/Payroll/PayrollPeriodService";

import type { PayrollPeriodSummary } from "@/types/worksheet/payroll/PayrollPeriod";
import type { PayrollItem } from "@/types/worksheet/payroll/PayrollItem";

export function usePayrollPeriodDetails(periodId: number | null) {
    const [summary, setSummary] = useState<PayrollPeriodSummary | null>(null);
    const [items, setItems] = useState<PayrollItem[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] =useState<number | null>(null);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [loadingItems, setLoadingItems] = useState(false);
    const [summaryError, setSummaryError] = useState<string | null>(null);
    const [itemsError, setItemsError] = useState<string | null>(null);

    const fetchSummary = useCallback(async () => {
        if (periodId === null) {
            setSummary(null);
            return;
        }

        try {
            setLoadingSummary(true);
            setSummaryError(null);

            const result = await getPayrollPeriodSummary(periodId);
            setSummary(result);
        } catch (err: unknown) {
            setSummaryError(
                err instanceof Error
                    ? err.message
                    : "Error al obtener el resumen del período"
            );
        } finally {
            setLoadingSummary(false);
        }
    }, [periodId]);

    const fetchEmployeeItems = useCallback(
        async (payrollEmployeeId: number) => {
            if (periodId === null) return;

            try {
                setLoadingItems(true);
                setItemsError(null);
                setSelectedEmployeeId(payrollEmployeeId);
                setItems([]);

                const result = await getPayrollItemsByEmployee(
                    periodId,
                    payrollEmployeeId
                );

                setItems(result);
            } catch (err: unknown) {
                setItemsError(
                    err instanceof Error
                        ? err.message
                        : "Error al obtener los conceptos del empleado"
                );
            } finally {
                setLoadingItems(false);
            }
        },
        [periodId]
    );

    useEffect(() => {
        setSummary(null);
        setItems([]);
        setSelectedEmployeeId(null);
        setItemsError(null);

        void fetchSummary();
    }, [fetchSummary]);

    const clearEmployeeItems = useCallback(() => {
        setItems([]);
        setSelectedEmployeeId(null);
        setItemsError(null);
    }, []);

    return {
        summary,
        items,
        selectedEmployeeId,

        loadingSummary,
        loadingItems,

        summaryError,
        itemsError,

        fetchSummary,
        fetchEmployeeItems,
        clearEmployeeItems,
    };
}
