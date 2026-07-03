import { Expense } from "@/types/Expense";
import { Pencil, Trash2 } from "lucide-react";

interface Props {
    expenses: Expense[];
    onEdit: (expense: Expense) => void;
    onDelete: (id: number) => void;
}

export default function ExpensesTable({
    expenses,
    onEdit,
    onDelete
}: Props) {
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
                                    {new Date(exp.date).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-rose-600">
                                    C${Number(exp.amount).toFixed(2)}
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2">
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

                                    </div>
                                </td>

                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>

        </div>
    );
}