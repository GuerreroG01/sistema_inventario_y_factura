"use client";

import { useEffect, useState } from "react";
import { X,  UserX, CalendarDays, Briefcase, Building2 } from "lucide-react";
import type { EmployeeEmployment } from "@/types/worksheet/employee/Employment";
import { formatDate } from "../utils/formatDate";

type EndEmploymentModalProps = {
    open: boolean;
    employment: EmployeeEmployment | null;
    onClose: () => void;
    onConfirm: (endDate: string) => Promise<EmployeeEmployment>;
};

export function EndEmploymentModal({ open, employment, onClose, onConfirm }: EndEmploymentModalProps) {
    const [endDate, setEndDate] = useState("");
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        setFormError(null);
        const today = new Date().toISOString().split("T")[0];
        setEndDate(today);
    }, [open]);

    if (!open || !employment) return null;

    const today = new Date().toISOString().split("T")[0];
    const minEndDate =
        employment.start_date > today
            ? employment.start_date
            : today;

    const handleSubmit = async ( event: React.FormEvent<HTMLFormElement> ) => {
        event.preventDefault();
        setFormError(null);
        if (!endDate) {
            setFormError(
                "Selecciona la fecha de finalización antes de continuar."
            );
            return;
        }
        if (endDate < employment.start_date) {
            setFormError(
                "La fecha de finalización no puede ser anterior a la fecha de inicio."
            );
            return;
        }
        if (endDate < today) {
            setFormError(
                "La fecha de finalización no puede ser anterior a la fecha actual."
            );

            return;
        }
        try {
            setSaving(true);
            await onConfirm(endDate);
            onClose();
        } catch (error) {
            setFormError(
                error instanceof Error
                    ? error.message
                    : "Ocurrió un error al finalizar la relación laboral."
            );
        } finally {
            setSaving(false);
        }
    };
    return (
        <div
            className="
                fixed
                left-0
                right-0
                top-16
                bottom-0
                z-[9999]
                flex
                items-center
                justify-center
                overflow-y-auto
                bg-slate-950/55
                p-4
                backdrop-blur-sm
                sm:p-6
            "
            onMouseDown={(event) => {
                if (
                    event.target === event.currentTarget &&
                    !saving
                ) {
                    onClose();
                }
            }}
        >
            <div
                className="
                    relative
                    flex
                    w-full
                    max-w-3xl
                    max-h-full
                    flex-col
                    overflow-hidden
                    rounded-3xl
                    border
                    border-slate-200
                    bg-white
                    shadow-2xl
                "
            >
                <div
                    className="
                        pointer-events-none
                        absolute
                        -right-32
                        -top-32
                        h-64
                        w-64
                        rounded-full
                        bg-rose-100/60
                        blur-3xl
                    "
                />
                <div
                    className="
                        relative
                        flex
                        shrink-0
                        items-center
                        justify-between
                        border-b
                        border-slate-100
                        bg-white
                        px-5
                        py-4
                        sm:px-7
                        sm:py-5
                    "
                >
                    <div className="flex min-w-0 items-center gap-3">
                        <div
                            className="
                                shrink-0
                                rounded-2xl
                                bg-rose-600
                                p-2.5
                                text-white
                                shadow-md
                                shadow-rose-500/20
                            "
                        >
                            <UserX className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                            <h2
                                className="
                                    truncate
                                    text-lg
                                    font-extrabold
                                    tracking-tight
                                    text-slate-900
                                    sm:text-xl
                                "
                            >
                                Finalizar relación laboral
                            </h2>

                            <p className="mt-0.5 text-xs text-slate-500">
                                Registra la fecha en que finalizará
                                la relación laboral.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        disabled={saving}
                        onClick={onClose}
                        className="
                            ml-3
                            shrink-0
                            rounded-xl
                            p-2
                            text-slate-400
                            transition-colors
                            hover:bg-slate-100
                            hover:text-slate-700
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div
                        className="
                            min-h-0
                            flex-1
                            overflow-y-auto
                            overscroll-contain
                        "
                    >
                        <div className="space-y-6 p-5 sm:p-7">
                            <div
                                className="
                                    rounded-2xl
                                    border
                                    border-amber-200
                                    bg-amber-50
                                    px-4
                                    py-3.5
                                "
                            >
                                <p className="text-sm font-semibold text-amber-800">
                                    ¿Deseas finalizar esta relación laboral?
                                </p>

                                <p className="mt-1 text-xs leading-5 text-amber-700">
                                    Al confirmar, esta relación dejará de
                                    estar activa y quedará registrada en el
                                    historial laboral del empleado.
                                </p>
                            </div>
                            <div>
                                <div className="mb-4 flex items-center gap-2">
                                    <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                                        <Briefcase className="h-4 w-4" />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800">
                                            Relación laboral
                                        </h3>

                                        <p className="text-xs text-slate-400">
                                            Información de la relación que será
                                            finalizada.
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div
                                        className="
                                            rounded-xl
                                            border
                                            border-slate-100
                                            bg-slate-50
                                            p-4
                                        "
                                    >
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Cargo
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-slate-800">
                                            {employment.position}
                                        </p>
                                    </div>
                                    <div
                                        className="
                                            rounded-xl
                                            border
                                            border-slate-100
                                            bg-slate-50
                                            p-4
                                        "
                                    >
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-3.5 w-3.5 text-slate-400" />

                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Departamento
                                            </p>
                                        </div>

                                        <p className="mt-1 text-sm font-semibold text-slate-800">
                                            {employment.department ||
                                                "Sin departamento"}
                                        </p>
                                    </div>
                                    <div
                                        className="
                                            rounded-xl
                                            border
                                            border-slate-100
                                            bg-slate-50
                                            p-4
                                            sm:col-span-2
                                        "
                                    >
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Fecha de inicio
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-slate-800">
                                            {formatDate(
                                                employment.start_date
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label
                                    className="
                                        mb-1.5
                                        flex
                                        items-center
                                        gap-1.5
                                        text-[11px]
                                        font-bold
                                        uppercase
                                        tracking-wider
                                        text-slate-500
                                    "
                                >
                                    Fecha de finalización
                                    <span className="text-rose-500">
                                        *
                                    </span>
                                </label>
                                <div className="relative">
                                    <CalendarDays
                                        className="
                                            pointer-events-none
                                            absolute
                                            left-3.5
                                            top-1/2
                                            h-4
                                            w-4
                                            -translate-y-1/2
                                            text-slate-400
                                        "
                                    />
                                    <input
                                        type="date"
                                        value={endDate}
                                        min={minEndDate}
                                        required
                                        disabled={saving}
                                        onChange={(event) =>
                                            setEndDate(
                                                event.target.value
                                            )
                                        }
                                        className="
                                            w-full
                                            rounded-xl
                                            border
                                            border-slate-200
                                            bg-white
                                            py-3
                                            pl-10
                                            pr-3
                                            text-sm
                                            text-slate-800
                                            outline-none
                                            transition-all
                                            focus:border-rose-500
                                            focus:ring-4
                                            focus:ring-rose-500/10
                                            hover:border-slate-300
                                            disabled:cursor-not-allowed
                                            disabled:bg-slate-50
                                            disabled:opacity-60
                                        "
                                    />
                                </div>
                                <p className="mt-1.5 text-xs text-slate-400">
                                    La fecha no puede ser anterior a hoy
                                    ni a la fecha de inicio de la relación.
                                </p>
                            </div>
                            {formError && (
                                <div
                                    className="
                                        rounded-2xl
                                        border
                                        border-rose-200
                                        bg-rose-50
                                        px-4
                                        py-3
                                        text-sm
                                        font-medium
                                        text-rose-700
                                    "
                                >
                                    {formError}
                                </div>
                            )}
                        </div>
                    </div>
                    <div
                        className="
                            relative
                            shrink-0
                            border-t
                            border-slate-100
                            bg-white
                            px-5
                            py-4
                            sm:px-7
                        "
                    >
                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                disabled={saving}
                                onClick={onClose}
                                className="
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    bg-white
                                    px-5
                                    py-2.5
                                    text-sm
                                    font-semibold
                                    text-slate-700
                                    shadow-sm
                                    transition-colors
                                    hover:bg-slate-50
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={saving || !endDate}
                                className="
                                    inline-flex
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-2xl
                                    bg-rose-600
                                    px-6
                                    py-2.5
                                    text-sm
                                    font-semibold
                                    text-white
                                    shadow-lg
                                    shadow-rose-600/20
                                    transition-colors
                                    hover:bg-rose-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                "
                            >
                                <UserX className="h-4 w-4" />
                                {saving
                                    ? "Finalizando..."
                                    : "Finalizar relación"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}