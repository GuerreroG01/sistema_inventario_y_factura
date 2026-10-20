"use client";

import { useState, useEffect } from "react";
import { X, CalendarDays, Save, Loader2 } from "lucide-react";
import type { PayrollPeriod, CreatePayrollPeriodData } from "@/types/worksheet/payroll/PayrollPeriod";
import ModalError from "@/components/ModalError";

type PayrollPeriodFormProps = {
    isOpen: boolean;
    onClose: () => void;
    formError: string | null;
    onSubmit: (data: CreatePayrollPeriodData) => Promise<any>;
    initialData?: PayrollPeriod | null;
};

export default function PayrollPeriodForm({
    isOpen, onClose, formError, onSubmit, initialData,
}: PayrollPeriodFormProps) {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [paymentDate, setPaymentDate] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const isEditing = Boolean(initialData);

    useEffect(() => {
        if (initialData) {
            setStartDate(initialData.start_date || "");
            setEndDate(initialData.end_date || "");
            setPaymentDate(initialData.payment_date || "");
        } else {
            setStartDate("");
            setEndDate("");
            setPaymentDate("");
        }

        setIsErrorModalOpen(false);
    }, [initialData, isOpen]);

    const showError = (message: string) => {
        setIsErrorModalOpen(true);
    };

    const handleCloseError = () => {
        setIsErrorModalOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsErrorModalOpen(false);

        if (!startDate || !endDate || !paymentDate) {
            showError("Por favor completa todos los campos requeridos.");
            return;
        }

        if (endDate < startDate) {
            showError(
                "La fecha de fin no puede ser anterior a la fecha de inicio."
            );
            return;
        }

        try {
            setIsSubmitting(true);

            await onSubmit({
                start_date: startDate,
                end_date: endDate,
                payment_date: paymentDate,
            });

            onClose();
        } catch (error: unknown) {
            showError(
                error instanceof Error
                    ? error.message
                    : "Ocurrió un error al guardar el período."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (formError) {
            setIsErrorModalOpen(true);
        } else {
            setIsErrorModalOpen(false);
        }
    }, [formError]);

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
                <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-indigo-50 p-2.5 text-indigo-600 shadow-xs">
                                <CalendarDays className="h-5 w-5" />
                            </div>

                            <div>
                                <h2 className="text-base font-bold text-slate-900">
                                    {isEditing
                                        ? `Editar Período #${initialData?.id}`
                                        : "Nuevo Período de Nómina"}
                                </h2>

                                <p className="text-xs text-slate-500">
                                    {isEditing
                                        ? "Modifica las fechas del ciclo de pago."
                                        : "Define el ciclo y la fecha de pago del período."}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 active:scale-95 disabled:opacity-50"
                            aria-label="Cerrar formulario"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Fecha de Inicio
                            </label>

                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                disabled={isSubmitting}
                                required
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-xs transition-all focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Fecha de Fin
                            </label>

                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                disabled={isSubmitting}
                                required
                                min={startDate || undefined}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-xs transition-all focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Fecha de Pago
                            </label>

                            <input
                                type="date"
                                value={paymentDate}
                                onChange={(e) => setPaymentDate(e.target.value)}
                                disabled={isSubmitting}
                                required
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-xs transition-all focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50"
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/25 transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Guardando...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        <span>
                                            {isEditing
                                                ? "Guardar Cambios"
                                                : "Crear Período"}
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <ModalError
                open={isErrorModalOpen}
                message={formError ?? ""}
                title="Error en período de nómina"
                onClose={handleCloseError}
            />
        </>
    );
}