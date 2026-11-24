"use client";

import { useState } from "react";
import { CalendarDays, RotateCcw, ChevronDown, X, SlidersHorizontal } from "lucide-react";
import { BenefitTransactionFilters as Filters, BenefitTransactionType } from "@/types/worksheet/benefit/EmployeeBenefitTransaction";

interface Props {
    filters: Filters;
    updateFilters: (filters: Partial<Filters>) => void;
    clearFilters: () => void;
    defaultOpen?: boolean;
}

const TRANSACTION_TYPES: {
    value: BenefitTransactionType;
    label: string;
}[] = [
    { value: "ACCRUAL", label: "Acumulaciones" },
    { value: "USAGE", label: "Consumos" },
    { value: "PAYMENT", label: "Pagos" },
    { value: "ADJUSTMENT", label: "Ajustes" },
    { value: "REVERSAL", label: "Reversiones" },
];

export function BenefitTransactionFilters({ 
    filters, updateFilters, clearFilters, defaultOpen = false 
}: Props) {
    const [isOpen, setIsOpen] = useState(defaultOpen); 
    const activeCount = [
        Boolean(filters.transactionType),
        Boolean(filters.from),
        Boolean(filters.to),
    ].filter(Boolean).length;
    const hasFilters = activeCount > 0;

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all duration-200">
        
        <div className="flex items-center justify-between px-4 py-3 sm:px-5">
            <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="group flex items-center gap-2.5 text-left text-xs font-bold text-slate-800 transition hover:text-violet-600 focus:outline-none"
            >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-violet-50 group-hover:text-violet-600">
                <SlidersHorizontal className="h-3.5 w-3.5" />
            </div>

            <div className="flex items-center gap-2">
                <span>Filtros de movimientos</span>
                {hasFilters && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white shadow-xs">
                    {activeCount}
                </span>
                )}
            </div>

            <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-300 ease-in-out ${
                isOpen ? "rotate-180 text-violet-600" : ""
                }`}
            />
            </button>

            <div className="flex items-center gap-2">
            {hasFilters && (
                <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 active:scale-95"
                >
                <RotateCcw className="h-3 w-3" />
                <span>Limpiar todo</span>
                </button>
            )}

            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                title={isOpen ? "Ocultar filtros" : "Mostrar filtros"}
            >
                <X className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "" : "rotate-45"}`} />
            </button>
            </div>
        </div>

        <div
            className={`grid transition-all duration-300 ease-in-out ${
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
        >
            <div className="overflow-hidden">
            <div className="border-t border-slate-100 p-4 sm:p-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                
                <div>
                    <label
                    htmlFor="benefit-transaction-type"
                    className="mb-1.5 block text-xs font-semibold text-slate-600"
                    >
                    Tipo de movimiento
                    </label>

                    <div className="relative">
                    <select
                        id="benefit-transaction-type"
                        value={filters.transactionType ?? ""}
                        onChange={(e) =>
                        updateFilters({
                            transactionType: e.target.value
                            ? (e.target.value as BenefitTransactionType)
                            : undefined,
                        })
                        }
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-3.5 pr-8 text-xs text-slate-700 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-3 focus:ring-violet-500/10"
                    >
                        <option value="">Todos los movimientos</option>
                        {TRANSACTION_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                        ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    </div>
                </div>

                <div>
                    <label
                    htmlFor="benefit-transaction-from"
                    className="mb-1.5 block text-xs font-semibold text-slate-600"
                    >
                    Fecha inicial
                    </label>

                    <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                        id="benefit-transaction-from"
                        type="date"
                        value={filters.from ?? ""}
                        max={filters.to || undefined}
                        onChange={(e) =>
                        updateFilters({
                            from: e.target.value || undefined,
                        })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-3 focus:ring-violet-500/10"
                    />
                    </div>
                </div>

                <div>
                    <label
                    htmlFor="benefit-transaction-to"
                    className="mb-1.5 block text-xs font-semibold text-slate-600"
                    >
                    Fecha final
                    </label>

                    <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                        id="benefit-transaction-to"
                        type="date"
                        value={filters.to ?? ""}
                        min={filters.from || undefined}
                        onChange={(e) =>
                        updateFilters({
                            to: e.target.value || undefined,
                        })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-3 focus:ring-violet-500/10"
                    />
                    </div>
                </div>

                </div>
                
                {hasFilters && (
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Filtros activos:
                    </span>

                    {filters.transactionType && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-600/20">
                        <span>
                        {
                            TRANSACTION_TYPES.find(
                            (item) => item.value === filters.transactionType
                            )?.label
                        }
                        </span>
                        <button
                        type="button"
                        onClick={() => updateFilters({ transactionType: undefined })}
                        className="rounded p-0.5 hover:bg-violet-100 hover:text-violet-900"
                        >
                        <X className="h-3 w-3" />
                        </button>
                    </span>
                    )}

                    {filters.from && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-500/10">
                        <span>Desde: {filters.from}</span>
                        <button
                        type="button"
                        onClick={() => updateFilters({ from: undefined })}
                        className="rounded p-0.5 hover:bg-slate-200 hover:text-slate-900"
                        >
                        <X className="h-3 w-3" />
                        </button>
                    </span>
                    )}

                    {filters.to && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-500/10">
                        <span>Hasta: {filters.to}</span>
                        <button
                        type="button"
                        onClick={() => updateFilters({ to: undefined })}
                        className="rounded p-0.5 hover:bg-slate-200 hover:text-slate-900"
                        >
                        <X className="h-3 w-3" />
                        </button>
                    </span>
                    )}
                </div>
                )}
            </div>
            </div>
        </div>

        </div>
    );
}