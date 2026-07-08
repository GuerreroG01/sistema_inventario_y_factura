"use client";

import { useExpiringProductsMetrics } from "../../hooks/useExpiringProductsMetrics";
import { ExpirationIcon } from "./Icons/ExpirationIcon";
import { ExpiringProductRow } from "./ExpiringProductRow";

export default function ExpiringProductsMetrics() {
    const {
        data, loading, error, page, setPage
    } = useExpiringProductsMetrics();

    if (loading) {
        return (
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-64 mb-8"/>
                {[1,2,3,4,5].map(i=>
                    <div
                        key={i}
                        className="h-14 rounded-xl bg-gray-100 mb-3"
                    />
                )}
            </div>
        );
    }

    if(error){
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <h3 className="font-semibold">
                    Error obteniendo productos próximos a vencer
                </h3>
                <p className="text-sm text-red-600 mt-2">
                    {error}
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-3xl border border-gray-200/80 bg-white p-8 shadow-sm relative overflow-hidden">
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-amber-50 rounded-full blur-3xl"/>
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-red-50 rounded-full blur-3xl"/>
            <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <ExpirationIcon className="w-5 h-5 text-gray-500"/>
                            Productos Próximos a Vencer
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">
                            Productos cuya fecha de vencimiento ocurre durante los próximos 30 días.
                        </p>
                    </div>
                    <div className="rounded-full bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700">
                        {data.pagination.total} Productos
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-100">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr className="text-xs uppercase text-gray-500">
                                <th className="px-6 py-4 text-left">
                                    Producto
                                </th>
                                <th className="px-6 py-4 text-left">
                                    Categoría
                                </th>
                                <th className="px-6 py-4 text-center">
                                    Stock
                                </th>
                                <th className="px-6 py-4 text-right">
                                    Vence
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                data.products.map(product=>(
                                    <ExpiringProductRow
                                        key={product.id}
                                        product={product}
                                    />
                                ))
                            }
                        </tbody>
                    </table>
                </div>
                {
                    data.pagination.totalPages>1 && (
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                disabled={page===1}
                                onClick={()=>setPage(page-1)}
                                className="px-4 py-2 rounded-xl border border-gray-200 text-sm hover:bg-gray-50 disabled:opacity-40"
                            >
                                Anterior
                            </button>
                            <button
                                disabled={page===data.pagination.totalPages}
                                onClick={()=>setPage(page+1)}
                                className="px-4 py-2 rounded-xl border border-gray-200 text-sm hover:bg-gray-50 disabled:opacity-40"
                            >
                                Siguiente
                            </button>
                        </div>
                    )
                }
            </div>
        </div>
    );
}