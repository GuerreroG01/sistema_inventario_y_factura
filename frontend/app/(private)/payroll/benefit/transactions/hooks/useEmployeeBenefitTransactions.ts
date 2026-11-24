
import { useCallback, useEffect, useState } from "react";
import { getEmployeeBenefitById } from "@/services/Worksheet/Benefit/EmployeeBenefitService";
import { accrueBenefit, consumeBenefit, payBenefit, adjustBenefit, reverseBenefitTransaction,
    getBenefitBalance, getBenefitTransactions,
} from "@/services/Worksheet/Benefit/BenefitTransactionService";
import { EmployeeBenefit } from "@/types/worksheet/benefit/EmployeeBenefit";
import { BenefitBalance, BenefitTransaction, BenefitTransactionFilters, BenefitTransactionPaginationData, BenefitTransactionResult, 
    CreateBenefitTransactionData, AdjustBenefitTransactionData, ReverseBenefitTransactionData, CreateBenefitPaymentData
} from "@/types/worksheet/benefit/EmployeeBenefitTransaction";

type ProcessingAction =
    | "ACCRUAL"
    | "USAGE"
    | "PAYMENT"
    | "ADJUSTMENT"
    | "REVERSAL"
    | null;

interface Props {
    employeeBenefitId: number;
    employeeId?: number;
    initialFilters?: BenefitTransactionFilters;
}

const DEFAULT_PAGINATION: BenefitTransactionPaginationData = {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
};

export function useEmployeeBenefitTransactions({
    employeeBenefitId, employeeId, initialFilters,
}: Props) {
    const [transactions, setTransactions] = useState<BenefitTransaction[]>([]);
    const [balance, setBalance] = useState<BenefitBalance | null>(null);
    const [pagination, setPagination] = useState<BenefitTransactionPaginationData>(DEFAULT_PAGINATION);
    const [filters, setFilters] = useState<BenefitTransactionFilters>({
        page: 1,
        limit: 10,
        order: "DESC",
        ...initialFilters,
    });
    const [employeeBenefit, setEmployeeBenefit] = useState<EmployeeBenefit | null>(null);
    const [benefitLoading, setBenefitLoading] = useState(true);

    const [loading, setLoading] = useState(true);
    const [balanceLoading, setBalanceLoading] = useState(false);
    const [processing, setProcessing] = useState<ProcessingAction>(null);
    const [error, setError] = useState<string | null>(null);


    const fetchTransactions = useCallback(async () => {
        if (!employeeBenefitId) return;

        const response = await getBenefitTransactions(
            employeeBenefitId,
            filters
        );

        setTransactions(response.data);
        setPagination(response.pagination);
    }, [employeeBenefitId, filters]);

    const fetchBalance = useCallback(async () => {
        if (!employeeBenefitId) return;

        const response = await getBenefitBalance(
            employeeBenefitId,
            employeeId
        );

        setBalance(response);
    }, [employeeBenefitId, employeeId]);

    const fetchEmployeeBenefit = useCallback(async () => {
        if (!employeeBenefitId) return;

        const response = await getEmployeeBenefitById(employeeBenefitId);

        setEmployeeBenefit(response);
    }, [employeeBenefitId]);

    const refreshEmployeeBenefit = useCallback(async () => {
        setBenefitLoading(true);

        try {
            await fetchEmployeeBenefit();
        } catch (err: any) {
            setError(
                err?.message || "Error al obtener la información del beneficio"
            );
        } finally {
            setBenefitLoading(false);
        }
    }, [fetchEmployeeBenefit]);

    const refresh = useCallback(async () => {
        if (!employeeBenefitId) return;

        setLoading(true);
        setError(null);

        try {
            await fetchTransactions();
        } catch (err: any) {
            setError(
                err?.message || "Error al obtener los movimientos"
            );
        } finally {
            setLoading(false);
        }
    }, [employeeBenefitId, fetchTransactions]);

    const refreshBalance = useCallback(async () => {
        if (!employeeBenefitId) return;

        setBalanceLoading(true);

        try {
            await fetchBalance();
        } catch (err: any) {
            setError(
                err?.message || "Error al obtener el saldo"
            );
        } finally {
            setBalanceLoading(false);
        }
    }, [employeeBenefitId, fetchBalance]);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    useEffect(() => {
        void refreshBalance();
    }, [refreshBalance]);

    useEffect(() => {
        void refreshEmployeeBenefit();
    }, [refreshEmployeeBenefit]);

    const executeMutation = useCallback(
        async (
            action: Exclude<ProcessingAction, null>,
            operation: () => Promise<BenefitTransactionResult>
        ): Promise<BenefitTransactionResult> => {
            setProcessing(action);
            setError(null);

            try {
                const result = await operation();

                if (balance) {
                    setBalance((prev) =>
                        prev
                            ? {
                                  ...prev,
                                  balance: Number(result.benefit.balance),
                                  status: result.benefit.status,
                              }
                            : prev
                    );
                }

                await Promise.all([
                    refresh(),
                    refreshBalance(),
                ]);

                return result;
            } catch (err: any) {
                const message =
                    err?.message || "Error al procesar la operación";

                setError(message);

                throw err;
            } finally {
                setProcessing(null);
            }
        },
        [balance, refresh, refreshBalance]
    );

    const accrue = useCallback(
        (payload: CreateBenefitTransactionData) =>
            executeMutation("ACCRUAL", () =>
                accrueBenefit(employeeBenefitId, payload)
            ),
        [employeeBenefitId, executeMutation]
    );

    const consume = useCallback(
        (payload: CreateBenefitTransactionData) =>
            executeMutation("USAGE", () =>
                consumeBenefit(employeeBenefitId, payload)
            ),
        [employeeBenefitId, executeMutation]
    );

    const pay = useCallback(
        (payload: CreateBenefitPaymentData) =>
            executeMutation("PAYMENT", () =>
                payBenefit(employeeBenefitId, payload)
            ),
        [employeeBenefitId, executeMutation]
    );

    const adjust = useCallback(
        (payload: AdjustBenefitTransactionData) =>
            executeMutation("ADJUSTMENT", () =>
                adjustBenefit(employeeBenefitId, payload)
            ),
        [employeeBenefitId, executeMutation]
    );

    const reverse = useCallback(
        (
            transactionId: number,
            payload?: ReverseBenefitTransactionData
        ) =>
            executeMutation("REVERSAL", () =>
                reverseBenefitTransaction(
                    transactionId,
                    payload
                )
            ),
        [executeMutation]
    );

    const updateFilters = useCallback(
        (newFilters: Partial<BenefitTransactionFilters>) => {
            setFilters((prev) => ({
                ...prev,
                ...newFilters,
                page: newFilters.page ?? 1,
            }));
        },
        []
    );

    const changePage = useCallback((page: number) => {
        setFilters((prev) => ({
            ...prev,
            page,
        }));
    }, []);

    const changeLimit = useCallback((limit: number) => {
        setFilters((prev) => ({
            ...prev,
            limit,
            page: 1,
        }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({
            page: 1,
            limit: 10,
            order: "DESC",
        });
    }, []);

    return {
        employeeBenefit, benefitLoading, benefitType: employeeBenefit?.benefitRule?.type ?? null,
        transactions, balance, pagination, filters, loading, balanceLoading, processing,
        isProcessing: processing !== null, error,
        refresh, refreshBalance, accrue, consume, pay, adjust, reverse, updateFilters, clearFilters,
        changePage, changeLimit
    };
}