"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Customer } from "@/types/Customer";

type FormData = {
    name: string;
    phone: string;
    email: string;
    address: string;
    identification: string;
    credit_limit: number;
};

interface Props {
    customer: Customer | null;
    onSubmit: (data: FormData) => Promise<void>;
    onCancel: () => void;
}

export function CustomerForm({ customer, onSubmit, onCancel }: Props) {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>();

    useEffect(() => {
        if (customer) {
            reset({
                name: customer.name,
                phone: customer.phone ?? "",
                email: customer.email ?? "",
                address: customer.address ?? "",
                identification: customer.identification ?? "",
                credit_limit: Number(customer.credit_limit),
            });
        } else {
            reset({
                name: "",
                phone: "",
                email: "",
                address: "",
                identification: "",
                credit_limit: 0,
            });
        }
    }, [customer, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nombre */}
            <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Nombre <span className="text-red-500">*</span>
                </label>
                <input
                    {...register("name", { required: "El nombre es obligatorio" })}
                    placeholder="Ej. Juan Pérez"
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all ${
                        errors.name 
                            ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20" 
                            : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    }`}
                />
                {errors.name && (
                    <p className="mt-1 text-xs text-red-500 font-medium">
                        {errors.name.message}
                    </p>
                )}
            </div>

            {/* Teléfono y Correo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                        Teléfono
                    </label>
                    <input
                        {...register("phone")}
                        placeholder="Ej. +505 8888 8888"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                        Correo electrónico
                    </label>
                    <input
                        type="email"
                        {...register("email")}
                        placeholder="correo@ejemplo.com"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
            </div>

            {/* Dirección */}
            <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Dirección
                </label>
                <input
                    {...register("address")}
                    placeholder="Ej. Calle Principal, #123"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
            </div>

            {/* Identificación y Límite de Crédito */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                        Identificación / RUC
                    </label>
                    <input
                        {...register("identification")}
                        placeholder="Número de cédula o RUC"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                        Límite de crédito
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        {...register("credit_limit", { valueAsNumber: true })}
                        placeholder="0.00"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-blue-500/30 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Guardando...
                        </>
                    ) : (
                        customer ? "Actualizar cliente" : "Guardar cliente"
                    )}
                </button>
            </div>
        </form>
    );
}