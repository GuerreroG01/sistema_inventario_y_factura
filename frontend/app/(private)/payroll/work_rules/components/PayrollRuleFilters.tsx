"use client";

import { useEffect, useState, useRef } from "react";
import { Search, Tags, ToggleLeft, CalendarDays, X, SlidersHorizontal, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { PayrollRuleFilters as PayrollRuleFiltersType, PayrollRuleType } from "@/types/worksheet/payroll/PayrollRule";

type Props = {
    filters: PayrollRuleFiltersType;
    onFiltersChange: (
        filters: Partial<PayrollRuleFiltersType>
    ) => void;
    onReset: () => void;
};

export default function PayrollRuleFilters({ filters, onFiltersChange, onReset }: Props) {
    const [open, setOpen] = useState(false);
    const [codeValue, setCodeValue] = useState(filters.code ?? "");
    const [isCodeDebouncing, setIsCodeDebouncing] = useState(false);
    const codeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    
    useEffect(() => {
        setIsCodeDebouncing(true);
        if (codeDebounceRef.current) {
            clearTimeout(codeDebounceRef.current);
        }

        codeDebounceRef.current = setTimeout(() => {
            onFiltersChange({
                code: codeValue || undefined,
            });
            setIsCodeDebouncing(false);
        }, 800);

        return () => {
            if (codeDebounceRef.current) {
                clearTimeout(codeDebounceRef.current);
            }
        };
    }, [codeValue, onFiltersChange]);
    
    const hasActiveFilters =
        Boolean(filters.type) ||
        filters.active !== undefined ||
        Boolean(filters.code) ||
        Boolean(filters.from) ||
        Boolean(filters.to);

    const handleChange = (
        key: keyof PayrollRuleFiltersType,
        value: string
    ) => {
        if (key === "active") {
            onFiltersChange({
                active:
                    value === ""
                        ? undefined
                        : value === "true",
            });

            return;
        }
        if (key === "type") {
            onFiltersChange({
                type:
                    value === ""
                        ? undefined
                        : (value as PayrollRuleType),
            });

            return;
        }
        onFiltersChange({
            [key]: value || undefined,
        });
    };

    const clearFilters = () => {
        if (codeDebounceRef.current) {
            clearTimeout(codeDebounceRef.current);
        }

        setCodeValue("");
        setIsCodeDebouncing(false);

        onReset();
    };

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5 text-indigo-600" />

                    <h2 className="text-sm font-semibold text-gray-900">
                        Filtros de reglas
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
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />

                            <input
                                type="text"
                                placeholder="Código de regla"
                                value={codeValue}
                                onChange={(e) => setCodeValue(e.target.value)}
                                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />

                            {isCodeDebouncing && (
                                <Loader2
                                    className="
                                        absolute
                                        right-3
                                        top-3
                                        h-4
                                        w-4
                                        animate-spin
                                        text-indigo-500
                                    "
                                />
                            )}
                        </div>
                        <div className="relative">
                            <Tags className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                            <select
                                value={filters.type ?? ""}
                                onChange={(e) =>
                                    handleChange("type", e.target.value)
                                }
                                className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            >
                                <option value="">
                                    Todos los tipos
                                </option>
                                <option value="EARNING">
                                    Ingresos
                                </option>
                                <option value="DEDUCTION">
                                    Deducciones
                                </option>
                                <option value="EMPLOYER_COST">
                                    Costos patronales
                                </option>
                            </select>
                        </div>
                        <div className="relative">
                            <ToggleLeft className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                            <select
                                value={
                                    filters.active === undefined
                                        ? ""
                                        : String(filters.active)
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "active",
                                        e.target.value
                                    )
                                }
                                className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            >
                                <option value="">
                                    Todos los estados
                                </option>
                                <option value="true">
                                    Activas
                                </option>
                                <option value="false">
                                    Inactivas
                                </option>
                            </select>
                        </div>
                        <div className="relative">
                            <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                            <input
                                type="date"
                                value={filters.from ?? ""}
                                onChange={(e) =>
                                    handleChange(
                                        "from",
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>
                        <div className="relative">
                            <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                            <input
                                type="date"
                                value={filters.to ?? ""}
                                onChange={(e) =>
                                    handleChange(
                                        "to",
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>
                        <div className="col-span-full mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                                Limpiar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}