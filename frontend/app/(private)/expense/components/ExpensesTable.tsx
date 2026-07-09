import { Expense } from "@/types/Expense";
import { Pencil, Trash2 } from "lucide-react";

interface Props {
    expenses: Expense[];
    page: number;
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    } | null;
    onPageChange: (page: number) => void;
    onEdit: (expense: Expense) => void;
    onDelete: (id: number) => void;
    canModifyExpense: (date: string) => boolean;
}

export default function ExpensesTable({ expenses, page, pagination, onPageChange, onEdit, onDelete, canModifyExpense }: Props) {
    const pages = pagination
        ? Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
        : [];
    return (
        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">

            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">
                        Gastos
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Registro de Egresos del Negocio
                    </p>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full">

                    <thead className="bg-gray-50">
                        <tr className="text-left text-sm text-gray-600">
                            <th className="px-6 py-4">Descripción</th>
                            <th className="px-6 py-4">Categoría</th>
                            <th className="px-6 py-4">Fecha</th>
                            <th className="px-6 py-4 text-right">Monto</th>
                            <th className="px-6 py-4 text-center">Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        {expenses.map((exp) => (
                            <tr
                                key={exp.id}
                                className="border-t border-gray-100 hover:bg-gray-50 transition"
                            >
                                <td className="px-6 py-4 font-medium text-gray-800">
                                    {exp.description}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                        {exp.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {exp.date.split("-").reverse().join("/")}
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-rose-600">
                                    C${Number(exp.amount).toFixed(2)}
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        {canModifyExpense(exp.date) && (
                                            <>
                                                <button
                                                    onClick={() => onEdit(exp)}
                                                    className="
                                                        inline-flex items-center justify-center
                                                        w-9 h-9
                                                        rounded-xl
                                                        bg-indigo-50 text-indigo-600
                                                        border border-indigo-100
                                                        shadow-sm
                                                        hover:bg-indigo-100
                                                        hover:shadow
                                                        hover:-translate-y-0.5
                                                        active:translate-y-0
                                                        transition-all duration-200
                                                    "
                                                    title="Editar"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(exp.id)}
                                                    className="
                                                        inline-flex items-center justify-center
                                                        w-9 h-9
                                                        rounded-xl
                                                        bg-rose-50 text-rose-600
                                                        border border-rose-100
                                                        shadow-sm
                                                        hover:bg-rose-100
                                                        hover:shadow
                                                        hover:-translate-y-0.5
                                                        active:translate-y-0
                                                        transition-all duration-200
                                                    "
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}

                                    </div>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {pagination && pagination.totalPages > 1 && (
                <div className="border-t border-gray-100 px-6 py-4">
                    <div className="mb-4 flex justify-between items-center text-sm text-gray-500">
                        <span>
                            Mostrando página{" "}
                            <span className="font-semibold text-gray-700">
                                {pagination.page}
                            </span>{" "}
                            de{" "}
                            <span className="font-semibold text-gray-700">
                                {pagination.totalPages}
                            </span>
                        </span>
                        <span>
                            {pagination.total} registros
                        </span>
                    </div>
                    <div className="flex justify-center gap-2 flex-wrap">
                        <button
                            type="button"
                            disabled={page === 1}
                            onClick={() => onPageChange(page - 1)}
                            className="
                                px-4
                                py-2
                                rounded-xl
                                bg-gray-100
                                text-gray-700
                                font-medium
                                border border-gray-200
                                shadow-sm
                                hover:bg-gray-200
                                disabled:opacity-50
                                disabled:cursor-not-allowed
                                transition-all
                            "
                        >
                            Anterior
                        </button>
                        {pages.map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => onPageChange(p)}
                                className={`
                                    min-w-[42px]
                                    h-[42px]
                                    rounded-xl
                                    font-semibold
                                    border
                                    transition-all
                                    ${
                                        p === page
                                            ? "bg-indigo-600 border-indigo-600 text-white shadow-md scale-105"
                                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                                    }
                                `}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            type="button"
                            disabled={page === pagination.totalPages}
                            onClick={() => onPageChange(page + 1)}
                            className="
                                px-4
                                py-2
                                rounded-xl
                                bg-gray-100
                                text-gray-700
                                font-medium
                                border border-gray-200
                                shadow-sm
                                hover:bg-gray-200
                                disabled:opacity-50
                                disabled:cursor-not-allowed
                                transition-all
                            "
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}