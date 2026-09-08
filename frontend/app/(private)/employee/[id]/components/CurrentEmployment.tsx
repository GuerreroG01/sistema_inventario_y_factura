import { Briefcase, Building2, CalendarDays, Clock3, UserCheck, UserX, Plus } from "lucide-react";

import { useEmployment } from "../../hooks/useEmployment";
import { getEmploymentTypeLabel, getEmploymentStatusLabel } from "./EmploymentStatusBadge";
import { formatDate } from "../utils/formatDate";
import { InfoItem } from "./InfoItem";

type CurrentEmploymentProps = {
    employment: ReturnType<
        typeof useEmployment
    >["currentEmployment"];
    onOpenCreateEmployment: () => void;
};

export function CurrentEmployment({ employment,  onOpenCreateEmployment }: CurrentEmploymentProps) {
    if (!employment) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 p-8 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <Briefcase className="h-6 w-6" />
                </div>

                <h3 className="text-base font-semibold text-slate-800">
                    Sin relación laboral activa
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                    Este empleado no tiene actualmente una relación
                    laboral activa registrada.
                </p>

                <button
                    type="button"
                    onClick={onOpenCreateEmployment}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4" />
                    Asignar nuevo puesto
                </button>
            </div>
        );
    }

    const isActive = employment.status === "ACTIVE";

    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                        <Briefcase className="h-5 w-5" />
                    </div>

                    <div>
                        <h3 className="text-base font-bold text-slate-900">
                            Relación laboral actual
                        </h3>

                        <p className="mt-0.5 text-xs text-slate-500">
                            Información de la relación laboral vigente
                            del empleado.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onOpenCreateEmployment}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Asignar nuevo puesto
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
                <InfoItem
                    icon={Briefcase}
                    label="Cargo"
                    value={employment.position}
                />

                <InfoItem
                    icon={Building2}
                    label="Departamento"
                    value={employment.department}
                />

                <InfoItem
                    icon={Clock3}
                    label="Tipo de contratación"
                    value={getEmploymentTypeLabel(
                        employment.employment_type
                    )}
                />

                <InfoItem
                    icon={CalendarDays}
                    label="Fecha de inicio"
                    value={formatDate(
                        employment.start_date
                    )}
                />

                <InfoItem
                    icon={CalendarDays}
                    label="Fecha de finalización"
                    value={
                        employment.end_date
                            ? formatDate(
                                  employment.end_date
                              )
                            : "Actualmente vigente"
                    }
                />

                <InfoItem
                    icon={isActive ? UserCheck : UserX}
                    label="Estado"
                    value={getEmploymentStatusLabel(
                        employment.status
                    )}
                    valueClassName={
                        isActive
                            ? "text-emerald-600"
                            : employment.status === "ENDED"
                                ? "text-rose-600"
                                : "text-slate-500"
                    }
                />
            </div>
        </div>
    );
}