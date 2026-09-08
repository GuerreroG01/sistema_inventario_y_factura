import { useState } from "react";
import { useEmployment } from "../../hooks/useEmployment";
import { Briefcase, Building2, CalendarDays, Clock3, UserCheck, History, ChevronDown } from "lucide-react";
import { EmploymentStatusBadge, getEmploymentTypeLabel } from "./EmploymentStatusBadge";
import { formatDate } from "../utils/formatDate";

export function EmploymentHistory({ employmentHistory }: {
    employmentHistory: ReturnType<typeof useEmployment>["employmentHistory"];
}) {
    const [isOpen, setIsOpen] = useState(false);
    console.log(employmentHistory);
    if (employmentHistory.length === 0) {
        return null;
    }

    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex w-full items-center justify-between p-6 text-left"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                        <History className="h-5 w-5" />
                    </div>

                    <div>
                        <h3 className="text-base font-bold text-slate-900">
                            Historial laboral
                        </h3>

                        <p className="mt-0.5 text-xs text-slate-500">
                            Relaciones laborales registradas para este empleado.
                        </p>
                    </div>
                </div>

                <ChevronDown
                    className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </button>
            <div
                className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                }`}
            >
                <div className="overflow-hidden">
                    <div className="border-t border-slate-100 px-6 pb-6 pt-6">
                        <div className="space-y-4">
                            {employmentHistory.map((employment, index) => {
                                const isActive = employment.status === "ACTIVE";
                                const isLast =
                                    index === employmentHistory.length - 1;

                                return (
                                    <div
                                        key={employment.id}
                                        className="relative flex gap-4"
                                    >
                                        <div className="flex flex-col items-center">
                                            <div
                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                                                    isActive
                                                        ? "bg-emerald-50 text-emerald-600"
                                                        : "bg-slate-100 text-slate-500"
                                                }`}
                                            >
                                                {isActive ? (
                                                    <UserCheck className="h-4 w-4" />
                                                ) : (
                                                    <Briefcase className="h-4 w-4" />
                                                )}
                                            </div>

                                            {!isLast && (
                                                <div className="mt-2 h-full w-px bg-slate-200" />
                                            )}
                                        </div>

                                        <div className="mb-4 flex-1 rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition-colors hover:border-slate-200 hover:bg-slate-50">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h4 className="text-sm font-bold text-slate-900">
                                                            {employment.position}
                                                        </h4>

                                                        <EmploymentStatusBadge
                                                            status={
                                                                employment.status
                                                            }
                                                            endDate={
                                                                employment.end_date
                                                            }
                                                        />
                                                    </div>

                                                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                                                        {employment.department && (
                                                            <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                                                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                                                                {
                                                                    employment.department
                                                                }
                                                            </span>
                                                        )}

                                                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                                            <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                                                            {getEmploymentTypeLabel(
                                                                employment.employment_type
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="shrink-0 text-left sm:text-right">
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                                        Inicio
                                                    </p>

                                                    <p className="mt-0.5 text-xs font-semibold text-slate-700">
                                                        {formatDate(
                                                            employment.start_date
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex items-center gap-2 border-t border-slate-200/70 pt-3">
                                                <CalendarDays className="h-3.5 w-3.5 text-slate-400" />

                                                <span className="text-xs text-slate-500">
                                                    {employment.end_date ? (
                                                        <>
                                                            {new Date(
                                                                employment.end_date
                                                            ) < new Date() ? (
                                                                <>
                                                                    Finalizó el{" "}
                                                                    <span className="font-semibold text-slate-700">
                                                                        {formatDate(
                                                                            employment.end_date
                                                                        )}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    Finaliza el{" "}
                                                                    <span className="font-semibold text-amber-700">
                                                                        {formatDate(
                                                                            employment.end_date
                                                                        )}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="font-semibold text-emerald-600">
                                                            Relación laboral
                                                            vigente
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}