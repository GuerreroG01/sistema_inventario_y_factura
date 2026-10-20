"use client";

import { useMemo } from "react";
import {
    X,
    Users,
    Wallet,
    TrendingUp,
    TrendingDown,
    Building2,
    CheckCircle2,
    FileSpreadsheet,
    CalendarDays,
} from "lucide-react";
import { CalculatePayrollResult } from "@/types/worksheet/payroll/PayrollPeriod";
import { formatDate } from "../utils/format-date";

type Props = {
    open: boolean;
    result: CalculatePayrollResult | null;
    onClose: () => void;
};

const formatMoney = (value: number) =>
    new Intl.NumberFormat("es-NI", {
        style: "currency",
        currency: "NIO",
        minimumFractionDigits: 2,
    }).format(value);

export default function PayrollCalculationResultModal({
    open,
    result,
    onClose,
}: Props) {
    const totals = useMemo(() => {
        if (!result?.employees?.length) {
            return {
                gross: 0,
                earnings: 0,
                deductions: 0,
                net: 0,
                employerCost: 0,
            };
        }

        return result.employees.reduce(
            (acc, emp) => ({
                gross: acc.gross + Number(emp.gross_salary || 0),
                earnings: acc.earnings + Number(emp.total_earnings || 0),
                deductions: acc.deductions + Number(emp.total_deductions || 0),
                net: acc.net + Number(emp.net_salary || 0),
                employerCost: acc.employerCost + Number(emp.employer_cost || 0),
            }),
            { gross: 0, earnings: 0, deductions: 0, net: 0, employerCost: 0 }
        );
    }, [result]);

    if (!open || !result) return null;

    return (
        <div className="fixed inset-0 z-[9999]">
            <div
                className="absolute inset-0 bg-slate-950/65 backdrop-blur-[8px] animate-in fade-in duration-200"
                onClick={onClose}
            />
            <div
                className="relative z-10 flex h-full w-full justify-center overflow-y-auto px-3 sm:px-4"
                style={{
                    paddingTop: "max(5.5rem, calc(env(safe-area-inset-top) + 4.5rem))",
                    paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
                }}
            >
                <div
                    className="my-auto flex w-full max-w-3xl flex-col overflow-hidden rounded-[1.75rem] border border-white/30 bg-white shadow-[0_25px_80px_-20px_rgba(15,23,42,0.45)] animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300"
                    style={{
                        maxHeight: "calc(100dvh - 7.5rem)",
                    }}
                >
                    <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 px-4 py-3 text-white sm:px-5">
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_50%)]" />

                        <div className="relative flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2.5">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/25 backdrop-blur-sm">
                                    <CheckCircle2 className="h-4 w-4" />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                        <h2 className="text-sm font-bold tracking-tight sm:text-[15px]">
                                            Nómina calculada
                                        </h2>
                                        <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold ring-1 ring-white/20">
                                            #{result.period.id}
                                        </span>
                                    </div>
                                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-emerald-50/90">
                                        <CalendarDays className="h-3 w-3 shrink-0 opacity-80" />
                                        <span className="truncate">
                                            {formatDate(result.period.start_date)} –{" "}
                                            {formatDate(result.period.end_date)}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                className="shrink-0 rounded-lg p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white active:scale-95"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    <div className="grid shrink-0 grid-cols-2 gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-2.5 sm:grid-cols-4 sm:gap-2.5 sm:px-5">
                        <SummaryCard
                            icon={<Users className="h-3.5 w-3.5" />}
                            label="Empleados"
                            value={String(result.totalEmployees)}
                            tone="indigo"
                        />
                        <SummaryCard
                            icon={<Wallet className="h-3.5 w-3.5" />}
                            label="Neto total"
                            value={formatMoney(totals.net)}
                            tone="emerald"
                        />
                        <SummaryCard
                            icon={<TrendingUp className="h-3.5 w-3.5" />}
                            label="Ingresos"
                            value={formatMoney(totals.earnings)}
                            tone="sky"
                        />
                        <SummaryCard
                            icon={<TrendingDown className="h-3.5 w-3.5" />}
                            label="Deducciones"
                            value={formatMoney(totals.deductions)}
                            tone="rose"
                        />
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3.5 sm:px-5">
                        <div className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            <FileSpreadsheet className="h-3.5 w-3.5" />
                            Detalle por empleado
                        </div>

                        <div className="space-y-3 pb-1">
                            {result.employees.map((emp) => (
                                <div
                                    key={emp.payroll_employee_id ?? emp.employee_id}
                                    className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-sm transition hover:border-indigo-200 hover:shadow-md sm:p-4"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">
                                                Empleado #{emp.employee_id}
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-slate-500">
                                                Employment #{emp.employment_id}
                                                {emp.payroll_employee_id != null && (
                                                    <> · Nómina #{emp.payroll_employee_id}</>
                                                )}
                                            </p>
                                        </div>
                                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                                            {emp.status}
                                        </span>
                                    </div>

                                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                        <MiniStat
                                            label="Bruto"
                                            value={formatMoney(emp.gross_salary)}
                                        />
                                        <MiniStat
                                            label="Ingresos"
                                            value={formatMoney(emp.total_earnings)}
                                            positive
                                        />
                                        <MiniStat
                                            label="Deducciones"
                                            value={formatMoney(emp.total_deductions)}
                                            negative
                                        />
                                        <MiniStat
                                            label="Neto"
                                            value={formatMoney(emp.net_salary)}
                                            highlight
                                        />
                                    </div>

                                    {emp.items && emp.items.length > 0 && (
                                        <div className="mt-3 overflow-hidden rounded-xl border border-slate-100">
                                            <table className="w-full text-left text-[11px]">
                                                <thead className="bg-slate-50 text-slate-500">
                                                    <tr>
                                                        <th className="px-3 py-2 font-semibold">
                                                            Concepto
                                                        </th>
                                                        <th className="px-3 py-2 font-semibold">
                                                            Tipo
                                                        </th>
                                                        <th className="px-3 py-2 text-right font-semibold">
                                                            Monto
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {emp.items.map((item, idx) => (
                                                        <tr
                                                            key={`${item.payroll_rule_id}-${idx}`}
                                                            className="border-t border-slate-50"
                                                        >
                                                            <td className="px-3 py-2 font-medium text-slate-700">
                                                                {item.concept}
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <TypeBadge type={item.type} />
                                                            </td>
                                                            <td className="px-3 py-2 text-right font-semibold text-slate-800">
                                                                {formatMoney(item.amount)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                                        <Building2 className="h-3.5 w-3.5" />
                                        Costo patronal:{" "}
                                        <span className="font-semibold text-slate-700">
                                            {formatMoney(emp.employer_cost)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/95 px-4 py-3 sm:px-5">
                        <p className="text-xs text-slate-500">
                            Pago programado:{" "}
                            <span className="font-semibold text-slate-700">
                                {formatDate(result.period.payment_date)}
                            </span>
                        </p>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-95"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SummaryCard({
    icon,
    label,
    value,
    tone,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    tone: "indigo" | "emerald" | "sky" | "rose";
}) {
    const tones = {
        indigo: "bg-indigo-50 text-indigo-600",
        emerald: "bg-emerald-50 text-emerald-600",
        sky: "bg-sky-50 text-sky-600",
        rose: "bg-rose-50 text-rose-600",
    };

    return (
        <div className="rounded-xl border border-slate-200/80 bg-white px-2.5 py-2 shadow-sm">
            <div className="flex items-center gap-1.5">
                <div className={`inline-flex rounded-md p-1 ${tones[tone]}`}>
                    {icon}
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {label}
                </p>
            </div>
            <p className="mt-1 truncate text-xs font-bold text-slate-900 sm:text-[13px]">
                {value}
            </p>
        </div>
    );
}

function MiniStat({
    label,
    value,
    positive,
    negative,
    highlight,
}: {
    label: string;
    value: string;
    positive?: boolean;
    negative?: boolean;
    highlight?: boolean;
}) {
    return (
        <div
            className={`rounded-xl px-2.5 py-2 ${
                highlight ? "border border-emerald-100 bg-emerald-50" : "bg-slate-50"
            }`}
        >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {label}
            </p>
            <p
                className={`mt-0.5 text-xs font-bold ${
                    positive
                        ? "text-sky-700"
                        : negative
                          ? "text-rose-600"
                          : highlight
                            ? "text-emerald-700"
                            : "text-slate-800"
                }`}
            >
                {value}
            </p>
        </div>
    );
}

function TypeBadge({ type }: { type: string }) {
    const styles: Record<string, string> = {
        EARNING: "bg-sky-50 text-sky-700 border-sky-100",
        DEDUCTION: "bg-rose-50 text-rose-700 border-rose-100",
        EMPLOYER_COST: "bg-amber-50 text-amber-700 border-amber-100",
    };

    const labels: Record<string, string> = {
        EARNING: "Ingreso",
        DEDUCTION: "Deducción",
        EMPLOYER_COST: "Costo patronal",
    };

    return (
        <span
            className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                styles[type] || "border-slate-100 bg-slate-50 text-slate-600"
            }`}
        >
            {labels[type] || type}
        </span>
    );
}