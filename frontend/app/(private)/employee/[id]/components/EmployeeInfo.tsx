"use client";

import { User, Phone, Mail, MapPin, Briefcase, Building2, CalendarDays, CreditCard,
    Hash, UserCheck, UserX, RefreshCw
} from "lucide-react";
import { useEmployeeDetails } from "../hooks/useEmployeeDetails";
import { formatDate } from "../utils/formatDate";
import { EmployeeInfoSkeleton } from "./EmployeeInfoSkeleton";
import { InfoSection } from "./InfoSection";
import { InfoItem } from "./InfoItem";


type EmployeeInfoProps = {
    employeeId: number;
};

export default function EmployeeInfo({ employeeId }: EmployeeInfoProps) {
    const { employee, loading, error, refetch} = useEmployeeDetails(employeeId);

    if (loading) {
        return <EmployeeInfoSkeleton />;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-rose-200 bg-rose-50/50 p-12 text-center">
                <div className="mb-4 rounded-full bg-rose-100 p-4 text-rose-500">
                    <UserX className="h-8 w-8" />
                </div>

                <h3 className="text-base font-semibold text-slate-800">
                    No se pudo obtener el empleado
                </h3>

                <p className="mt-1 max-w-md text-sm text-slate-500">
                    {error}
                </p>

                <button
                    type="button"
                    onClick={refetch}
                    className="
                        mt-5
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        bg-blue-600
                        px-4
                        py-2.5
                        text-sm
                        font-semibold
                        text-white
                        shadow-md
                        shadow-blue-500/20
                        transition-colors
                        hover:bg-blue-700
                    "
                >
                    <RefreshCw className="h-4 w-4" />
                    Reintentar
                </button>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/50 p-12 text-center">
                <div className="mb-3 rounded-full bg-slate-100 p-4 text-slate-400">
                    <User className="h-8 w-8" />
                </div>

                <h3 className="text-base font-semibold text-slate-800">
                    Empleado no encontrado
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                    No existe información para el empleado solicitado.
                </p>
            </div>
        );
    }

    const fullName =
        `${employee.first_name} ${employee.last_name}`.trim();

    const initials = `${employee.first_name?.charAt(0) || ""}${employee.last_name?.charAt(0) || ""}`
        .toUpperCase();

    const isActive = employee.status === "ACTIVE";

    return (
        <div className="space-y-6">
            {/* Employee header card */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-50 blur-2xl pointer-events-none" />

                <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white shadow-md shadow-blue-500/20">
                            {initials || "EM"}
                        </div>

                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                                    {fullName || "Sin nombre"}
                                </h2>

                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                                        isActive
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "bg-slate-100 text-slate-500"
                                    }`}
                                >
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${
                                            isActive
                                                ? "bg-emerald-500"
                                                : "bg-slate-400"
                                        }`}
                                    />

                                    {isActive ? "Activo" : "Inactivo"}
                                </span>
                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                                {employee.position || "Sin cargo asignado"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3">
                        <Hash className="h-4 w-4 text-slate-400" />

                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                Código empleado
                            </p>

                            <p className="text-sm font-bold text-slate-700">
                                {employee.employee_code}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <InfoSection
                title="Información del Empleado"
                icon={User}
            >
                <InfoItem
                    icon={CreditCard}
                    label="Identificación"
                    value={employee.identification}
                />

                <InfoItem
                    icon={Phone}
                    label="Teléfono"
                    value={employee.phone}
                />

                <InfoItem
                    icon={Mail}
                    label="Correo electrónico"
                    value={employee.email}
                />

                <InfoItem
                    icon={MapPin}
                    label="Dirección"
                    value={employee.address}
                />

                <InfoItem
                    icon={CalendarDays}
                    label="Fecha de contratación"
                    value={formatDate(employee.hire_date)}
                />

                <InfoItem
                    icon={isActive ? UserCheck : UserX}
                    label="Estado"
                    value={isActive ? "Activo" : "Inactivo"}
                    valueClassName={
                        isActive
                            ? "text-emerald-600"
                            : "text-slate-500"
                    }
                />
            </InfoSection>
        </div>
    );
}