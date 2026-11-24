"use client";

import { useEffect, useState } from "react";
import { X, Gift, Pencil } from "lucide-react";
import ModalError from "@/components/ModalError";
import { BenefitRule, BenefitType, BenefitRuleScope, BenefitMode, BenefitFrequency,
    BenefitUnit, CreateBenefitRuleData, UpdateBenefitRuleData
} from "@/types/worksheet/benefit/BenefitRule";

type BenefitRuleFormData = {
    type: BenefitType;
    name: string;
    description: string;
    scope: BenefitRuleScope;
    benefit_mode: BenefitMode;
    frequency: BenefitFrequency;
    unit: BenefitUnit;
    amount: number | null;
    formula: string;
    start_date: string;
    end_date: string | null;
    conditions: string;
};

type Props = {
    open: boolean;
    mode: "create" | "edit";
    rule?: BenefitRule | null;
    loading?: boolean;
    error?: string | null;
    onClose: () => void;
    onCreate: (data: CreateBenefitRuleData) => Promise<BenefitRule | null>;
    onUpdate: (id: number, data: UpdateBenefitRuleData) => Promise<BenefitRule | null>;
};

function getNicaraguaDate(): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Managua",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());
}

export default function BenefitRuleFormModal({
    open, mode, rule, loading = false, error: serverError, onClose, onCreate, onUpdate
}: Props) {
    if (!open) return null;

    return (
        <BenefitRuleForm
            mode={mode}
            rule={rule}
            loading={loading}
            error={serverError}
            onClose={onClose}
            onCreate={onCreate}
            onUpdate={onUpdate}
        />
    );
}

type FormProps = Omit<Props, "open">;

function BenefitRuleForm({
    mode, rule, loading = false, error: serverError, onClose, onCreate, onUpdate
}: FormProps) {
    const [form, setForm] = useState<BenefitRuleFormData>({
        type: "VACATION",
        name: "",
        description: "",
        scope: "GLOBAL",
        benefit_mode: "RECURRING",
        frequency: "MONTHLY",
        unit: "CURRENCY",
        amount: null,
        formula: "",
        start_date: "",
        end_date: null,
        conditions: "",
    });

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const today = getNicaraguaDate();

        if (mode === "edit" && rule) {
            setForm({
                type: rule.type,
                name: rule.name ?? "",
                description: rule.description ?? "",
                scope: rule.scope ?? "GLOBAL",
                benefit_mode: rule.benefit_mode,
                frequency: rule.frequency,
                unit: rule.unit,
                amount:
                rule.amount === null || rule.amount === undefined
                    ? null
                    : Number(rule.amount),
                formula: rule.formula ?? "",
                start_date: rule.start_date,
                end_date: rule.end_date ?? null,
                conditions: rule.conditions
                ? JSON.stringify(rule.conditions, null, 2)
                : "",
            });
        } else {
            setForm({
                type: "VACATION",
                name: "",
                description: "",
                scope: "GLOBAL",
                benefit_mode: "RECURRING",
                frequency: "MONTHLY",
                unit: "CURRENCY",
                amount: null,
                formula: "",
                start_date: today,
                end_date: null,
                conditions: "",
            });
        }

        setError(null);
    }, [mode, rule]);

    const handleChange = (
        field: keyof BenefitRuleFormData, value: string | number | null
    ) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
        if (error) setError(null);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!form.name.trim()) {
            setError("El nombre es obligatorio.");
            return;
        }

        if (!form.start_date) {
            setError("La fecha de inicio es obligatoria.");
            return;
        }

        if (form.amount !== null && form.amount < 0) {
            setError("El monto no puede ser negativo.");
            return;
        }

        let parsedConditions: Record<string, unknown> | null = null;
        if (form.conditions.trim()) {
            try {
                parsedConditions = JSON.parse(form.conditions);
            } catch {
                setError("Las condiciones deben ser un JSON válido.");
                return;
            }
        }

        try {
            setError(null);

            const payload = {
                type: form.type,
                name: form.name.trim(),
                description: form.description.trim() || null,
                scope: form.scope,
                benefit_mode: form.benefit_mode,
                frequency: form.frequency,
                unit: form.unit,
                amount: form.amount,
                formula: form.formula.trim() || null,
                start_date: form.start_date,
                end_date: form.end_date || null,
                conditions: parsedConditions,
            };

            if (mode === "create") {
                await onCreate(payload as CreateBenefitRuleData);
            } else {
                if (!rule) {
                setError("No se encontró la regla que se desea editar.");
                return;
                }
                await onUpdate(rule.id, payload as UpdateBenefitRuleData);
            }

            onClose();
        } catch (err) {
            setError(
                err instanceof Error
                ? err.message
                : "Error al guardar la regla de beneficio."
            );
        }
    };

    const isEdit = mode === "edit";

    return (
        <ModalShell
            title={isEdit ? "Editar regla de beneficio" : "Nueva regla de beneficio"}
            description={
                isEdit
                ? "Modifica los datos de la regla seleccionada."
                : "Registra una nueva regla de beneficio."
            }
            icon={
                isEdit ? (
                <Pencil className="h-5 w-5" />
                ) : (
                <Gift className="h-5 w-5" />
                )
            }
            iconClassName={
                isEdit ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
            }
            onClose={onClose}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <FormError message={error} onClose={() => setError(null)} />
                )}
                {serverError && (
                    <FormError message={serverError} onClose={() => setError(null)} />
                )}

                {isEdit && rule && (
                <div className="rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3">
                    <p className="text-xs font-semibold text-amber-700">
                        Regla actual
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                        {rule.name}
                    </p>
                </div>
                )}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        label="Nombre"
                        required
                        value={form.name}
                        onChange={(value) => handleChange("name", value)}
                        placeholder="Ej. Aguinaldo, Vacaciones, Transporte"
                    />

                    <Select
                        label="Tipo de beneficio"
                        value={form.type}
                        options={[
                            { value: "VACATION", label: "Vacaciones" },
                            { value: "THIRTEENTH_MONTH", label: "Décimo tercer mes / Aguinaldo" },
                            { value: "SEVERANCE", label: "Indemnización" },
                            { value: "TRANSPORT", label: "Transporte" },
                            { value: "FOOD", label: "Alimentación" },
                            { value: "OTHER", label: "Otro" },
                        ]}
                        onChange={(value) => handleChange("type", value as BenefitType)}
                    />
                </div>
                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                        Descripción
                    </label>
                    <textarea
                        value={form.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        rows={2}
                        placeholder="Descripción opcional de la regla..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Select
                        label="Alcance"
                        value={form.scope}
                        options={[
                            { value: "GLOBAL", label: "Global (toda la empresa)" },
                            { value: "EMPLOYEE", label: "Empleado específico" },
                        ]}
                        onChange={(value) =>
                            handleChange("scope", value as BenefitRuleScope)
                        }
                    />

                    <Select
                        label="Modo"
                        value={form.benefit_mode}
                        options={[
                            { value: "RECURRING", label: "Recurrente" },
                            { value: "ONE_TIME", label: "Una sola vez" },
                        ]}
                        onChange={(value) => {
                            const mode = value as BenefitMode;
                            setForm((prev) => ({
                                ...prev,
                                benefit_mode: mode,
                                frequency: mode === "ONE_TIME" ? "NONE" : prev.frequency,
                            }));
                        }}
                    />

                    <Select
                        label="Frecuencia"
                        value={form.frequency}
                        options={[
                            { value: "NONE", label: "Ninguna" },
                            { value: "MONTHLY", label: "Mensual" },
                            { value: "BIWEEKLY", label: "Quincenal" },
                            { value: "YEARLY", label: "Anual" },
                            { value: "ON_DEMAND", label: "Bajo demanda" },
                        ]}
                        onChange={(value) =>
                            handleChange("frequency", value as BenefitFrequency)
                        }
                    />

                    <Select
                        label="Unidad"
                        value={form.unit}
                        options={[
                            { value: "CURRENCY", label: "Moneda / Dinero" },
                            { value: "DAYS", label: "Días" },
                        ]}
                        onChange={(value) => handleChange("unit", value as BenefitUnit)}
                    />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <NumberInput
                        label="Monto / Valor"
                        value={form.amount}
                        onChange={(value) => handleChange("amount", value)}
                        placeholder="Ej. 1500 o 15"
                    />

                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                            Fórmula (opcional)
                        </label>
                        <input
                            type="text"
                            value={form.formula}
                            onChange={(e) => handleChange("formula", e.target.value)}
                            placeholder="Ej. base_salary * 0.0833"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-mono text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        type="date"
                        label="Fecha de inicio"
                        required
                        value={form.start_date}
                        onChange={(value) => handleChange("start_date", value)}
                    />
                    <Input
                        type="date"
                        label="Fecha de fin (opcional)"
                        value={form.end_date ?? ""}
                        onChange={(value) => handleChange("end_date", value || null)}
                    />
                </div>
                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                        Condiciones (JSON opcional)
                    </label>
                    <textarea
                        value={form.conditions}
                        onChange={(e) => handleChange("conditions", e.target.value)}
                        rows={4}
                        placeholder={`Ejemplo de condiciones:
                            {
                            "años_minimos": 1,
                            "departamento": "Ventas"
                            }

                            Define requisitos para recibir el beneficio.
                            Deja este campo vacío si no aplica.`}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-mono text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    />
                    <p className="mt-1 text-xs text-slate-400">
                        Debe ser un objeto JSON válido o dejarse vacío.
                    </p>
                </div>

                <ModalActions
                    onClose={onClose}
                    loading={loading}
                    submitLabel={isEdit ? "Guardar cambios" : "Crear regla"}
                />
            </form>
        </ModalShell>
    );
}

function ModalShell({
    title, description, icon, iconClassName, onClose, children
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
                        <div className={`rounded-xl p-2 ${iconClassName}`}>{icon}</div>
                        <div>
                        <h2 className="text-base font-bold text-slate-900">{title}</h2>
                        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                        aria-label="Cerrar"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto p-6">{children}</div>
            </div>
        </div>
    );
}

function Input({
    label, value, onChange, placeholder, type = "text", required = false,
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
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                value={value}
                required={required}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />
        </div>
    );
}

function NumberInput({
    label, value, onChange, placeholder
}: {
    label: string;
    value: number | null;
    onChange: (value: number | null) => void;
    placeholder?: string;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                {label}
            </label>
            <input
                type="number"
                min="0"
                step="0.01"
                value={value ?? ""}
                onChange={(e) => {
                const v = e.target.value;
                onChange(v === "" ? null : Number(v));
                }}
                placeholder={placeholder}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />
        </div>
    );
}

function Select({
    label, value, options, onChange
}: {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                {label}
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            >
                {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
                ))}
            </select>
        </div>
    );
}

function FormError({
    message, onClose,
}: {
    message: string;
    onClose: () => void;
}) {
    return (
        <ModalError open={!!message} message={message} onClose={onClose} />
    );
}

function ModalActions({
    onClose, loading, submitLabel
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
                {loading ? "Guardando..." : submitLabel}
            </button>
        </div>
    );
}