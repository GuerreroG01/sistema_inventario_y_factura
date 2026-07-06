"use client";

import { useEffect, useState } from "react";
import { X, FileText, Tag, DollarSign, Calendar, CreditCard, Loader2 } from "lucide-react";
import { Expense } from "@/types/Expense";

interface Props {
    initialData?: Expense | null;
    onSubmit: (data: Omit<Expense, "id">) => void;
    onClose: () => void;
}

export default function ExpenseForm({
    initialData,
    onSubmit,
    onClose
}: Props) {

    const [form, setForm] = useState({
        description: "",
        amount: "",
        category: "",
        date: "",
        payment_method: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = Boolean(initialData?.id);

    useEffect(() => {
        if (initialData) {
            setForm({
                description: initialData.description || "",
                amount: String(initialData.amount || ""),
                category: initialData.category || "",
                date: initialData.date || "",
                payment_method: initialData.payment_method || ""
            });
        } else {
            setForm({
                description: "",
                amount: "",
                category: "",
                date: new Date().toISOString().split("T")[0],
                payment_method: ""
            });
        }
    }, [initialData]);

    const inputClass =
        "w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 placeholder:text-slate-400";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await onSubmit({
                description: form.description,
                amount: Number(form.amount),
                category: form.category,
                date: form.date,
                payment_method: form.payment_method
            });

            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={!isSubmitting ? onClose : undefined} />
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-10">
                <div className="px-6 py-5 border-b bg-slate-50/70 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-black text-slate-900">
                            {isEditMode ? "Editar Egreso" : "Nuevo Egreso"}
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Registro de salidas de dinero del negocio
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="p-2 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition"
                    >
                        <X size={18} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="relative">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                            Descripción
                        </label>
                        <FileText className="w-4 h-4 absolute left-3 top-9 text-slate-400" />
                        <input
                            className={inputClass}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Ej. Compra de insumos"
                            required
                        />
                    </div>
                    <div className="relative">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                            Monto
                        </label>
                        <DollarSign className="w-4 h-4 absolute left-3 top-9 text-slate-400" />
                        <input
                            type="number"
                            step="0.01"
                            className={inputClass}
                            value={form.amount}
                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                            placeholder="0.00"
                            required
                        />
                    </div>
                    <div className="relative">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                            Categoría
                        </label>
                        <Tag className="w-4 h-4 absolute left-3 top-9 text-slate-400" />
                        <input
                            className={inputClass}
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            placeholder="Ej. Operación / Logística"
                        />
                    </div>
                    <div className="relative">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                            Fecha
                        </label>
                        <Calendar className="w-4 h-4 absolute left-3 top-9 text-slate-400" />
                        <input
                            type="date"
                            className={inputClass}
                            value={form.date}
                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                        />
                    </div>
                    <div className="relative sm:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                            Método de pago
                        </label>
                        <CreditCard className="w-4 h-4 absolute left-3 top-9 text-slate-400" />
                        <input
                            className={inputClass}
                            value={form.payment_method}
                            onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                            placeholder="Efectivo, Tarjeta, Transferencia..."
                        />
                    </div>
                    <div className="sm:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/10 transition flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : isEditMode ? (
                                "Actualizar Egreso"
                            ) : (
                                "Guardar Egreso"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}