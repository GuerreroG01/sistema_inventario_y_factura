"use client";
import { useState, useEffect, useRef } from "react";
import { useInventoryMovements } from "../../hooks/useInventoryMovements";
import InventoryMovementsFilters from "./InventoryMovementsFilters";

export default function InventoryMovements() {
    const containerRef = useRef<HTMLDivElement>(null);
    const {
        movements, pagination, loading, error, page, setPage, filters, updateFilter, applyFilters
    } = useInventoryMovements();
    const [filtersOpen, setFiltersOpen] = useState(false);
    const pages = Array.from(
        { length: pagination.totalPages },
        (_, index) => index + 1
    );
    useEffect(() => {
        containerRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }, [page]);
    if (loading) {
        return (
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
                <div className="h-7 w-56 rounded bg-gray-200 mb-6"/>

                {[...Array(10)].map((_, index) => (
                    <div
                        key={index}
                        className="h-12 bg-gray-100 rounded-lg mb-3"
                    />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <p className="font-semibold text-red-700">
                    Error obteniendo movimientos
                </p>

                <p className="text-sm text-red-600 mt-2">
                    {error}
                </p>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 pt-6">
                <InventoryMovementsFilters
                    filters={filters}
                    updateFilter={updateFilter}
                    applyFilters={applyFilters}
                    open={filtersOpen}
                    setOpen={setFiltersOpen}
                />
            </div>
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">
                        Movimientos de Inventario
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Historial de entradas y salidas del inventario.
                    </p>
                </div>
                <span className="text-sm font-semibold text-gray-500">
                    {pagination.total} registros
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr className="text-left text-sm text-gray-600">
                            <th className="px-6 py-4">
                                Producto
                            </th>
                            <th className="px-6 py-4">
                                Tipo
                            </th>
                            <th className="px-6 py-4">
                                Cantidad
                            </th>
                            <th className="px-6 py-4">
                                Fecha
                            </th>
                            <th className="px-6 py-4">
                                Referencia
                            </th>
                            <th className="px-6 py-4">
                                Observación
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {movements.map((movement) => (
                            <tr
                                key={movement.id}
                                className="border-t border-gray-100 hover:bg-gray-50 transition"
                            >
                                <td className="px-6 py-4 font-medium text-gray-800">
                                    {movement.product.name}
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`
                                            px-3
                                            py-1
                                            rounded-full
                                            text-xs
                                            font-semibold
                                            ${
                                                movement.tipo === "entrada"
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-red-100 text-red-700"
                                            }
                                        `}
                                    >
                                        {movement.tipo.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-mono">
                                    {movement.cantidad}
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {new Date(
                                        movement.fecha
                                    ).toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    {
                                        movement.referencia ??
                                        "-"
                                    }
                                </td>
                                <td className="px-6 py-4">
                                    {
                                        movement.observacion ??
                                        "-"
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-center mt-6 gap-2 flex-wrap border-t border-gray-100 px-6 py-4">
                <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="
                        px-4
                        py-2
                        rounded-lg
                        bg-gray-200
                        text-gray-700
                        font-semibold
                        shadow
                        hover:bg-gray-300
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                        transition
                    "
                >
                    Anterior
                </button>

                {pages.map((p) => (

                    <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p)}
                        className={`
                            px-4
                            py-2
                            rounded-lg
                            font-semibold
                            shadow
                            transition
                            ${
                                p === page
                                    ? "bg-indigo-600 text-white shadow-lg scale-105"
                                    : "bg-white text-gray-700 hover:bg-gray-100"
                            }
                        `}
                    >
                        {p}
                    </button>

                ))}

                <button
                    type="button"
                    disabled={page === pagination.totalPages}
                    onClick={() => setPage(page + 1)}
                    className="
                        px-4
                        py-2
                        rounded-lg
                        bg-gray-200
                        text-gray-700
                        font-semibold
                        shadow
                        hover:bg-gray-300
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                        transition
                    "
                >
                    Siguiente
                </button>

            </div>
        </div>
    );
}