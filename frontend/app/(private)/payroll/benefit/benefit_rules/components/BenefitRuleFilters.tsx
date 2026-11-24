
"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Tags, ToggleLeft, CalendarDays, X, SlidersHorizontal, ChevronDown,
    ChevronUp, Loader2, Users
} from "lucide-react";

import type {
    BenefitRuleFilters as BenefitRuleFiltersType, BenefitType, BenefitRuleScope
} from "@/types/worksheet/benefit/BenefitRule";

type Props = {
    filters: BenefitRuleFiltersType;
    onFiltersChange: (
        filters: Partial<BenefitRuleFiltersType>
    ) => void;
    onReset: () => void;
};

export default function BenefitRuleFilters({
    filters, onFiltersChange, onReset
}: Props) {
    const [open, setOpen] = useState(false);
    const [nameValue, setNameValue] = useState(filters.name ?? "");
    const [isDebouncing, setIsDebouncing] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setNameValue(filters.name ?? "");
    }, [filters.name]);

    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (nameValue === (filters.name ?? "")) {
            setIsDebouncing(false);
            return;
        }

        setIsDebouncing(true);

        debounceRef.current = setTimeout(() => {
            onFiltersChange({
                name: nameValue.trim() || undefined,
            });

            setIsDebouncing(false);
        }, 800);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [nameValue, filters.name, onFiltersChange]);

    const hasActiveFilters =
        Boolean(filters.type) ||
        Boolean(filters.scope) ||
        filters.active !== undefined ||
        Boolean(filters.name) ||
        Boolean(filters.from) ||
        Boolean(filters.to);

    const handleChange = (
        key: keyof BenefitRuleFiltersType,
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
                type: value
                    ? (value as BenefitType)
                    : undefined,
            });

            return;
        }

        if (key === "scope") {
            onFiltersChange({
                scope: value
                    ? (value as BenefitRuleScope)
                    : undefined,
            });

            return;
        }

        if (key === "from" || key === "to") {
            onFiltersChange({
                [key]: value || undefined,
            });

            return;
        }
    };

    const clearFilters = () => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        setNameValue("");
        setIsDebouncing(false);

        onReset();
    };

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5 text-emerald-600" />
                    <h2 className="text-sm font-semibold text-gray-900">
                        Filtros de reglas
                    </h2>
                    {hasActiveFilters && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                            activos
                        </span>
                    )}
                    {!open && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                            ocultos
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
                        onClick={() => setOpen((previous) => !previous)}
                        className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-700"
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
                        onSubmit={(event) => event.preventDefault()}
                    >
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />

                            <input
                                type="text"
                                placeholder="Nombre de la regla"
                                value={nameValue}
                                onChange={(event) =>
                                    setNameValue(event.target.value)
                                }
                                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            />

                            {isDebouncing && (
                                <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-emerald-500" />
                            )}
                        </div>
                        <div className="relative">
                            <Tags className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                            <select
                                value={filters.type ?? ""}
                                onChange={(event) =>
                                    handleChange(
                                        "type",
                                        event.target.value
                                    )
                                }
                                className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            >
                                <option value="">Todos los tipos</option>
                                <option value="VACATION">
                                    Vacaciones
                                </option>
                                <option value="THIRTEENTH_MONTH">
                                    Décimo tercer mes
                                </option>
                                <option value="SEVERANCE">
                                    Indemnización
                                </option>
                                <option value="TRANSPORT">
                                    Transporte
                                </option>
                                <option value="FOOD">
                                    Alimentación
                                </option>
                                <option value="OTHER">Otros</option>
                            </select>
                        </div>
                        <div className="relative">
                            <Users className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                            <select
                                value={filters.scope ?? ""}
                                onChange={(event) =>
                                    handleChange(
                                        "scope",
                                        event.target.value
                                    )
                                }
                                className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            >
                                <option value="">Todos los ámbitos</option>
                                <option value="GLOBAL">Global</option>
                                <option value="EMPLOYEE">
                                    Por empleado
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
                                onChange={(event) =>
                                    handleChange(
                                        "active",
                                        event.target.value
                                    )
                                }
                                className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            >
                                <option value="">Todos los estados</option>
                                <option value="true">Activas</option>
                                <option value="false">Inactivas</option>
                            </select>
                        </div>
                        <div className="relative">
                            <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                            <input
                                type="date"
                                aria-label="Fecha inicial desde"
                                value={filters.from ?? ""}
                                max={filters.to ?? undefined}
                                onChange={(event) =>
                                    handleChange(
                                        "from",
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>
                        <div className="relative">
                            <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                            <input
                                type="date"
                                aria-label="Fecha inicial hasta"
                                min={filters.from ?? undefined}
                                value={filters.to ?? ""}
                                onChange={(event) =>
                                    handleChange(
                                        "to",
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>
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