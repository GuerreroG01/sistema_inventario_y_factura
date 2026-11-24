"use client";

import { useState } from "react";
import { ArrowDownLeft, Wallet, CalendarCheck, SlidersHorizontal, RotateCcw, History, ChevronLeft, ChevronRight, TrendingUp, TrendingDown,
  Minus, Undo2, Loader2
} from "lucide-react";
import { BenefitTransaction, BenefitTransactionType, BenefitTransactionPaginationData } from "@/types/worksheet/benefit/EmployeeBenefitTransaction";
import { SafeTooltip } from "@/components/SafeTooltip";
import { formatDate } from "@/utils/formatDate";

interface Props {
  transactions: BenefitTransaction[];
  unit?: string;
  loading: boolean;
  pagination: BenefitTransactionPaginationData;
  onPageChange: (page: number) => void;
  onReverse: (transactionId: number) => Promise<void>;
}

const TRANSACTION_LABELS: Record<BenefitTransactionType, string> = {
  ACCRUAL: "Acumulación",
  USAGE: "Consumo",
  PAYMENT: "Pago",
  ADJUSTMENT: "Ajuste",
  REVERSAL: "Reversión",
};

const TRANSACTION_STYLES: Record<BenefitTransactionType, string> = {
  ACCRUAL: "bg-emerald-50 text-emerald-700",
  USAGE: "bg-amber-50 text-amber-700",
  PAYMENT: "bg-blue-50 text-blue-700",
  ADJUSTMENT: "bg-violet-50 text-violet-700",
  REVERSAL: "bg-rose-50 text-rose-700",
};

const getTransactionIcon = (type: BenefitTransactionType) => {
  switch (type) {
    case "ACCRUAL":
      return ArrowDownLeft;
    case "USAGE":
      return CalendarCheck;
    case "PAYMENT":
      return Wallet;
    case "ADJUSTMENT":
      return SlidersHorizontal;
    case "REVERSAL":
      return RotateCcw;
    default:
      return History;
  }
};

const formatAmount = (value: number | string, unit?: string) => {
  const amount = Math.abs(Number(value));

  if (unit === "CURRENCY") {
    return new Intl.NumberFormat("es-NI", {
      style: "currency",
      currency: "NIO",
      minimumFractionDigits: 2,
    }).format(amount);
  }

  if (unit === "DAYS") {
    // Si es número entero → mostramos sin decimales
    // Si tiene decimales → mostramos máximo 1 decimal (ej: 2.5 días)
    const formatted = Number.isInteger(amount)
      ? amount.toString()
      : amount.toFixed(1).replace(/\.0$/, "");

    return `${formatted} ${amount === 1 ? "día" : "días"}`;
  }

  // Fallback genérico
  return Number.isInteger(amount) ? amount.toString() : amount.toFixed(2);
};

function TableLoading() {
  return (
    <tbody className="divide-y divide-slate-100">
      {[1, 2, 3, 4].map((item) => (
        <tr key={item} className="animate-pulse">
          {[1, 2, 3, 4, 5].map((cell) => (
            <td key={cell} className="px-4 py-5">
              <div className="h-4 w-24 rounded bg-slate-100" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

function EmptyTable() {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="mb-3 rounded-2xl bg-slate-100 p-4">
        <History className="h-7 w-7 text-slate-400" />
      </div>

      <h4 className="text-sm font-bold text-slate-700">No hay movimientos</h4>

      <p className="mt-1 max-w-xs text-xs text-slate-500">
        Todavía no existen transacciones registradas para este beneficio.
      </p>
    </div>
  );
}

export function BenefitTransactionTable({
  transactions,
  unit,
  loading,
  pagination,
  onPageChange,
  onReverse
}: Props) {
  const hasTransactions = transactions.length > 0;
  const [reversingId, setReversingId] = useState<number | null>(null);

  const handleReverse = async (transactionId: number) => {
    if (reversingId !== null) return;

    const confirmed = window.confirm(
        "¿Estás seguro de que deseas revertir este movimiento?"
    );

    if (!confirmed) return;

    setReversingId(transactionId);

    try {
        await onReverse(transactionId);
    } finally {
        setReversingId(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Fecha
              </th>
              <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Movimiento
              </th>
              <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Importe
              </th>
              <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Saldo anterior
              </th>
              <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Saldo posterior
              </th>
              <th className="px-5 py-3.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Acciones
            </th>
            </tr>
          </thead>

          {loading ? (
            <TableLoading />
          ) : hasTransactions ? (
            <tbody className="divide-y divide-slate-100/80">
              {transactions.map((transaction) => {
                const type = transaction.transaction_type;
                const Icon = getTransactionIcon(type);

                const before = Number(transaction.balance_before);
                const after = Number(transaction.balance_after);
                const difference = after - before;

                const isPositive = difference > 0;
                const isNegative = difference < 0;

                return (
                  <tr
                    key={transaction.id}
                    className="group transition-colors hover:bg-slate-50/80"
                  >
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900">
                        {formatDate(transaction.date)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${
                            isPositive
                              ? "bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-600/10"
                              : isNegative
                              ? "bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-600/10"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TRANSACTION_STYLES[type]}`}
                            >
                              {TRANSACTION_LABELS[type]}
                            </span>
                          </div>

                          {transaction.description && (
                            <SafeTooltip text={transaction.description} />
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold tabular-nums ${
                            isPositive
                              ? "bg-emerald-50/80 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                              : isNegative
                              ? "bg-rose-50/80 text-rose-700 ring-1 ring-inset ring-rose-600/20"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {isPositive ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : isNegative ? (
                            <TrendingDown className="h-3 w-3" />
                          ) : (
                            <Minus className="h-3 w-3" />
                          )}
                          <span>
                            {isPositive ? "+" : isNegative ? "-" : ""}
                            {formatAmount(Math.abs(difference), unit)}
                          </span>
                        </span>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <span className="text-xs font-medium text-slate-400 tabular-nums">
                        {formatAmount(transaction.balance_before, unit)}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <span className="text-xs font-bold text-slate-800 tabular-nums">
                        {formatAmount(transaction.balance_after, unit)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-center">
                      {type === "REVERSAL" || transaction.isReversed ? (
                          <span className="text-xs text-slate-400">
                              {type === "REVERSAL" ? "No aplica" : "Ya revertido"}
                          </span>
                      ) : (
                          <button
                              type="button"
                              onClick={() => void handleReverse(transaction.id)}
                              disabled={reversingId !== null || loading}
                              className="
                                  inline-flex items-center gap-1.5
                                  rounded-lg border border-rose-200
                                  bg-rose-50 px-2.5 py-1.5
                                  text-[10px] font-bold text-rose-600
                                  hover:bg-rose-100
                                  disabled:cursor-not-allowed disabled:opacity-40
                              "
                          >
                              {reversingId === transaction.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                  <Undo2 className="h-3 w-3" />
                              )}

                              {reversingId === transaction.id
                                  ? "Revirtiendo..."
                                  : "Revertir"}
                          </button>
                      )}
                  </td>
                  </tr>
                );
              })}
            </tbody>
          ) : null}
        </table>
      </div>

      {!loading && !hasTransactions && <EmptyTable />}

      {!loading && hasTransactions && (
        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Mostrando{" "}
            <span className="font-semibold text-slate-700">
              {transactions.length}
            </span>{" "}
            de{" "}
            <span className="font-semibold text-slate-700">
              {pagination.total}
            </span>{" "}
            movimientos
          </p>

          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <span className="text-xs font-medium text-slate-500">
              Página {pagination.page} de {Math.max(pagination.totalPages, 1)}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                aria-label="Página anterior"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                aria-label="Página siguiente"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
/*En el tema de la reversión hay que tomar en cuenta algo y es que si esta catalogando las reversiones desde el frontend puede ser problematico
cuando en los movimientos hayan más de una pagina porque no se sabe si hará mapeos correctos de los movimientos ya revertidos
Hay mucho que revisar en la logica de las reversiones */