
"use client";

import { useEmployeeBenefitTransactions } from "../hooks/useEmployeeBenefitTransactions";
import { useBenefitTransactionActions } from "../hooks/useBenefitTransactionActions";
import { BenefitTransactionFilters } from "./BenefitTransactionFilters";
import { BenefitTransactionTable } from "./BenefitTransactionTable";
import { BenefitTransactionActions } from "./BenefitTransactionActions/BenefitTransactionActions";
import { RefreshCw, History, Coins, CalendarCheck, AlertCircle } from "lucide-react";
import { BenefitTransactionType, CreateBenefitTransactionData, AdjustBenefitTransactionData, CreateBenefitPaymentData } from "@/types/worksheet/benefit/EmployeeBenefitTransaction";

interface Props {
    employeeBenefitId: number;
}

type ActionType = Exclude<BenefitTransactionType, "REVERSAL">;

type TransactionPayload =
    | CreateBenefitTransactionData
    | CreateBenefitPaymentData
    | AdjustBenefitTransactionData;

export function EmployeeBenefitTransactions({ employeeBenefitId }: Props) {
    const {
        transactions, balance, pagination, filters, employeeBenefit, loading,  balanceLoading, error,
        refresh, refreshBalance, updateFilters, clearFilters, changePage
    } = useEmployeeBenefitTransactions({
        employeeBenefitId,
    });

    const {
        executeAction, reverseTransaction, loading: actionLoading, error: actionError, clearError
    } = useBenefitTransactionActions({
        employeeBenefitId,
    });

    const unit = balance?.unit;

    const formatBalance = (value: number | string) => {
        const amount = Number(value);

        if (unit === "CURRENCY") {
            return new Intl.NumberFormat("es-NI", {
                style: "currency",
                currency: "NIO",
                minimumFractionDigits: 2,
            }).format(amount);
        }

        if (unit === "DAYS") {
            return `${amount.toFixed(2)} días`;
        }

        return amount.toString();
    };

    const handleRefresh = async () => {
        await Promise.all([
            refresh(),
            refreshBalance(),
        ]);
    };

    const handleTransaction = async (
        type: ActionType,
        payload: TransactionPayload
    ): Promise<void> => {
        await executeAction(type, payload);

        await handleRefresh();
    };

    const handleReverse = async (
        transactionId: number
    ): Promise<void> => {
        clearError();

        await reverseTransaction(transactionId);

        await handleRefresh();
    };

    return (
        <section className="space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Saldo disponible
                            </p>
                            <p className="mt-2 text-2xl font-bold text-violet-700">
                                {balanceLoading || !balance
                                    ? "..."
                                    : formatBalance(balance.balance)}
                            </p>
                        </div>
                        <div className="rounded-xl bg-white p-3 text-violet-600">
                            {unit === "CURRENCY" ? (
                                <Coins className="h-5 w-5" />
                            ) : (
                                <CalendarCheck className="h-5 w-5" />
                            )}
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Movimientos registrados
                            </p>
                            <p className="mt-2 text-2xl font-bold text-slate-800">
                                {pagination.total}
                            </p>
                        </div>
                        <div className="rounded-xl bg-slate-100 p-3 text-slate-500">
                            <History className="h-5 w-5" />
                        </div>
                    </div>
                </div>

            </div>
            <div className="flex flex-col gap-4">
                {unit && employeeBenefit && (
                    <BenefitTransactionActions
                        unit={unit}
                        benefitType={employeeBenefit.type}
                        loading={actionLoading}
                        error={actionError}
                        onSubmit={handleTransaction}
                        onClearError={clearError}
                    />
                )}
            </div>
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">
                            Historial de movimientos
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                            Acumulaciones, consumos, pagos y ajustes.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => void handleRefresh()}
                        disabled={loading || balanceLoading || actionLoading}
                        className="
                            flex items-center gap-2 rounded-lg
                            border border-slate-200 px-3 py-2
                            text-xs font-semibold text-slate-600
                            hover:bg-slate-50 disabled:opacity-50
                        "
                    >
                        <RefreshCw
                            className={`h-3.5 w-3.5 ${
                                loading || balanceLoading || actionLoading
                                    ? "animate-spin"
                                    : ""
                            }`}
                        />
                        Actualizar
                    </button>

                </div>
                {error && (
                    <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
                        <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-red-700">
                                Error al consultar movimientos
                            </p>
                            <p className="mt-1 text-xs text-red-600">
                                {error}
                            </p>
                        </div>
                    </div>
                )}
                <BenefitTransactionFilters
                    filters={filters}
                    updateFilters={updateFilters}
                    clearFilters={clearFilters}
                />
                <BenefitTransactionTable
                    transactions={transactions}
                    unit={unit}
                    loading={loading || actionLoading}
                    pagination={pagination}
                    onPageChange={changePage}
                    onReverse={handleReverse}
                />

            </div>
        </section>
    );
}