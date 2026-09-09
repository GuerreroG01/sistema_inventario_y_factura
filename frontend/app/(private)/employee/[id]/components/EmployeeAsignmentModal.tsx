import { useEffect, useState } from "react";
import { X, Briefcase, CircleDollarSign } from "lucide-react";
import { CreateEmploymentData, EmploymentType } from "@/types/worksheet/employee/Employment";
import { CreateSalaryData, SalaryType } from "@/types/worksheet/employee/Salary";
import { employmentTypeOptions } from "../constants/employmentTypeOptions";
import { salaryTypeOptions } from "../constants/salaryTypeOptions";
import ModalError from "@/components/ModalError";

type EmploymentFormData = CreateEmploymentData;
type SalaryFormData = CreateSalaryData;

type EmployeeAssignmentModalProps =
    | {
        open: boolean;
        mode: "employment";
        onClose: () => void;
        onSubmit: (data: EmploymentFormData) => Promise<void>;
        loading?: boolean;
        initialData?: Partial<EmploymentFormData>;
        createError?: string | null;
        onClearError?: () => void;
    }
    | {
        open: boolean;
        mode: "salary";
        onClose: () => void;
        onSubmit: (data: SalaryFormData) => Promise<void>;
        loading?: boolean;
        initialData?: Partial<SalaryFormData>;
        createError?: string | null;
        onClearError?: () => void;
    };

export function EmployeeAssignmentModal(
    props: EmployeeAssignmentModalProps
) {
    if (!props.open) {
        return null;
    }

    if (props.mode === "employment") {
        return <EmploymentForm {...props} />;
    }

    return <SalaryForm {...props} />;
}

function EmploymentForm({ onClose, onSubmit, loading = false, initialData, createError: serverError, onClearError }: Extract<EmployeeAssignmentModalProps, { mode: "employment" }>) {
    const [form, setForm] = useState<EmploymentFormData>({
        position: initialData?.position ?? "",
        department: initialData?.department ?? "",
        employment_type:
            initialData?.employment_type ?? "FULL_TIME",
        start_date: initialData?.start_date ?? "",
        end_date: initialData?.end_date ?? null,
    });

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setForm({
            position: initialData?.position ?? "",
            department: initialData?.department ?? "",
            employment_type:
                initialData?.employment_type ?? "FULL_TIME",
            start_date: initialData?.start_date ?? "",
            end_date: initialData?.end_date ?? null,
        });
    }, [initialData]);

    const handleChange = (
        field: keyof EmploymentFormData,
        value: string
    ) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!form.position.trim()) {
            setError("El cargo es obligatorio.");
            return;
        }

        if (!form.start_date) {
            setError("La fecha de inicio es obligatoria.");
            return;
        }

        try {
            setError(null);

            await onSubmit({
                ...form,
                position: form.position.trim(),
                department: form.department?.trim() || undefined,
                end_date: form.end_date || null,
            });
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Error al guardar la relación laboral."
            );
        }
    };

    return (
        <ModalShell
            title="Asignar nuevo puesto"
            description="Registra una nueva relación laboral para este empleado."
            icon={<Briefcase className="h-5 w-5" />}
            iconClassName="bg-blue-50 text-blue-600"
            onClose={onClose}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <FormError
                        message={error}
                        onClose={() => setError(null)}
                    />
                )}

                {serverError && (
                    <FormError
                        message={serverError}
                        onClose={() => onClearError?.()}
                    />
                )}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        label="Cargo"
                        required
                        value={form.position}
                        onChange={(value) =>
                            handleChange("position", value)
                        }
                        placeholder="Ej. Desarrollador Senior"
                    />

                    <Input
                        label="Departamento"
                        value={form.department ?? ""}
                        onChange={(value) =>
                            handleChange("department", value)
                        }
                        placeholder="Ej. Tecnología"
                    />
                </div>

                <Select
                    label="Tipo de contratación"
                    value={form.employment_type ?? "FULL_TIME"}
                    options={employmentTypeOptions}
                    onChange={(value) =>
                        handleChange(
                            "employment_type",
                            value
                        )
                    }
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        type="date"
                        label="Fecha de inicio"
                        required
                        value={form.start_date}
                        onChange={(value) =>
                            handleChange("start_date", value)
                        }
                    />

                    <Input
                        type="date"
                        label="Fecha de finalización"
                        value={form.end_date ?? ""}
                        onChange={(value) =>
                            handleChange("end_date", value)
                        }
                    />
                </div>

                <ModalActions
                    onClose={onClose}
                    loading={loading}
                    submitLabel="Asignar puesto"
                />
            </form>
        </ModalShell>
    );
}

function SalaryForm({ onClose, onSubmit, loading = false, initialData, createError: serverError, onClearError,
}: Extract<EmployeeAssignmentModalProps, { mode: "salary" }>) {
    const [form, setForm] = useState<SalaryFormData>({
        salary: initialData?.salary ?? 0,
        salary_type:
            initialData?.salary_type ?? "MONTHLY",
        effective_from: initialData?.effective_from ?? "",
        effective_to: initialData?.effective_to ?? null,
        reason: initialData?.reason ?? "",
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setForm({
            salary: initialData?.salary ?? 0,
            salary_type:
                initialData?.salary_type ?? "MONTHLY",
            effective_from:
                initialData?.effective_from ?? "",
            effective_to:
                initialData?.effective_to ?? null,
            reason: initialData?.reason ?? "",
        });
    }, [initialData]);

    const handleChange = (
        field: keyof SalaryFormData,
        value: string | number
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

        if (!form.salary || form.salary <= 0) {
            setError("El salario debe ser mayor que cero.");
            return;
        }

        if (!form.effective_from) {
            setError(
                "La fecha efectiva es obligatoria."
            );
            return;
        }

        try {
            setError(null);

            await onSubmit({
                ...form,
                salary: Number(form.salary),
                effective_to: form.effective_to || null,
                reason: form.reason?.trim() || undefined,
            });
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Error al guardar el salario."
            );
        }
    };

    return (
        <>
            <ModalShell
                title="Asignar nuevo salario"
                description="Registra el nuevo salario del empleado."
                icon={<CircleDollarSign className="h-5 w-5" />}
                iconClassName="bg-emerald-50 text-emerald-600"
                onClose={onClose}
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && <FormError message={error} onClose={() => setError(null)} />}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                Salario <span className="text-red-500">*</span>
                            </label>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.salary}
                                onChange={(event) =>
                                    handleChange(
                                        "salary",
                                        Number(event.target.value)
                                    )
                                }
                                placeholder="16000"
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                            />
                        </div>

                        <Select
                            label="Tipo de salario"
                            value={form.salary_type ?? "MONTHLY"}
                            options={salaryTypeOptions}
                            onChange={(value) =>
                                handleChange(
                                    "salary_type",
                                    value
                                )
                            }
                        />
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

                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                            Motivo del cambio
                        </label>

                        <textarea
                            value={form.reason ?? ""}
                            onChange={(event) =>
                                handleChange(
                                    "reason",
                                    event.target.value
                                )
                            }
                            rows={3}
                            placeholder="Ej. Aumento salarial por promoción"
                            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                        />
                    </div>

                    <ModalActions
                        onClose={onClose}
                        loading={loading}
                        submitLabel="Asignar salario"
                    />
                </form>
            </ModalShell>
        </>
    );
}

function ModalShell({ title, description, icon, iconClassName, onClose, children }: {
    title: string;
    description: string;
    icon: React.ReactNode;
    iconClassName: string;
    onClose: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="fixed inset-x-0 bottom-0 top-16 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <div className="flex h-full w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
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

function Input({ label, value, onChange, placeholder, type = "text", required = false }: {
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
                    <span className="text-red-500">*</span>
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

function Select({ label, value, options, onChange }: {
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

function FormError({ message, onClose }: { message: string; onClose: () => void; }) {
    return (
        <ModalError
            open={!!message}
            message={message}
            onClose={onClose}
        />
    );
}

function ModalActions({ onClose, loading, submitLabel }: {
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