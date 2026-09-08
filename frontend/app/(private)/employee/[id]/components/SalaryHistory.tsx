import { useState } from "react";
import { CalendarDays, CircleDollarSign, Clock3, History, ChevronDown } from "lucide-react";
import { EmployeeSalaryHistory } from "@/types/worksheet/employee/Salary";
import { formatDate } from "../utils/formatDate";
import { SalaryStatusBadge, getSalaryTypeLabel } from "./SalaryStatusBadge";
import { formatSalary } from "../utils/formatSalary";

export function SalaryHistory({ salaryHistory }: {
    salaryHistory: EmployeeSalaryHistory[];
}) {
    const [isOpen, setIsOpen] = useState(false);

    if (salaryHistory.length === 0) {
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
                            Historial salarial
                        </h3>

                        <p className="mt-0.5 text-xs text-slate-500">
                            Historial de cambios y períodos salariales.
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
                            {salaryHistory.map((salary, index) => {
                                const isLast =
                                    index === salaryHistory.length - 1;

                                return (
                                    <div
                                        key={salary.id}
                                        className="relative flex gap-4"
                                    >
                                        <div className="flex flex-col items-center">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                                <CircleDollarSign className="h-4 w-4" />
                                            </div>

                                            {!isLast && (
                                                <div className="mt-2 h-full w-px bg-slate-200" />
                                            )}
                                        </div>

                                        <div className="mb-4 flex-1 rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition-colors hover:border-slate-200 hover:bg-slate-50">
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-lg font-extrabold text-slate-900">
                                                            {formatSalary(
                                                                salary.salary
                                                            )}
                                                        </span>

                                                        <SalaryStatusBadge
                                                            effective_from={
                                                                salary.effective_from
                                                            }
                                                            effective_to={
                                                                salary.effective_to
                                                            }
                                                        />
                                                    </div>

                                                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                                                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                                            <Clock3 className="h-3.5 w-3.5 text-slate-400" />

                                                            {getSalaryTypeLabel(
                                                                salary.salary_type
                                                            )}
                                                        </span>

                                                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                                            <CalendarDays className="h-3.5 w-3.5 text-slate-400" />

                                                            Desde{" "}
                                                            {formatDate(
                                                                salary.effective_from
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="shrink-0 text-left sm:text-right">
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                                        Hasta
                                                    </p>

                                                    <p className="mt-0.5 text-xs font-semibold text-slate-700">
                                                        {salary.effective_to
                                                            ? formatDate(
                                                                  salary.effective_to
                                                              )
                                                            : "Vigente"}
                                                    </p>
                                                </div>
                                            </div>

                                            {salary.reason && (
                                                <div className="mt-4 border-t border-slate-200/70 pt-3">
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                                        Motivo del cambio
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-600">
                                                        {salary.reason}
                                                    </p>
                                                </div>
                                            )}
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