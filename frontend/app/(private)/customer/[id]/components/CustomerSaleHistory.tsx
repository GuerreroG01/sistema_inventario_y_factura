"use client";

import { CustomerSalesHistoryResponse } from "@/types/Customer";
import { statusLabels } from "@/app/constants/saleStatuses";
import { paymentTypeLabels } from "@/app/constants/paymentTypes";

interface CustomerSaleHistoryProps {
    data: CustomerSalesHistoryResponse;
    onPageChange: (page: number) => void;
}

export default function CustomerSaleHistory({
    data,
    onPageChange,
}: CustomerSaleHistoryProps) {

    const {
        sales,
        pagination,
    } = data;

    const getStatusStyles = (status: string) => {
        switch (status.toLowerCase()) {
            case "completed":
                return "bg-emerald-100 text-emerald-700";

            case "pending":
                return "bg-amber-100 text-amber-700";

            case "cancelled":
                return "bg-red-100 text-red-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">

            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">
                        Historial de ventas
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        Compras realizadas por el cliente.
                    </p>
                </div>

                <span className="text-sm font-semibold text-gray-500">
                    {pagination.total} ventas
                </span>
            </div>


            {sales.length === 0 ? (

                <div className="py-16 text-center">
                    <p className="text-gray-500">
                        Este cliente todavía no tiene compras registradas.
                    </p>
                </div>

            ) : (

                <>
                    <div className="overflow-x-auto">

                        <table className="min-w-full">

                            <thead className="bg-gray-50">
                                <tr className="text-left text-sm text-gray-600">

                                    <th className="px-6 py-4">
                                        Fecha
                                    </th>

                                    <th className="px-6 py-4">
                                        Total
                                    </th>

                                    <th className="px-6 py-4">
                                        Método de pago
                                    </th>

                                    <th className="px-6 py-4">
                                        Estado
                                    </th>

                                </tr>
                            </thead>


                            <tbody>

                                {sales.map((sale) => (

                                    <tr
                                        key={sale.id}
                                        className="border-t border-gray-100 hover:bg-gray-50 transition"
                                    >

                                        <td className="px-6 py-4 text-gray-700">
                                            {new Date(
                                                sale.fecha
                                            ).toLocaleDateString("es-ES")}
                                        </td>


                                        <td className="px-6 py-4 font-semibold text-gray-900">
                                            {sale.total.toLocaleString(
                                                "es-ES",
                                                {
                                                    style: "currency",
                                                    currency: "NIO",
                                                }
                                            )}
                                        </td>


                                        <td className="px-6 py-4">

                                            <span
                                                className="
                                                    px-3
                                                    py-1
                                                    rounded-full
                                                    bg-indigo-100
                                                    text-indigo-700
                                                    text-xs
                                                    font-semibold
                                                "
                                            >
                                                {paymentTypeLabels[sale.paymentType] ?? sale.paymentType}
                                            </span>

                                        </td>


                                        <td className="px-6 py-4">

                                            <span
                                                className={`
                                                    px-3
                                                    py-1
                                                    rounded-full
                                                    text-xs
                                                    font-semibold
                                                    ${getStatusStyles(
                                                        sale.status
                                                    )}
                                                `}
                                            >
                                                {statusLabels[sale.status] ?? sale.status}
                                            </span>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>


                    <div className="
                        flex
                        justify-center
                        gap-2
                        flex-wrap
                        border-t
                        border-gray-100
                        px-6
                        py-4
                    ">

                        <button
                            type="button"
                            disabled={pagination.page === 1}
                            onClick={() =>
                                onPageChange(
                                    pagination.page - 1
                                )
                            }
                            className="
                                px-4
                                py-2
                                rounded-lg
                                bg-gray-200
                                text-gray-700
                                font-semibold
                                disabled:opacity-50
                                disabled:cursor-not-allowed
                            "
                        >
                            Anterior
                        </button>


                        {Array.from(
                            {
                                length: pagination.totalPages,
                            },
                            (_, index) => index + 1
                        ).map((page) => (

                            <button
                                key={page}
                                type="button"
                                onClick={() =>
                                    onPageChange(page)
                                }
                                className={`
                                    px-4
                                    py-2
                                    rounded-lg
                                    font-semibold
                                    transition
                                    ${
                                        page === pagination.page
                                            ? "bg-indigo-600 text-white"
                                            : "bg-white text-gray-700 hover:bg-gray-100"
                                    }
                                `}
                            >
                                {page}
                            </button>

                        ))}


                        <button
                            type="button"
                            disabled={
                                pagination.page ===
                                pagination.totalPages
                            }
                            onClick={() =>
                                onPageChange(
                                    pagination.page + 1
                                )
                            }
                            className="
                                px-4
                                py-2
                                rounded-lg
                                bg-gray-200
                                text-gray-700
                                font-semibold
                                disabled:opacity-50
                                disabled:cursor-not-allowed
                            "
                        >
                            Siguiente
                        </button>

                    </div>
                </>
            )}

        </div>
    );
}