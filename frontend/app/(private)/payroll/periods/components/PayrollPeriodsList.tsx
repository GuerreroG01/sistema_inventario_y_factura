"use client";

import { useState } from "react";
import { CalendarDays, Calendar, MoreVertical, Calculator, CheckCircle2, FileSpreadsheet, ChevronDown, Loader2,
    Pencil, Eye
} from "lucide-react";
import { PayrollPeriod, PayrollPeriodStatus, CalculatePayrollResult } from "@/types/worksheet/payroll/PayrollPeriod";
import { PAYROLL_PERIOD_STATUS_CONFIG } from "../constants/payroll-period";
import { getAvailablePayrollPeriodStatuses } from "../utils/payroll-periodUtils";
import { formatDate } from "../utils/format-date";
import PayrollCalculationResultModal from "./PayrollCalculationResultModal";
import { useRouter } from "next/navigation";

type PayrollPeriodListProps = {
    periods: PayrollPeriod[];
    loading: boolean;
    error: string | null;
    onEditMode?: (period: PayrollPeriod) => void;
    handleUpdateStatus: (
        id: number,
        newStatus: PayrollPeriodStatus
    ) => Promise<PayrollPeriod | undefined>;
    calculatePeriod: (id: number) => Promise<CalculatePayrollResult | null>;
};

export default function PayrollPeriodList({periods = [], loading, error, onEditMode, handleUpdateStatus, calculatePeriod}: PayrollPeriodListProps) {
    const router = useRouter();
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [openStatusDropdownId, setOpenStatusDropdownId] = useState<number | null>(null);
    const [updatingPeriodId, setUpdatingPeriodId] = useState<number | null>(null);
    const [calculatingPeriodId, setCalculatingPeriodId] = useState<number | null>(null);
    const [justFinishedId, setJustFinishedId] = useState<number | null>(null);
    const [resultModalOpen, setResultModalOpen] = useState(false);
    const [calculationResult, setCalculationResult] = useState<CalculatePayrollResult | null>(null);

    if (error) {
        return (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700 shadow-sm">
                {error}
            </div>
        );
    }

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3, 4].map((n) => (
                    <div
                        key={n}
                        className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-slate-100/60 shadow-sm"
                    />
                ))}
            </div>
        );
    }

    if (!periods || periods.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/50 p-12 text-center shadow-sm">
                <div className="mb-3 rounded-full bg-slate-100 p-4 text-slate-400">
                    <Calendar className="h-8 w-8" />
                </div>

                <h3 className="text-base font-semibold text-slate-800">
                    No hay períodos de nómina
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                    No se encontraron períodos que coincidan con los filtros seleccionados.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {periods.map((period) => {
                const config = PAYROLL_PERIOD_STATUS_CONFIG[period.status];
                const isMenuOpen = openMenuId === period.id;
                const isStatusDropdownOpen = openStatusDropdownId === period.id;
                const isUpdating = updatingPeriodId === period.id;
                const isCalculating = calculatingPeriodId === period.id;
                const canCalculate = period.status === "DRAFT";
                const hasMenuOptions = Boolean(onEditMode);

                const availableStatuses = getAvailablePayrollPeriodStatuses(period.status).filter(
                    (st) => !(period.status === "DRAFT" && st === "CALCULATED")
                );

                return (
                    <div
                        key={period.id}
                        className={`group relative rounded-2xl border bg-white shadow-sm transition-all duration-200 border-slate-200 hover:border-indigo-200 hover:shadow-md ${
                            isMenuOpen || isStatusDropdownOpen ? "z-50" : "z-0"
                        }`}
                    >
                        <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center">
                            <div className="flex min-w-0 flex-1 items-center gap-3.5 lg:min-w-[220px]">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm group-hover:scale-105 transition-transform">
                                    <FileSpreadsheet className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="truncate text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                        Período #{period.id}
                                    </h2>
                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Empresa ID:{" "}
                                        <span className="font-semibold text-slate-700">
                                            {period.business_id}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex min-w-0 items-center gap-2.5 lg:w-[220px]">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                                    <CalendarDays className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                        Ciclo del Período
                                    </p>
                                    <p className="truncate text-xs font-semibold text-slate-700">
                                        {formatDate(period.start_date)}
                                    </p>
                                    <p className="truncate text-[10px] text-slate-400">
                                        Hasta {formatDate(period.end_date)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex min-w-0 items-center gap-2.5 lg:w-[180px]">
                                <div className="min-w-0">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                        Fecha de Pago
                                    </p>
                                    <p className="truncate text-xs font-bold text-slate-800">
                                        {formatDate(period.payment_date)}
                                    </p>
                                </div>
                            </div>

                            {(() => {
                                const isJustFinished = justFinishedId === period.id;
                                const showActionButton =
                                    canCalculate || isCalculating || isJustFinished;
                                const badgeConfig = config;

                                return (
                                    <div className="relative flex h-9 w-[150px] shrink-0 items-center lg:w-[160px]">
                                        {showActionButton ? (
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    if (isCalculating || isJustFinished) return;

                                                    setOpenMenuId(null);
                                                    setOpenStatusDropdownId(null);

                                                    setCalculatingPeriodId(period.id);
                                                    const result = await calculatePeriod(period.id);
                                                    setCalculatingPeriodId(null);

                                                    if (result) {
                                                        setJustFinishedId(period.id);
                                                        setCalculationResult(result);
                                                        setTimeout(() => {
                                                            setJustFinishedId(null);
                                                            setResultModalOpen(true);
                                                        }, 600);
                                                    }
                                                }}
                                                disabled={isCalculating || isJustFinished}
                                                className={`
                                                    relative flex h-9 w-full items-center justify-center gap-1.5
                                                    overflow-hidden rounded-xl px-3 text-[11px] font-bold
                                                    transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                                                    active:scale-[0.97] disabled:cursor-default
                                                    ${
                                                        isJustFinished
                                                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[0.97] ring-1 ring-emerald-500/30"
                                                            : isCalculating
                                                            ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25 opacity-95"
                                                            : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/40 hover:brightness-110 ring-1 ring-inset ring-white/15"
                                                    }
                                                `}
                                            >
                                                {!isCalculating && !isJustFinished && (
                                                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                                                )}

                                                <span
                                                    key={isJustFinished ? "done" : isCalculating ? "load" : "idle"}
                                                    className="relative flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-300"
                                                >
                                                    {isJustFinished ? (
                                                        <>
                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                            <span>¡Listo!</span>
                                                        </>
                                                    ) : isCalculating ? (
                                                        <>
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                            <span>Calculando...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Calculator className="h-3.5 w-3.5" />
                                                            <span>Calcular</span>
                                                        </>
                                                    )}
                                                </span>
                                            </button>
                                        ) : (
                                            <div className="relative w-full">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (isUpdating) return;
                                                        setOpenMenuId(null);
                                                        setOpenStatusDropdownId(
                                                            isStatusDropdownOpen ? null : period.id
                                                        );
                                                    }}
                                                    disabled={isUpdating}
                                                    className={`
                                                        flex h-9 w-full items-center justify-center gap-1.5
                                                        rounded-xl border px-3 text-xs font-bold
                                                        transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                                                        animate-in fade-in zoom-in-95 duration-400
                                                        ${badgeConfig.bg} ${badgeConfig.color} ${badgeConfig.border}
                                                        ${
                                                            isUpdating
                                                                ? "opacity-70 cursor-wait"
                                                                : "hover:opacity-90 hover:shadow-sm cursor-pointer"
                                                        }
                                                    `}
                                                >
                                                    {isUpdating ? (
                                                        <Loader2 className="h-3 w-3 animate-spin text-current" />
                                                    ) : (
                                                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${badgeConfig.dot}`} />
                                                    )}
                                                    <span className="truncate">{badgeConfig.label}</span>
                                                    {!isUpdating && (
                                                        <ChevronDown
                                                            className={`h-3 w-3 shrink-0 transition-transform duration-200 ${
                                                                isStatusDropdownOpen ? "rotate-180" : ""
                                                            }`}
                                                        />
                                                    )}
                                                </button>
                                                {isStatusDropdownOpen && !isUpdating && (
                                                    <div className="absolute bottom-full left-0 z-30 mb-1.5 w-44 origin-bottom animate-in fade-in zoom-in-95 slide-in-from-bottom-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl duration-150 lg:left-auto lg:right-0">
                                                        <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                                            Cambiar estado
                                                        </p>
                                                        {availableStatuses.map((st) => {
                                                            const stConfig = PAYROLL_PERIOD_STATUS_CONFIG[st];
                                                            const isCurrent = period.status === st;

                                                            return (
                                                                <button
                                                                    key={st}
                                                                    type="button"
                                                                    onClick={async () => {
                                                                        setOpenStatusDropdownId(null);
                                                                        if (!isCurrent) {
                                                                            try {
                                                                                setUpdatingPeriodId(period.id);
                                                                                await handleUpdateStatus(period.id, st);
                                                                            } finally {
                                                                                setUpdatingPeriodId(null);
                                                                            }
                                                                        }
                                                                    }}
                                                                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                                                                        isCurrent
                                                                            ? "bg-slate-100 font-bold text-slate-900"
                                                                            : "text-slate-700 hover:bg-slate-50"
                                                                    }`}
                                                                >
                                                                    <span className="flex items-center gap-2">
                                                                        <span className={`h-2 w-2 rounded-full ${stConfig.dot}`} />
                                                                        {stConfig.label}
                                                                    </span>
                                                                    {isCurrent && (
                                                                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                                                                    )}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            {hasMenuOptions && period.status !== "CANCELLED" && (
                                <div className="relative ml-auto shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setOpenStatusDropdownId(null);
                                            setOpenMenuId(isMenuOpen ? null : period.id);
                                        }}
                                        disabled={isCalculating}
                                        className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 active:scale-95 disabled:opacity-50"
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </button>

                                    {isMenuOpen && !isCalculating && (
                                        <div className="absolute right-0 top-full z-30 mt-1 w-44 animate-in fade-in zoom-in-95 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl duration-150">
                                            {period.status !== "DRAFT" && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setOpenMenuId(null);
                                                        router.push(`/payroll/periods/${period.id}`);
                                                    }}
                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
                                                >
                                                    <Eye className="h-3.5 w-3.5 text-blue-500" />
                                                    Ver detalles
                                                </button>
                                            )}
                                            {onEditMode && period.status == "DRAFT" && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setOpenMenuId(null);
                                                        onEditMode(period);
                                                    }}
                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                                                >
                                                    <Pencil className="h-3.5 w-3.5 text-indigo-500" />
                                                    Editar
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
            <PayrollCalculationResultModal
                open={resultModalOpen}
                result={calculationResult}
                onClose={() => {
                    setResultModalOpen(false);
                    setCalculationResult(null);
                }}
            />
        </div>
    );
}