
"use client";

import { useState } from "react";
import { Wallet, X, PlusCircle, Calendar, FileText, Hash, Loader2 } from "lucide-react";
import { 
    BenefitTransactionType, CreateBenefitTransactionData, AdjustBenefitTransactionData, CreateBenefitPaymentData
} from "@/types/worksheet/benefit/EmployeeBenefitTransaction";
import { BenefitUnit, BenefitType } from "@/types/worksheet/benefit/BenefitRule";

interface Props {
    type: BenefitTransactionType;
    unit: BenefitUnit;
    benefitType: BenefitType;
    loading: boolean;
    error?: string | null;
    onClose: () => void;
    onSubmit: (
        payload:
            | CreateBenefitTransactionData
            | AdjustBenefitTransactionData
            | CreateBenefitPaymentData
    ) => Promise<void>;
}

const TITLES: Record<string, string> = {
    ACCRUAL: "Acumular beneficio",
    USAGE: "Consumir beneficio",
    PAYMENT: "Registrar pago",
    ADJUSTMENT: "Ajustar saldo",
};

const DESCRIPTIONS: Record<string, string> = {
    ACCRUAL: "Registrar un incremento en el saldo del beneficio.",
    USAGE: "Registrar un consumo del saldo disponible.",
    PAYMENT: "Registrar un pago del beneficio monetario.",
    ADJUSTMENT: "Corregir el saldo mediante un ajuste manual.",
};

export function BenefitTransactionModal({
    type,
    unit,
    benefitType,
    loading,
    error,
    onClose,
    onSubmit,
}: Props) {
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(() => {
        const today = new Date();

        return [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, "0"),
            String(today.getDate()).padStart(2, "0"),
        ].join("-");
    });

    const [description, setDescription] = useState("");
    const [referenceType, setReferenceType] = useState("");
    const [referenceId, setReferenceId] = useState("");
    const [periodStartDate, setPeriodStartDate] = useState("");
    const [periodEndDate, setPeriodEndDate] = useState("");
    const isVacation = benefitType === "VACATION";
    const isAdjustment = type === "ADJUSTMENT";
    const isAccrual = type === "ACCRUAL";
    const isUsage = type === "USAGE";
    const isPayment = type === "PAYMENT";

    const showAccrualPeriod = isAccrual;
    const showVacationPeriod = isVacation && isUsage;

    const isNegativeAdjustment =
        isAdjustment && Number(amount) < 0;

    const amountLabel =
        isNegativeAdjustment
            ? "Importe a descontar"
            : "Importe";

    const formatUnit = unit === "CURRENCY" ? "C$" : "días";

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (isPayment) {
            const payload: CreateBenefitPaymentData = {
                date,
                description: description.trim() || null,
                referenceType: referenceType.trim() || null,
                referenceId: referenceId
                    ? Number(referenceId)
                    : null,
            };

            try {
                await onSubmit(payload);
            } catch {
            }

            return;
        }

        const numericAmount = Number(amount);

        if (!Number.isFinite(numericAmount) || numericAmount === 0) {
            return;
        }

        if (!isAdjustment && numericAmount < 0) {
            return;
        }

        if (isAdjustment && !description.trim()) {
            return;
        }

        if (
            (showAccrualPeriod || showVacationPeriod) &&
            periodStartDate &&
            periodEndDate &&
            periodStartDate > periodEndDate
        ) {
            return;
        }

        
        const payload: CreateBenefitTransactionData = {
            amount: numericAmount,
            date,
            description: description.trim() || null,
            referenceType: referenceType.trim() || null,
            referenceId: referenceId
                ? Number(referenceId)
                : null,
            period_start_date: null,
            period_end_date: null,
        };

        if (showAccrualPeriod || showVacationPeriod) {
            payload.period_start_date = periodStartDate || null;
            payload.period_end_date = periodEndDate || null;
        }

        try {
            await onSubmit(payload);
        } catch {
            // El error se muestra desde el hook.
        }
    };

    const inputClass =
        "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:opacity-50";

    const labelClass =
        "mb-1.5 block text-xs font-semibold text-slate-600";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !loading) {
                    onClose();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="benefit-modal-title"
                className="my-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-100 p-5">
                    <div>
                        <h2
                            id="benefit-modal-title"
                            className="text-lg font-bold text-slate-900"
                        >
                            {TITLES[type]}
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            {DESCRIPTIONS[type]}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
                        {/* Amount */}

                        {isPayment && (
                            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                                <div className="flex items-center gap-2 text-blue-800">
                                    <Wallet className="h-4 w-4" />

                                    <span className="text-sm font-semibold">
                                        Pago del saldo pendiente
                                    </span>
                                </div>

                                <p className="mt-2 text-xs text-blue-700">
                                    El sistema calculará automáticamente el importe
                                    pendiente del beneficio y registrará el pago completo.
                                </p>
                            </div>
                        )}
                        {!isPayment && (
                            <div>
                                <label className={labelClass}>
                                    {amountLabel} *
                                </label>

                                <div className="relative">
                                    <input
                                        type="number"
                                        step="any"
                                        min={isAdjustment ? undefined : "0.01"}
                                        value={amount}
                                        onChange={(event) =>
                                            setAmount(event.target.value)
                                        }
                                        placeholder="0.00"
                                        required
                                        disabled={loading}
                                        className={`${inputClass} pr-16`}
                                    />

                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                                        {formatUnit}
                                    </span>
                                </div>

                                <p className="mt-1 text-[11px] text-slate-400">
                                    {isAdjustment
                                        ? "Utiliza un valor positivo para aumentar o negativo para disminuir el saldo."
                                        : "Ingresa un importe mayor que cero."}
                                </p>
                            </div>
                        )}

                        {/* Date */}
                        <div>
                            <label className={labelClass}>
                                <Calendar className="mr-1 inline h-3.5 w-3.5" />
                                Fecha del movimiento *
                            </label>

                            <input
                                type="date"
                                value={date}
                                onChange={(event) =>
                                    setDate(event.target.value)
                                }
                                required
                                disabled={loading}
                                className={inputClass}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className={labelClass}>
                                <FileText className="mr-1 inline h-3.5 w-3.5" />
                                Descripción {isAdjustment && "*"}
                            </label>

                            <textarea
                                value={description}
                                onChange={(event) =>
                                    setDescription(event.target.value)
                                }
                                rows={3}
                                required={isAdjustment}
                                disabled={loading}
                                placeholder="Describe el motivo del movimiento..."
                                className={inputClass}
                            />
                        </div>

                        {/* Período de acumulación */}
                        {showAccrualPeriod && (
                            <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-4">
                                <p className="mb-3 text-xs font-bold text-violet-800">
                                    Período de acumulación
                                </p>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div>
                                        <label className={labelClass}>
                                            Fecha inicial
                                        </label>

                                        <input
                                            type="date"
                                            value={periodStartDate}
                                            onChange={(event) =>
                                                setPeriodStartDate(event.target.value)
                                            }
                                            disabled={loading}
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>
                                            Fecha final
                                        </label>

                                        <input
                                            type="date"
                                            value={periodEndDate}
                                            onChange={(event) =>
                                                setPeriodEndDate(event.target.value)
                                            }
                                            disabled={loading}
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Vacaciones programadas */}
                        {showVacationPeriod && (
                            <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-4">
                                <p className="mb-1 text-xs font-bold text-orange-800">
                                    Período de vacaciones
                                </p>

                                <p className="mb-3 text-xs text-orange-700">
                                    Indica las fechas en las que el empleado disfrutará sus vacaciones.
                                </p>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div>
                                        <label className={labelClass}>
                                            Fecha inicial
                                        </label>

                                        <input
                                            type="date"
                                            value={periodStartDate}
                                            onChange={(event) =>
                                                setPeriodStartDate(event.target.value)
                                            }
                                            disabled={loading}
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>
                                            Fecha final
                                        </label>

                                        <input
                                            type="date"
                                            value={periodEndDate}
                                            onChange={(event) =>
                                                setPeriodEndDate(event.target.value)
                                            }
                                            disabled={loading}
                                            className={inputClass}
                                        />
                                    </div>
                                </div>

                                {periodStartDate &&
                                    periodEndDate &&
                                    periodStartDate > periodEndDate && (
                                        <p className="mt-2 text-xs text-red-600">
                                            La fecha inicial no puede ser posterior a la fecha final.
                                        </p>
                                    )}
                            </div>
                        )}

                        {/* Reference */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <label className={labelClass}>
                                    Tipo de referencia
                                </label>

                                <input
                                    type="text"
                                    value={referenceType}
                                    onChange={(event) =>
                                        setReferenceType(event.target.value)
                                    }
                                    placeholder="Ej. PAYROLL"
                                    disabled={loading}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>
                                    <Hash className="mr-1 inline h-3.5 w-3.5" />
                                    ID de referencia
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={referenceId}
                                    onChange={(event) =>
                                        setReferenceId(event.target.value)
                                    }
                                    placeholder="Ej. 125"
                                    disabled={loading}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-xs text-red-700">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/70 p-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={
                                loading ||
                                (
                                    !isPayment &&
                                    (
                                        !amount ||
                                        !Number.isFinite(Number(amount)) ||
                                        Number(amount) === 0 ||
                                        (!isAdjustment && Number(amount) < 0)
                                    )
                                ) ||
                                (isAdjustment && !description.trim()) ||
                                (
                                    isAccrual &&
                                    !!periodStartDate &&
                                    !!periodEndDate &&
                                    periodStartDate > periodEndDate
                                )
                            }
                            className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <PlusCircle className="h-4 w-4" />
                                    {isPayment
                                        ? "Confirmar pago completo"
                                        : "Confirmar movimiento"
                                    }
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}