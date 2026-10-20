
"use client";

import { useState } from "react";
import { CalendarDays, Tags, X, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";

import { PayrollPeriodFilters as PayrollPeriodFiltersType, PayrollPeriodStatus } from "@/types/worksheet/payroll/PayrollPeriod";

type Props = {
    filters: PayrollPeriodFiltersType;
    onFiltersChange: (
        filters: Partial<PayrollPeriodFiltersType>
    ) => void;
    onReset: () => void;
};

const inputClassName = "w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

export default function PayrollPeriodFilters({ filters, onFiltersChange, onReset }: Props) {
    const [open, setOpen] = useState(false);
    const hasActiveFilters =
        Boolean(filters.status) ||
        Boolean(filters.start_date) ||
        Boolean(filters.end_date);

    const handleChange = (
        key: "status" | "start_date" | "end_date",
        value: string
    ) => {
        if (key === "status") {
            onFiltersChange({
                status: value
                    ? (value as PayrollPeriodStatus)
                    : undefined,
            });
            return;
        }

        onFiltersChange({
            [key]: value || undefined,
        });
    };

    const clearFilters = () => {
        onReset();
    };

    return (
        <div className="mb-6">
            {/* Cabecera */}
            <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5 text-indigo-600" />

                    <h2 className="text-sm font-semibold text-gray-900">
                        Filtros de períodos
                    </h2>

                    {hasActiveFilters && (
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600">
                            activos
                        </span>
                    )}

                    {!open && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                            oculto
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
                    >
                        <X className="mr-1 inline h-4 w-4" />
                        Limpiar
                    </button>

                    <button
                        type="button"
                        onClick={() => setOpen(!open)}
                        className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-indigo-700"
                    >
                        {open ? (
                            <>
                                Ocultar
                                <ChevronUp className="h-4 w-4" />
                            </>
                        ) : (
                            <>
                                Mostrar
                                <ChevronDown className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Panel de filtros */}
            <div
                className={`overflow-hidden transition-all duration-300 ${
                    open
                        ? "mt-4 max-h-[600px] opacity-100"
                        : "max-h-0 opacity-0"
                }`}
            >
                <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-5 shadow-sm">
                    <form
                        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                        onSubmit={(e) => e.preventDefault()}
                    >
                        {/* Estado */}
                        <div className="relative">
                            <Tags className="absolute left-3 top-3 h-4 w-4 text-gray-500" />

                            <select
                                value={filters.status ?? ""}
                                onChange={(e) =>
                                    handleChange(
                                        "status",
                                        e.target.value
                                    )
                                }
                                className={inputClassName}
                            >
                                <option value="">
                                    Todos los estados
                                </option>
                                <option value="DRAFT">
                                    Borrador
                                </option>
                                <option value="CALCULATED">
                                    Calculado
                                </option>
                                <option value="APPROVED">
                                    Aprobado
                                </option>
                                <option value="PAID">
                                    Pagado
                                </option>
                            </select>
                        </div>

                        {/* Fecha inicial */}
                        <div className="relative">
                            <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-gray-500" />

                            <input
                                type="date"
                                aria-label="Fecha inicial"
                                title="Fecha inicial"
                                value={filters.start_date ?? ""}
                                onChange={(e) =>
                                    handleChange(
                                        "start_date",
                                        e.target.value
                                    )
                                }
                                className={inputClassName}
                            />
                        </div>

                        {/* Fecha final */}
                        <div className="relative">
                            <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-gray-500" />

                            <input
                                type="date"
                                aria-label="Fecha final"
                                title="Fecha final"
                                min={filters.start_date || undefined}
                                value={filters.end_date ?? ""}
                                onChange={(e) =>
                                    handleChange(
                                        "end_date",
                                        e.target.value
                                    )
                                }
                                className={inputClassName}
                            />
                        </div>

                        {/* Acciones */}
                        <div className="col-span-full mt-2 flex justify-end">
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}