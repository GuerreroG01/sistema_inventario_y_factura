"use client";

import {
    Calendar,
    FolderOpen,
    SlidersHorizontal,
    ChevronDown,
    ChevronUp,
    X,
} from "lucide-react";

type Filters = {
    category?: string;
    from?: string;
    to?: string;
};

type Props = {
    filters: Filters;
    updateFilter: (key: keyof Filters, value: string) => void;
    applyFilters?: () => void;
    open: boolean;
    setOpen: (v: boolean) => void;
    categories: string[];
};

export default function ExpenseFilters({
    filters,
    updateFilter,
    applyFilters,
    open,
    setOpen,
    categories,
}: Props) {
    const hasActiveFilters = Object.values(filters).some(
        (v) => v !== "" && v !== undefined && v !== null
    );

    const clearFilters = () => {
        updateFilter("category", "");
        updateFilter("from", "");
        updateFilter("to", "");
    };

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">

                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5 text-indigo-600" />

                    <h2 className="text-sm font-semibold">
                        Filtros de egresos
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

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                    >
                        Limpiar
                    </button>
                    <button
                        onClick={() => setOpen(!open)}
                        className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs text-white"
                    >
                        {open ? (
                            <>
                                Ocultar <ChevronUp className="h-4 w-4" />
                            </>
                        ) : (
                            <>
                                Mostrar <ChevronDown className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div
                className={`overflow-hidden transition-all duration-300 ${
                    open ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"
                }`}
            >
                <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-5 shadow-sm">

                    <form
                        className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            applyFilters?.();
                        }}
                    >
                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Categoría
                            </label>

                            <div className="relative">
                                <FolderOpen className="absolute left-3 top-3 h-4 w-4 text-gray-500" />

                                <select
                                    value={filters.category ?? ""}
                                    onChange={(e) => updateFilter("category", e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                >
                                    <option value="">Todas las categorías</option>

                                    {categories.map((cat) => (
                                        <option key={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Desde
                            </label>

                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />

                                <input
                                    type="date"
                                    value={filters.from ?? ""}
                                    onChange={(e) => updateFilter("from", e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Hasta
                            </label>

                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />

                                <input
                                    type="date"
                                    value={filters.to ?? ""}
                                    onChange={(e) => updateFilter("to", e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>
                        </div>
                        <div className="flex items-end">
                            <div className="w-full rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                                <p className="text-xs font-semibold text-indigo-700">
                                    Filtro actual
                                </p>

                                <p className="mt-1 text-sm text-indigo-900">
                                    {hasActiveFilters
                                        ? "Mostrando únicamente los egresos filtrados."
                                        : "Mostrando todos los egresos registrados."}
                                </p>
                            </div>
                        </div>

                        <div className="col-span-full flex justify-end gap-3 border-t border-gray-200 pt-5">
                            {applyFilters && (
                                <button
                                    type="submit"
                                    className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
                                >
                                    Aplicar filtros
                                </button>
                            )}

                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}