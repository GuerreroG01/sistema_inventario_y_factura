"use client";

import { useEffect, useState } from "react";
import { X, UserPlus, UserRoundPen, User, CreditCard, Phone, Mail, MapPin, Hash } from "lucide-react";
import {
    Employee, CreateEmployeeData, UpdateEmployeeData
} from "@/types/worksheet/employee/Employee";

type EmployeeModalProps = {
    open: boolean;
    employee: Employee | null;
    onClose: () => void;
    onSave: (
        data: CreateEmployeeData | UpdateEmployeeData
    ) => Promise<void>;
};

export function EmployeeModal({ open, employee, onClose, onSave, }: EmployeeModalProps) {
    const isEditing = !!employee;

    const [formData, setFormData] = useState<
        CreateEmployeeData | UpdateEmployeeData
    >({
        employee_code: "",
        first_name: "",
        last_name: "",
        identification: "",
        phone: "",
        email: "",
        address: ""
    });

    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;

        setFormError(null);

        if (employee) {
            setFormData({
                employee_code: employee.employee_code,
                first_name: employee.first_name,
                last_name: employee.last_name,
                identification: employee.identification,
                phone: employee.phone ?? "",
                email: employee.email ?? "",
                address: employee.address ?? ""
            });
        } else {
            setFormData({
                employee_code: "",
                first_name: "",
                last_name: "",
                identification: "",
                phone: "",
                email: "",
                address: ""
            });
        }
    }, [open, employee]);

    if (!open) return null;

    const handleChange = (
        field: keyof CreateEmployeeData,
        value: string
    ) => {
        setFormData((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setFormError(null);

        if (
            !formData.employee_code?.trim() ||
            !formData.first_name?.trim() ||
            !formData.last_name?.trim() ||
            !formData.identification?.trim()
        ) {
            setFormError(
                "Completa los campos obligatorios antes de continuar."
            );

            return;
        }

        try {
            setSaving(true);

            const payload = {
                ...formData,

                employee_code:
                    formData.employee_code?.trim() ?? "",

                first_name:
                    formData.first_name?.trim() ?? "",

                last_name:
                    formData.last_name?.trim() ?? "",

                identification:
                    formData.identification?.trim() ?? "",

                phone:
                    formData.phone?.trim() || undefined,

                email:
                    formData.email?.trim() || undefined,

                address:
                    formData.address?.trim() || undefined,

                position:
                    formData.position?.trim() || undefined,

                department:
                    formData.department?.trim() || undefined,
            };

            await onSave(payload);

            onClose();
        } catch (error) {
            setFormError(
                error instanceof Error
                    ? error.message
                    : "Ocurrió un error al guardar el empleado."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-x-0 bottom-0 top-16 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !saving) {
                    onClose();
                }
            }}
        >
            <div className="relative w-full max-w-4xl max-h-[calc(100vh-5rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                {/* Decorative background */}
                <div className="pointer-events-none absolute -top-32 -right-32 h-64 w-64 rounded-full bg-blue-100/50 blur-3xl" />

                <div className="relative flex max-h-[92vh] flex-col">

                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 md:px-8">

                        <div className="flex items-center gap-3">

                            <div className="rounded-2xl bg-blue-600 p-2.5 text-white shadow-md shadow-blue-500/20">
                                {isEditing ? (
                                    <UserRoundPen className="h-5 w-5" />
                                ) : (
                                    <UserPlus className="h-5 w-5" />
                                )}
                            </div>

                            <div>
                                <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                                    {isEditing
                                        ? "Editar empleado"
                                        : "Nuevo empleado"}
                                </h2>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    {isEditing
                                        ? "Actualiza la información del empleado."
                                        : "Registra la información del nuevo empleado."}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            disabled={saving}
                            onClick={onClose}
                            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <form
                        onSubmit={handleSubmit}
                        className="overflow-y-auto"
                    >
                        <div className="space-y-7 p-6 md:p-8">

                            {/* Error */}
                            {formError && (
                                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                                    {formError}
                                </div>
                            )}

                            {/* ========================= */}
                            {/* Información personal       */}
                            {/* ========================= */}

                            <div>
                                <div className="mb-4 flex items-center gap-2">
                                    <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                                        <User className="h-4 w-4" />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800">
                                            Información personal
                                        </h3>

                                        <p className="text-xs text-slate-400">
                                            Datos básicos de identificación.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                    <InputField
                                        label="Código de empleado"
                                        icon={Hash}
                                        value={
                                            formData.employee_code ?? ""
                                        }
                                        onChange={(value) =>
                                            handleChange(
                                                "employee_code",
                                                value
                                            )
                                        }
                                        placeholder="EMP-001"
                                        required
                                    />

                                    <InputField
                                        label="Identificación"
                                        icon={CreditCard}
                                        value={
                                            formData.identification ?? ""
                                        }
                                        onChange={(value) =>
                                            handleChange(
                                                "identification",
                                                value
                                            )
                                        }
                                        placeholder="001-123456-0001A"
                                        required
                                    />

                                    <InputField
                                        label="Nombres"
                                        icon={User}
                                        value={
                                            formData.first_name ?? ""
                                        }
                                        onChange={(value) =>
                                            handleChange(
                                                "first_name",
                                                value
                                            )
                                        }
                                        placeholder="Juan Carlos"
                                        required
                                    />

                                    <InputField
                                        label="Apellidos"
                                        icon={User}
                                        value={
                                            formData.last_name ?? ""
                                        }
                                        onChange={(value) =>
                                            handleChange(
                                                "last_name",
                                                value
                                            )
                                        }
                                        placeholder="Pérez López"
                                        required
                                    />
                                </div>
                            </div>

                            {/* ========================= */}
                            {/* Información de contacto   */}
                            {/* ========================= */}

                            <div>
                                <div className="mb-4 flex items-center gap-2">
                                    <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                                        <Phone className="h-4 w-4" />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800">
                                            Información de contacto
                                        </h3>

                                        <p className="text-xs text-slate-400">
                                            Datos para contactar al empleado.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                    <InputField
                                        label="Teléfono"
                                        icon={Phone}
                                        value={
                                            formData.phone ?? ""
                                        }
                                        onChange={(value) =>
                                            handleChange(
                                                "phone",
                                                value
                                            )
                                        }
                                        placeholder="7777-7777"
                                    />

                                    <InputField
                                        label="Correo electrónico"
                                        icon={Mail}
                                        type="email"
                                        value={
                                            formData.email ?? ""
                                        }
                                        onChange={(value) =>
                                            handleChange(
                                                "email",
                                                value
                                            )
                                        }
                                        placeholder="empleado@empresa.com"
                                    />

                                    <div className="md:col-span-2">
                                        <InputField
                                            label="Dirección"
                                            icon={MapPin}
                                            value={
                                                formData.address ?? ""
                                            }
                                            onChange={(value) =>
                                                handleChange(
                                                    "address",
                                                    value
                                                )
                                            }
                                            placeholder="Dirección de residencia"
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-100 bg-white/95 px-6 py-4 backdrop-blur md:flex-row md:justify-end md:px-8">

                            <button
                                type="button"
                                disabled={saving}
                                onClick={onClose}
                                className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isEditing ? (
                                    <UserRoundPen className="h-4 w-4" />
                                ) : (
                                    <UserPlus className="h-4 w-4" />
                                )}

                                {saving
                                    ? "Guardando..."
                                    : isEditing
                                    ? "Guardar cambios"
                                    : "Crear empleado"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

type InputFieldProps = {
    label: string;
    icon: React.ElementType;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    required?: boolean;
};

function InputField({
    label,
    icon: Icon,
    value,
    onChange,
    placeholder,
    type = "text",
    required = false,
}: InputFieldProps) {
    return (
        <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {label}

                {required && (
                    <span className="text-rose-500">*</span>
                )}
            </label>

            <div className="relative">
                <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                    type={type}
                    value={value}
                    required={required}
                    onChange={(event) =>
                        onChange(event.target.value)
                    }
                    placeholder={placeholder}
                    className="
                        w-full
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        py-2.5
                        pl-10
                        pr-3
                        text-sm
                        text-slate-800
                        outline-none
                        transition-all
                        placeholder:text-slate-300
                        focus:border-blue-500
                        focus:ring-4
                        focus:ring-blue-500/10
                        hover:border-slate-300
                    "
                />
            </div>
        </div>
    );
}