import { CalendarDays, CircleDollarSign, Clock3, TrendingUp, Pencil, Minus, Equal, LoaderCircle, Wallet } from "lucide-react";
import { EmployeeSalaryHistory, EmployeeNIPayroll } from "@/types/worksheet/employee/Salary";
import { formatDate } from "../utils/formatDate";
import { InfoItem } from "./InfoItem";
import { SalaryStatusBadge, getSalaryTypeLabel } from "./SalaryStatusBadge";
import { formatSalary } from "../utils/formatSalary";
import { PayrollStep } from "./PayrollStep";

type CurrentSalaryProps = {
    salary: EmployeeSalaryHistory | null;
    payroll: EmployeeNIPayroll | null;
    onOpenCreateSalary: () => void;
};

export function CurrentSalary({ salary, payroll, onOpenCreateSalary }: CurrentSalaryProps) {
    console.log("[PAYROLL]:",payroll);
    if (!salary) {
        return (
            <div className="relative overflow-hidden rounded-3xl border border-dashed border-emerald-200/80 bg-gradient-to-b from-emerald-50/40 via-white to-white p-8 text-center shadow-sm transition-all hover:border-emerald-300">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100/60 text-emerald-600 shadow-inner">
                    <CircleDollarSign className="h-7 w-7" />
                </div>

                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Sin salario registrado
                </h3>

                <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Este empleado no cuenta con una estructura salarial activa en este momento. Asigna un salario para comenzar a calcular deducciones y nómina.
                </p>

                <button
                    type="button"
                    onClick={onOpenCreateSalary}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-700/30 active:scale-[0.98]"
                >
                    <CircleDollarSign className="h-4 w-4" />
                    Asignar salario ahora
                </button>
            </div>
        );
    }

    const formatCurrency = (value: number) =>
        `C$ ${value.toLocaleString("es-NI", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    return (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-100 transition-all">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-100">

                <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-inner border border-emerald-100">
                        <CircleDollarSign className="h-5 w-5" />
                    </div>

                    <div>
                        <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                            Salario actual
                        </h3>

                        <p className="text-xs text-slate-500 font-medium">
                            Información contractual y desglose de nómina
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <SalaryStatusBadge
                        effective_from={salary.effective_from}
                        effective_to={salary.effective_to}
                    />
                    <button
                        type="button"
                        onClick={onOpenCreateSalary}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-semibold text-slate-700 transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 active:scale-[0.98]"
                    >
                        <Pencil className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600" />
                        Cambiar salario
                    </button>
                </div>
            </div>
            <div className="my-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/60 via-emerald-50/20 to-white p-5 shadow-sm">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700/80">
                        Remuneración base
                    </p>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-black tracking-tight text-slate-900">
                            {formatSalary(salary.salary)}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                            / {getSalaryTypeLabel(
                                salary.salary_type
                            ).toLowerCase()}
                        </span>
                    </div>
                </div>
                {payroll ? (
                    <div className="relative overflow-hidden rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/60 via-teal-50/20 to-white p-5 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700/80">
                                Neto a recibir
                            </p>
                            <div className="mt-2 flex items-baseline gap-2">
                                <p className="mt-2 text-3xl font-black tracking-tight text-teal-900">
                                    {formatCurrency(payroll.net_salary)}
                                </p>
                                <span className="text-xs font-semibold text-slate-500">
                                    / mes
                                </span>
                            </div>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/30">
                            <Wallet className="h-6 w-6" />
                        </div>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-5 flex items-center gap-3">
                        <LoaderCircle className="h-5 w-5 animate-spin text-emerald-600" />
                        <span className="text-xs font-semibold text-slate-600">Calculando estimación neta...</span>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 pb-6 border-b border-slate-100">
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
                            : "Indefinido"
                    }
                />
                <InfoItem
                    icon={TrendingUp}
                    label="Motivo de cambio"
                    value={
                        salary.reason ||
                        "Sin especificar"
                    }
                />
            </div>
            <div className="pt-6">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-bold text-slate-900">
                            Flujo de cálculo de nómina
                        </h4>
                        <p className="text-xs text-slate-500">
                            Desglose mensual de percepciones y deducciones aplicadas
                        </p>
                    </div>
                    {payroll && (
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 border border-slate-200/60">
                            Período Mensual
                        </span>
                    )}
                </div>
                {payroll ? (
                    <div className="relative pl-2">
                        <div className="absolute bottom-4 left-[23px] top-4 w-0.5 bg-slate-200/80" />
                        <div className="space-y-3">
                            <PayrollStep
                                icon={CircleDollarSign}
                                iconClass="bg-emerald-600 shadow-emerald-600/30"
                                label="Salario bruto mensualizado"
                                description="Base de cálculo inicial"
                                amount={formatCurrency(payroll.gross_salary)}
                                amountClass="text-slate-900"
                                cardClass="border-slate-200 bg-slate-50/80"
                            />
                            {Object.entries(payroll)
                                .filter(
                                    ([key, value]) =>
                                        ![
                                            "gross_salary",
                                            "total_deductions",
                                            "net_salary"
                                        ].includes(key) &&
                                        value !== null &&
                                        typeof value === "object" &&
                                        "name" in value &&
                                        "amount" in value
                                ).map(([code, deduction], index) => {
                                    const deductionData = deduction as {
                                        name: string;
                                        amount: number;
                                    };
                                    return (
                                        <PayrollStep
                                            key={code}
                                            icon={Minus}
                                            iconClass={
                                                index % 2 === 0
                                                    ? "bg-rose-500 shadow-rose-500/30"
                                                    : "bg-amber-500 shadow-amber-500/30"
                                            }
                                            label={deductionData.name}
                                            description="Deducción aplicada al período"
                                            amount={`- ${formatCurrency(deductionData.amount)}`}
                                            amountClass={
                                                index % 2 === 0
                                                    ? "text-rose-600"
                                                    : "text-amber-600"
                                            }
                                            cardClass={
                                                index % 2 === 0
                                                    ? "border-rose-100 bg-rose-50/40"
                                                    : "border-amber-100 bg-amber-50/40"
                                            }
                                        />
                                    );
                                })
                            }
                            <PayrollStep
                                icon={Equal}
                                iconClass="bg-slate-700 shadow-slate-700/30"
                                label="Total de deducciones"
                                description="Suma de cargas aplicadas"
                                amount={`- ${formatCurrency(
                                    payroll.total_deductions
                                )}`}
                                amountClass="text-slate-700"
                                cardClass="border-slate-200 bg-slate-50"
                            />
                            <div className="relative flex items-center gap-3.5 pt-1">
                                <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-4 border-white bg-emerald-600 text-white shadow-md">
                                    <Wallet className="h-4 w-4" />
                                </div>
                                <div className="flex flex-1 items-center justify-between rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-white px-4 py-3 shadow-sm">
                                    <div>
                                        <p className="text-xs font-bold text-emerald-900">
                                            Salario neto final
                                        </p>

                                        <p className="text-[11px] text-emerald-700/80">
                                            Monto total libre de deducciones
                                        </p>
                                    </div>
                                    <span className="text-base font-black text-emerald-800">
                                        {formatCurrency(payroll.net_salary)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3.5 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm border border-slate-200">
                            <LoaderCircle className="h-5 w-5 animate-spin" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-800">
                                Calculando nómina activa...
                            </p>

                            <p className="text-[11px] text-slate-500">
                                Evaluando reglas de ley vigentes...
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}