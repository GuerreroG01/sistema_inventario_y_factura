"use client";

import { useEffect, useState } from "react";
import { X, Calculator, CopyPlus } from "lucide-react";
import ModalError from "@/components/ModalError";
import { 
    PayrollRule, PayrollRuleType, CreatePayrollRuleData, CreatePayrollRuleVersionData, 
    PayrollRuleBaseType, PayrollRuleTierData , PayrollRuleCalculationType
} from "@/types/worksheet/payroll/PayrollRule";
import { baseTypeOptions } from "../constants/payroll";
import PayrollRuleTiersEditor from "./PayrollRuleTiersEditor";

type PayrollRuleFormData = {
    code: string;
    name: string;
    type: PayrollRuleType;
    base_type: PayrollRuleBaseType;
    value: number | null;
    percentage: number | null;
    tiers: PayrollRuleTierData[];
    effective_from: string;
    effective_to: string | null;
};

type Props = {
    open: boolean;
    mode: "create" | "version";
    rule?: PayrollRule | null;
    loading?: boolean;
    error?: string | null;
    onClose: () => void;
    onCreate: (data: CreatePayrollRuleData) => Promise<PayrollRule>;
    onCreateVersion: (
        id: number,
        data: CreatePayrollRuleVersionData
    ) => Promise<PayrollRule>;
};

function getNicaraguaDate(): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Managua",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());
}

export default function PayrollRuleFormModal({
    open, mode, rule, loading = false, error: serverError, onClose, onCreate, onCreateVersion,
}: Props) {
    if (!open) {
        return null;
    }

    return (
        <PayrollRuleForm
            mode={mode}
            rule={rule}
            loading={loading}
            error={serverError}
            onClose={onClose}
            onCreate={onCreate}
            onCreateVersion={onCreateVersion}
        />
    );
}

type FormProps = Omit<Props, "open">;

function PayrollRuleForm({
    mode, rule, loading = false, error: serverError, onClose, onCreate, onCreateVersion
}: FormProps) {
    const [form, setForm] = useState<PayrollRuleFormData>({
        code: "",
        name: "",
        type: "EARNING",
        base_type: "GROSS_SALARY",
        value: null,
        percentage: null,
        tiers: [],
        effective_from: "",
        effective_to: null,
    });

    const [error, setError] = useState<string | null>(null);
    const [calculationType, setCalculationType] = useState<PayrollRuleCalculationType>("PERCENTAGE");
    useEffect(() => {
        const today = getNicaraguaDate();
        if (mode === "version" && rule) {
            setForm({
                code: rule.code ?? "",
                name: rule.name ?? "",
                type: rule.type,
                base_type: rule.base_type,
                value: rule.value ?? null,
                percentage: rule.percentage ?? null,
                tiers: rule.tiers ?? [],
                effective_from: today,
                effective_to: null,
            });
            setCalculationType(rule.calculation_type);
        } else {
            setForm({
                code: "",
                name: "",
                type: "EARNING",
                base_type: "GROSS_SALARY",
                value: null,
                percentage: null,
                tiers: [],
                effective_from: today,
                effective_to: null,
            });
            setCalculationType("PERCENTAGE");
        }
        setError(null);
    }, [mode, rule]);

    const handleChange = (
        field: keyof PayrollRuleFormData,
        value:
            | string
            | number
            | null
            | PayrollRuleTierData[]
    ) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));

        if (error) {
            setError(null);
        }
    };

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (calculationType === "FIXED") {
            if (form.value === null) {
                setError("El valor fijo es obligatorio.");
                return;
            }

            if (form.value < 0) {
                setError("El valor no puede ser negativo.");
                return;
            }
        }

        if (calculationType === "PERCENTAGE") {
            if (form.percentage === null) {
                setError("El porcentaje es obligatorio.");
                return;
            }

            if (
                form.percentage < 0 ||
                form.percentage > 100
            ) {
                setError("El porcentaje debe estar entre 0 y 100.");
                return;
            }
        }

        if (calculationType === "PROGRESSIVE") {
            if (form.tiers.length === 0) {
                setError(
                    "Debes agregar al menos un tramo progresivo."
                );
                return;
            }
        }

        try {
            setError(null);

            if (mode === "create") {
                await onCreate({
                    code: form.code.trim(),
                    name: form.name.trim(),
                    type: form.type,
                    base_type: form.base_type,
                    value:
                        calculationType === "FIXED"
                            ? form.value
                            : null,
                    percentage:
                        calculationType === "PERCENTAGE"
                            ? form.percentage
                            : null,
                    tiers:
                        calculationType === "PROGRESSIVE"
                            ? form.tiers
                            : [],
                    effective_from: form.effective_from,
                    effective_to: form.effective_to || null,
                });
            } else {
                if (!rule) {
                    setError(
                        "No se encontró la regla que se desea versionar."
                    );
                    return;
                }

                await onCreateVersion(rule.id, {
                    code: form.code.trim(),
                    name: form.name.trim(),
                    type: form.type,
                    base_type: form.base_type,
                    value:
                        calculationType === "FIXED"
                            ? form.value
                            : null,
                    percentage:
                        calculationType === "PERCENTAGE"
                            ? form.percentage
                            : null,
                    tiers:
                        calculationType === "PROGRESSIVE"
                            ? form.tiers
                            : [],
                    effective_from: form.effective_from,
                    effective_to: form.effective_to || null,
                });
            }

            onClose();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Error al guardar la regla de nómina."
            );
        }
    };

    const isVersion = mode === "version";

    return (
        <ModalShell
            title={
                isVersion
                    ? "Crear nueva versión"
                    : "Nueva regla de nómina"
            }
            description={
                isVersion
                    ? "Crea una nueva versión de la regla seleccionada."
                    : "Registra una nueva regla para el cálculo de nómina."
            }
            icon={
                isVersion ? (
                    <CopyPlus className="h-5 w-5" />
                ) : (
                    <Calculator className="h-5 w-5" />
                )
            }
            iconClassName={
                isVersion
                    ? "bg-indigo-50 text-indigo-600"
                    : "bg-blue-50 text-blue-600"
            }
            onClose={onClose}
        >
            <form
                onSubmit={handleSubmit}
                className="space-y-5"
            >
                {error && (
                    <FormError
                        message={error}
                        onClose={() => setError(null)}
                    />
                )}
                {serverError && (
                    <FormError
                        message={serverError}
                        onClose={() => setError(null)}
                    />
                )}
                {isVersion && rule && (
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3">
                        <p className="text-xs font-semibold text-indigo-700">
                            Regla actual
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-900">
                            {rule.code} — {rule.name}
                        </p>
                    </div>
                )}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        label="Código"
                        required
                        value={form.code}
                        onChange={(value) =>
                            handleChange("code", value)
                        }
                        placeholder="Ej. INSS_PATRONAL"
                    />
                    <Input
                        label="Nombre"
                        required
                        value={form.name}
                        onChange={(value) =>
                            handleChange("name", value)
                        }
                        placeholder="Ej. Seguro social"
                    />
                </div>
                <Select
                    label="Tipo de regla"
                    value={form.type}
                    options={[
                        {
                            value: "EARNING",
                            label: "Ingresos",
                        },
                        {
                            value: "DEDUCTION",
                            label: "Deducciones",
                        },
                        {
                            value: "EMPLOYER_COST",
                            label: "Costos patronales",
                        },
                    ]}
                    onChange={(value) =>
                        handleChange(
                            "type",
                            value as PayrollRuleType
                        )
                    }
                />
                <Select
                    label="Base de cálculo"
                    value={form.base_type}
                    options={baseTypeOptions}
                    onChange={(value) =>
                        handleChange(
                            "base_type",
                            value as PayrollRuleBaseType
                        )
                    }
                />
                <Select
                    label="Tipo de cálculo"
                    value={calculationType}
                    options={[
                        {
                            value: "FIXED",
                            label: "Valor fijo",
                        },
                        {
                            value: "PERCENTAGE",
                            label: "Porcentaje",
                        },
                        {
                            value: "PROGRESSIVE",
                            label: "Progresivo",
                        },
                    ]}
                    onChange={(value) => {
                        const type =
                            value as PayrollRuleCalculationType;

                        setCalculationType(type);
                        setForm((prev) => ({
                            ...prev,
                            value:
                                type === "FIXED"
                                    ? prev.value
                                    : null,
                            percentage:
                                type === "PERCENTAGE"
                                    ? prev.percentage
                                    : null,
                            tiers:
                                type === "PROGRESSIVE"
                                    ? prev.tiers
                                    : [],
                        }));
                    }}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {calculationType === "FIXED" && (
                        <NumberInput
                            label="Valor fijo"
                            value={form.value}
                            onChange={(value) =>
                                handleChange("value", value)
                            }
                            placeholder="Ej. 1500"
                        />
                    )}
                    {calculationType === "PERCENTAGE" && (
                        <NumberInput
                            label="Porcentaje"
                            value={form.percentage}
                            onChange={(value) =>
                                handleChange("percentage", value)
                            }
                            placeholder="Ej. 7"
                            max={100}
                        />
                    )}
                    {calculationType === "PROGRESSIVE" && (
                        <PayrollRuleTiersEditor
                                tiers={form.tiers ?? []}
                            onChange={(tiers) =>
                                handleChange("tiers", tiers)
                            }
                        />
                    )}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        type="date"
                        label="Vigente desde"
                        required
                        value={form.effective_from}
                        onChange={(value) =>
                            handleChange(
                                "effective_from",
                                value
                            )
                        }
                    />

                    <Input
                        type="date"
                        label="Vigente hasta"
                        value={form.effective_to ?? ""}
                        onChange={(value) =>
                            handleChange(
                                "effective_to",
                                value
                            )
                        }
                    />
                </div>

                <ModalActions
                    onClose={onClose}
                    loading={loading}
                    submitLabel={
                        isVersion
                            ? "Crear versión"
                            : "Crear regla"
                    }
                />
            </form>
        </ModalShell>
    );
}

function ModalShell({
    title,
    description,
    icon,
    iconClassName,
    onClose,
    children,
}: {
    title: string;
    description: string;
    icon: React.ReactNode;
    iconClassName: string;
    onClose: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="fixed inset-x-0 bottom-0 top-16 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <div className="flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
                <div className="flex shrink-0 items-start justify-between border-b border-slate-100 p-6">
                    <div className="flex items-center gap-3">
                        <div
                            className={`rounded-xl p-2 ${iconClassName}`}
                        >
                            {icon}
                        </div>

                        <div>
                            <h2 className="text-base font-bold text-slate-900">
                                {title}
                            </h2>

                            <p className="mt-0.5 text-xs text-slate-500">
                                {description}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={false}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                        aria-label="Cerrar"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

function Input({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    required = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    required?: boolean;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                {label}{" "}
                {required && (
                    <span className="text-red-500">
                        *
                    </span>
                )}
            </label>

            <input
                type={type}
                value={value}
                required={required}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                placeholder={placeholder}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />
        </div>
    );
}

function NumberInput({
    label,
    value,
    onChange,
    placeholder,
    max,
}: {
    label: string;
    value: number | null;
    onChange: (value: number | null) => void;
    placeholder?: string;
    max?: number;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                {label}
            </label>

            <input
                type="number"
                min="0"
                max={max}
                step="0.01"
                value={value ?? ""}
                onChange={(event) => {
                    const value = event.target.value;

                    onChange(
                        value === ""
                            ? null
                            : Number(value)
                    );
                }}
                placeholder={placeholder}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />
        </div>
    );
}

function Select({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: {
        value: string;
        label: string;
    }[];
    onChange: (value: string) => void;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                {label}
            </label>

            <select
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            >
                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                    >
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

function FormError({
    message,
    onClose,
}: {
    message: string;
    onClose: () => void;
}) {
    return (
        <ModalError
            open={!!message}
            message={message}
            onClose={onClose}
        />
    );
}

function ModalActions({
    onClose,
    loading,
    submitLabel,
}: {
    onClose: () => void;
    loading: boolean;
    submitLabel: string;
}) {
    return (
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
                Cancelar
            </button>

            <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {loading
                    ? "Guardando..."
                    : submitLabel}
            </button>
        </div>
    );
}