"use client";

import { Search, Barcode, Tags, ToggleLeft, DollarSign, X, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";

type Props = {
    filters: any;
    updateFilter: (key: string, value: string) => void;
    applyFilters?: () => void;
    open: boolean;
    setOpen: (v:boolean) => void;
    categories: string[];
};

export default function ProductFilters({
    filters, updateFilter, applyFilters, open, setOpen, categories
}: Props) {

    const hasActiveFilters = Object.values(filters).some(
        (v) => v !== "" && v !== null && v !== undefined
    );

    const clearFilters = () => {
        updateFilter("name", "");
        updateFilter("barcode", "");
        updateFilter("category", "");
        updateFilter("active", "");
        updateFilter("priceMin", "");
        updateFilter("priceMax", "");
    };

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
                
                <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-indigo-600" />

                <h2 className="text-sm font-semibold text-gray-900">
                    Filtros de productos
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
                        onClick={clearFilters}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
                    >
                        <X className="inline h-4 w-4" /> Limpiar
                    </button>

                    <button
                        onClick={() => setOpen(!open)}
                        className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-indigo-700"
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
                open ? "max-h-[600px] opacity-100 mt-4" : "max-h-0 opacity-0"
                }`}
            >
                <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-5 shadow-sm">
                
                <form
                    className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        applyFilters?.();
                    }}
                >
                    
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <input
                            placeholder="Buscar por nombre"
                            value={filters.name}
                            onChange={(e) => updateFilter("name", e.target.value)}
                            className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>

                    <div className="relative">
                        <Barcode className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <input
                            placeholder="Código de barras"
                            value={filters.barcode}
                            onChange={(e) => updateFilter("barcode", e.target.value)}
                            className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>

                    <div className="relative">
                        <Tags className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <select
                            value={filters.category}
                            onChange={(e) => updateFilter("category", e.target.value)}
                            className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        >
                            <option value="">Todas las categorías</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="relative">
                        <ToggleLeft className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <select
                            value={filters.active}
                            onChange={(e) => updateFilter("active", e.target.value)}
                            className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        >
                            <option value="">Todos los estados</option>
                            <option value="true">Activos</option>
                            <option value="false">Inactivos</option>
                        </select>
                    </div>

                    <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <input
                            type="number"
                            placeholder="Precio mínimo"
                            value={filters.priceMin}
                            onChange={(e) => updateFilter("priceMin", e.target.value)}
                            className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>

                    <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <input
                            type="number"
                            placeholder="Precio máximo"
                            value={filters.priceMax}
                            onChange={(e) => updateFilter("priceMax", e.target.value)}
                            className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>

                    <div className="col-span-full mt-5 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Limpiar
                        </button>

                        {applyFilters && (
                            <button
                                type="submit"
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
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