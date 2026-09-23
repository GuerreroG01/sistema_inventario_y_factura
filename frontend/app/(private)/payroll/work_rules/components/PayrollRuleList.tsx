"use client";

import { useState } from "react";
import {
    CalendarDays,
    Building2,
    MoreVertical,
    Eye,
    PlusCircle,
    Power,
    Percent,
    DollarSign,
    ReceiptText,
    Wallet,
    Landmark,
} from "lucide-react";

import {
    PayrollRule,
    PayrollRuleType,
} from "@/types/worksheet/payroll/PayrollRule";

type PayrollRuleListProps = {
    rules: PayrollRule[];
    loading: boolean;
    error: string | null;
    onCreateVersion?: (rule: PayrollRule) => void;
    onChangeStatus?: (id: number, active: boolean) => Promise<PayrollRule>;
};

const typeConfig: Record<
    PayrollRuleType,
    {
        label: string;
        icon: typeof Wallet;
        color: string;
        bg: string;
        border: string;
        dot: string;
    }
> = {
    EARNING: {
        label: "Ingreso",
        icon: Wallet,
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-100",
        dot: "bg-blue-500",
    },

    DEDUCTION: {
        label: "Deducción",
        icon: ReceiptText,
        color: "text-rose-600",
        bg: "bg-rose-50",
        border: "border-rose-100",
        dot: "bg-rose-500",
    },

    EMPLOYER_COST: {
        label: "Costo patronal",
        icon: Landmark,
        color: "text-violet-600",
        bg: "bg-violet-50",
        border: "border-violet-100",
        dot: "bg-violet-500",
    },
};

function formatDate(date: string | null) {
    if (!date) return "Sin fecha";

    const parsedDate = new Date(`${date}T00:00:00`);

    return parsedDate.toLocaleDateString("es-NI", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatRuleValue(rule: PayrollRule) {
    if (rule.calculation_type === "PROGRESSIVE") {
        return {
            value: "Progresivo",
            type: "Cálculo progresivo",
            icon: ReceiptText,
        };
    }

    if (rule.calculation_type === "PERCENTAGE") {
        return {
            value:
                rule.percentage !== null
                    ? `${rule.percentage}%`
                    : "—",
            type: "Porcentaje",
            icon: Percent,
        };
    }

    if (rule.calculation_type === "FIXED") {
        return {
            value:
                rule.value !== null
                    ? rule.value.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      })
                    : "—",
            type: "Valor fijo",
            icon: DollarSign,
        };
    }

    return {
        value: "—",
        type: "Sin valor",
        icon: DollarSign,
    };
}

export default function PayrollRuleList({
    rules,
    loading,
    error,
    onCreateVersion,
    onChangeStatus,
}: PayrollRuleListProps) {
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    console.log("[RULES]", rules);
    if (error) {
        return (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
                {error}
            </div>
        );
    }

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3, 4].map((n) => (
                    <div
                        key={n}
                        className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-slate-100/60"
                    />
                ))}
            </div>
        );
    }

    if (rules.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/50 p-12 text-center">
                <div className="mb-3 rounded-full bg-slate-100 p-4 text-slate-400">
                    <ReceiptText className="h-8 w-8" />
                </div>

                <h3 className="text-base font-semibold text-slate-800">
                    No hay reglas de nómina
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                    No se encontraron reglas que coincidan con los filtros
                    seleccionados.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {rules.map((rule) => {
                const config = typeConfig[rule.type];
                const TypeIcon = config.icon;
                const ruleValue = formatRuleValue(rule);
                const ValueIcon = ruleValue.icon;

                const isActive = rule.active;
                const canActivate = !rule.active && rule.effective_to === null;
                const canDeactivate = rule.active;
                const canCreateVersion = onCreateVersion && !rule.effective_to;
                const canShowDeactivate = canDeactivate && onChangeStatus;
                const canShowActivate = canActivate && onChangeStatus;
                const hasMenuOptions = canCreateVersion || canShowDeactivate || canShowActivate;
                const isMenuOpen = openMenuId === rule.id;

                return (
                    <div
                        key={rule.id}
                        className={`group relative rounded-2xl border bg-white shadow-sm transition-all duration-200 ${
                            isActive
                                ? "border-slate-200 hover:border-blue-200 hover:shadow-md"
                                : "border-slate-200 bg-slate-50/80 opacity-70"
                        } ${
                            isMenuOpen ? "z-50" : "z-0"
                        }`}
                    >
                        <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center">
                            <div className="flex min-w-0 flex-1 items-center gap-3 lg:min-w-[240px]">
                                <div
                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${config.bg} ${config.color} shadow-sm`}
                                >
                                    <TypeIcon className="h-5 w-5" />
                                </div>

                                <div className="min-w-0">
                                    <h2
                                        className={`truncate text-sm font-bold text-slate-900 transition-colors ${
                                            isActive
                                                ? "group-hover:text-blue-600"
                                                : ""
                                        }`}
                                    >
                                        {rule.name}
                                    </h2>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Código:{" "}
                                        <span className="font-semibold text-slate-600">
                                            {rule.code}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className="lg:w-[150px]">
                                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 lg:hidden">
                                    Tipo
                                </p>

                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${config.bg} ${config.color} ${config.border}`}
                                >
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
                                    />

                                    {config.label}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 lg:w-[170px]">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                                    <ValueIcon className="h-4 w-4" />
                                </div>

                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                        Valor
                                    </p>

                                    <p className="text-sm font-extrabold text-slate-800">
                                        {ruleValue.value}
                                    </p>

                                    <p className="text-[10px] font-medium text-slate-400">
                                        {ruleValue.type}
                                    </p>
                                </div>
                            </div>
                            {rule.branch && (
                                <div className="flex min-w-0 items-center gap-2 lg:w-[190px]">
                                    <Building2 className="h-4 w-4 shrink-0 text-slate-400" />

                                    <div className="min-w-0">
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                            Sucursal
                                        </p>

                                        <p className="truncate text-xs font-semibold text-slate-700">
                                            {rule.branch.name}
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="flex min-w-0 items-center gap-2 lg:w-[220px]">
                                <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />

                                <div className="min-w-0">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                        Vigencia
                                    </p>

                                    <p className="truncate text-xs font-semibold text-slate-700">
                                        {formatDate(rule.effective_from)}
                                    </p>

                                    <p className="truncate text-[10px] text-slate-400">
                                        {rule.effective_to
                                            ? `Hasta ${formatDate(
                                                  rule.effective_to
                                              )}`
                                            : "Sin fecha de finalización"}
                                    </p>
                                </div>
                            </div>
                            <div className="lg:w-[100px]">
                                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                    Estado
                                </p>

                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                                        isActive
                                            ? "bg-emerald-50 text-emerald-600"
                                            : "bg-rose-50 text-rose-600"
                                    }`}
                                >
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${
                                            isActive
                                                ? "bg-emerald-500"
                                                : "bg-rose-500"
                                        }`}
                                    />

                                    {isActive ? "Activa" : "Inactiva"}
                                </span>
                            </div>
                            {hasMenuOptions && (
                                <div className="relative ml-auto shrink-0">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setOpenMenuId(
                                                isMenuOpen ? null : rule.id
                                            )
                                        }
                                        className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </button>

                                    {isMenuOpen && (
                                        <div className="absolute right-0 top-full z-30 mt-1 w-48 animate-in fade-in zoom-in-95 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl duration-150">
                                            {onCreateVersion && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setOpenMenuId(null);
                                                        onCreateVersion(rule);
                                                    }}
                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
                                                >
                                                    <PlusCircle className="h-3.5 w-3.5 text-blue-500" />
                                                    Nueva versión
                                                </button>
                                            )}
                                            {canDeactivate && onChangeStatus && (
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        setOpenMenuId(null);
                                                        await onChangeStatus(rule.id, false);
                                                    }}
                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-50"
                                                >
                                                    <Power className="h-3.5 w-3.5" />
                                                    Desactivar
                                                </button>
                                            )}
                                            {canActivate && onChangeStatus && (
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        setOpenMenuId(null);
                                                        await onChangeStatus(rule.id, true);
                                                    }}
                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-50"
                                                >
                                                    <Power className="h-3.5 w-3.5" />
                                                    Activar
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}