"use client";

import { Search, ArrowDownUp, Calendar, Hash, PackageSearch, SlidersHorizontal, X, ChevronDown, ChevronUp, FileText } from "lucide-react";
import type { InventoryMovementsFilters as InventoryMovementsFiltersType } from "@/types/inventoryMov";

type Props = {
    filters: InventoryMovementsFiltersType;
    updateFilter: (
        key: keyof InventoryMovementsFiltersType,
        value: string
    ) => void;
    applyFilters?: () => void;
    open: boolean;
    setOpen: (value:boolean)=>void;

};

export default function InventoryMovementsFilters({filters, updateFilter, applyFilters, open, setOpen}: Props) {
    const hasActiveFilters = Object.values(filters).some(
        (value) =>
            value !== "" &&
            value !== null &&
            value !== undefined
    );

    const clearFilters = () => {
        updateFilter("product", "");
        updateFilter("tipo", "");
        updateFilter("startDate", "");
        updateFilter("endDate", "");
        updateFilter("referencia", "");
        updateFilter("cantidadMin", "");
        updateFilter("cantidadMax", "");

    };

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal
                        className="h-5 w-5 text-indigo-600"
                    />
                    <h2 className="text-sm font-semibold text-gray-900">
                        Filtros de movimientos
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
                        className="
                            rounded-lg
                            border
                            border-gray-200
                            bg-white
                            px-3
                            py-1.5
                            text-xs
                            font-medium
                            text-gray-600
                            shadow-sm
                            hover:bg-gray-50
                        "
                    >
                        <X className="inline h-4 w-4" />
                        Limpiar
                    </button>
                    <button
                        onClick={() => setOpen(!open)}
                        className="
                            flex
                            items-center
                            gap-1
                            rounded-lg
                            bg-indigo-600
                            px-3
                            py-1.5
                            text-xs
                            font-medium
                            text-white
                            hover:bg-indigo-700
                        "
                    >
                        {
                            open
                            ?
                            <>
                                Ocultar
                                <ChevronUp className="h-4 w-4"/>
                            </>
                            :
                            <>
                                Mostrar
                                <ChevronDown className="h-4 w-4"/>
                            </>
                        }
                    </button>
                </div>
            </div>
            <div
                className={`
                    overflow-hidden
                    transition-all
                    duration-300
                    ${
                        open
                        ?
                        "max-h-[700px] opacity-100 mt-4"
                        :
                        "max-h-0 opacity-0"
                    }
                `}
            >
                <div
                    className="
                        rounded-2xl
                        border
                        border-gray-200
                        bg-gradient-to-b
                        from-white
                        to-gray-50
                        p-5
                        shadow-sm
                    "
                >
                    <form
                        onSubmit={(e)=>{
                            e.preventDefault();
                            applyFilters?.();
                        }}
                        className="
                            grid
                            grid-cols-1
                            gap-4
                            md:grid-cols-2
                            lg:grid-cols-3
                        "
                    >
                        <div className="relative">

                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500"/>

                            <input
                                placeholder="Buscar producto"
                                value={filters.product}
                                onChange={(e)=>
                                    updateFilter(
                                        "product",
                                        e.target.value
                                    )
                                }
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-gray-300
                                    py-2.5
                                    pl-10
                                    text-sm
                                "
                            />
                        </div>
                        <div className="relative">
                            <ArrowDownUp className="absolute left-3 top-3 h-4 w-4 text-gray-500"/>
                            <select
                                value={filters.tipo}
                                onChange={(e)=>
                                    updateFilter(
                                        "tipo",
                                        e.target.value
                                    )
                                }
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-gray-300
                                    py-2.5
                                    pl-10
                                    text-sm
                                "
                            >
                                <option value="">
                                    Todos los movimientos
                                </option>
                                <option value="entrada">
                                    Entradas
                                </option>
                                <option value="salida">
                                    Salidas
                                </option>
                                <option value="ajuste">
                                    Ajuste
                                </option>
                            </select>
                        </div>
                        <div className="relative">
                            <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-500"/>
                            <input
                                type="number"
                                placeholder="Referencia venta"
                                value={filters.referencia}
                                onChange={(e)=>
                                    updateFilter(
                                        "referencia",
                                        e.target.value
                                    )
                                }
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-gray-300
                                    py-2.5
                                    pl-10
                                    text-sm
                                "
                            />
                        </div>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500"/>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e)=>
                                    updateFilter(
                                        "startDate",
                                        e.target.value
                                    )
                                }
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-gray-300
                                    py-2.5
                                    pl-10
                                "
                            />
                        </div>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500"/>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e)=>
                                    updateFilter(
                                        "endDate",
                                        e.target.value
                                    )
                                }
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-gray-300
                                    py-2.5
                                    pl-10
                                "
                            />
                        </div>
                        <div className="relative">
                            <PackageSearch className="absolute left-3 top-3 h-4 w-4 text-gray-500"/>
                            <input
                                type="number"
                                placeholder="Cantidad mínima"
                                value={filters.cantidadMin}
                                onChange={(e)=>
                                    updateFilter(
                                        "cantidadMin",
                                        e.target.value
                                    )
                                }
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-gray-300
                                    py-2.5
                                    pl-10
                                "
                            />
                        </div>
                        <div className="col-span-full flex justify-end">
                            {applyFilters && (
                                <button
                                    type="submit"
                                    className="
                                        rounded-lg
                                        bg-indigo-600
                                        px-5
                                        py-2
                                        text-sm
                                        font-medium
                                        text-white
                                        hover:bg-indigo-700
                                    "
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