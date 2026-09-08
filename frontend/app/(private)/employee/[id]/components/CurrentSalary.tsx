import { CalendarDays, CircleDollarSign, Clock3, TrendingUp, Pencil } from "lucide-react";
import { EmployeeSalaryHistory } from "@/types/worksheet/employee/Salary";
import { formatDate } from "../utils/formatDate";
import { InfoItem } from "./InfoItem";
import { SalaryStatusBadge, getSalaryTypeLabel } from "./SalaryStatusBadge";
import { formatSalary } from "../utils/formatSalary";

type CurrentSalaryProps = {
    salary: EmployeeSalaryHistory | null;
    onOpenCreateSalary: () => void;
};

export function CurrentSalary({ salary, onOpenCreateSalary }: CurrentSalaryProps) {
    if (!salary) {
        return (
            <>
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 p-8 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <CircleDollarSign className="h-6 w-6" />
                    </div>

                    <h3 className="text-base font-semibold text-slate-800">
                        Sin salario registrado
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Este empleado no tiene actualmente un salario registrado.
                    </p>

                    <button
                        type="button"
                        onClick={onOpenCreateSalary}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                        <CircleDollarSign className="h-4 w-4" />
                        Asignar salario
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                            <CircleDollarSign className="h-5 w-5" />
                        </div>

                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                Salario actual
                            </h3>

                            <p className="mt-0.5 text-xs text-slate-500">
                                Información salarial vigente del empleado.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <SalaryStatusBadge
                            effective_from={salary.effective_from}
                            effective_to={salary.effective_to}
                        />

                        <button
                            type="button"
                            onClick={onOpenCreateSalary}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                            Cambiar salario
                        </button>
                    </div>
                </div>

                <div className="mb-6 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                        Remuneración
                    </p>

                    <div className="mt-1 flex flex-wrap items-baseline gap-2">
                        <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                            {formatSalary(salary.salary)}
                        </span>

                        <span className="text-sm font-medium text-slate-500">
                            /{" "}
                            {getSalaryTypeLabel(
                                salary.salary_type
                            ).toLowerCase()}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <InfoItem
                        icon={Clock3}
                        label="Tipo de salario"
                        value={getSalaryTypeLabel(
                            salary.salary_type
                        )}
                    />

                    <InfoItem
                        icon={CalendarDays}
                        label="Vigente desde"
                        value={formatDate(
                            salary.effective_from
                        )}
                    />

                    <InfoItem
                        icon={CalendarDays}
                        label="Vigente hasta"
                        value={
                            salary.effective_to
                                ? formatDate(
                                      salary.effective_to
                                  )
                                : "Sin fecha de finalización"
                        }
                    />

                    <InfoItem
                        icon={TrendingUp}
                        label="Motivo"
                        value={salary.reason}
                    />
                </div>
            </div>
        </>
    );
}