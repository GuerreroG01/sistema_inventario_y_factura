"use client";

import { ArrowDownRight, Building2, FileText, RefreshCcw, TrendingUp } from "lucide-react";
import type { usePayrollPeriodDetails } from "../hooks/usePayrollPeriodDetails";

type Hook = ReturnType<typeof usePayrollPeriodDetails>;
type Items = Hook["items"];

interface Props {
    items: Items;
    loading: boolean;
    error: string | null;
    onRetry: () => void;
}

const currencyFormatter = new Intl.NumberFormat("es-NI", {
    style: "currency",
    currency: "NIO",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const typeConfig: Record<string, { label: string; badgeClass: string; amountClass: string; sign: string; icon: any }> = {
    EARNING: {
        label: "Percepción",
        badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 border-emerald-100",
        amountClass: "text-emerald-700 font-bold",
        sign: "+",
        icon: TrendingUp,
    },
    DEDUCTION: {
        label: "Deducción",
        badgeClass: "bg-rose-50 text-rose-700 ring-rose-600/20 border-rose-100",
        amountClass: "text-rose-600 font-bold",
        sign: "-",
        icon: ArrowDownRight,
    },
    EMPLOYER_COST: {
        label: "Costo Patronal",
        badgeClass: "bg-indigo-50 text-indigo-700 ring-indigo-600/20 border-indigo-100",
        amountClass: "text-slate-900 font-bold",
        sign: "",
        icon: Building2,
    },
};

export default function PayrollConceptsTable({ items, loading, error, onRetry }: Props) {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-center bg-white">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <div className="absolute h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                </div>
                <p className="mt-3 text-xs font-semibold text-slate-600">
                    Cargando desglose de conceptos...
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                    Esto tomará solo un momento.
                </p>
            </div>
        );
    }
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-white">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 mb-2">
                    <FileText className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-rose-600">{error}</p>
                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95"
                >
                    <RefreshCcw className="h-3.5 w-3.5" />
                    Intentar de nuevo
                </button>
            </div>
        );
    }
    if (!items || items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-center bg-white">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 mb-2">
                    <FileText className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700">Sin conceptos registrados</p>
                <p className="mt-0.5 text-[11px] text-slate-400 max-w-[240px]">
                    No se encontraron percepciones ni deducciones para este empleado en el periodo actual.
                </p>
            </div>
        );
    }
    return (
        <div className="overflow-x-auto bg-white">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                    <tr className="border-b border-slate-200/85 bg-slate-50/80 text-slate-600">
                        <th className="px-4 py-3.5 font-semibold tracking-wide">Concepto / Descripción</th>
                        <th className="px-4 py-3.5 font-semibold tracking-wide">Tipo</th>
                        <th className="px-4 py-3.5 font-semibold tracking-wide text-right">Aplicado</th>
                        <th className="px-4 py-3.5 font-semibold tracking-wide text-right">Monto</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                    {items.map((item) => {
                        const config = typeConfig[item.type] || {
                            label: item.type,
                            badgeClass: "bg-slate-100 text-slate-700 ring-slate-600/20 border-slate-200",
                            amountClass: "text-slate-900 font-bold",
                            sign: "",
                            icon: FileText,
                        };
                        const IconComponent = config.icon;
                        const hasPercentage = item.applied_percentage && Number(item.applied_percentage) > 0;
                        return (
                            <tr key={item.id} className="group transition-colors hover:bg-slate-50/70">
                                <td className="px-4 py-3.5">
                                    <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                        {item.concept}
                                    </div>
                                    {item.description && item.description !== item.concept && (
                                        <div className="mt-0.5 font-mono text-[11px] tracking-tight text-slate-400">
                                            {item.description}
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-3.5">
                                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${config.badgeClass}`}>
                                        <IconComponent className="h-3 w-3 shrink-0" />
                                        {config.label}
                                    </span>
                                </td>
                                <td className="px-4 py-3.5 text-right tabular-nums text-slate-600 font-medium">
                                    {hasPercentage ? (
                                        <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700">
                                            {Number(item.applied_percentage).toFixed(2)}%
                                        </span>
                                    ) : (
                                        <span className="text-slate-300">—</span>
                                    )}
                                </td>
                                <td className={`px-4 py-3.5 text-right tabular-nums text-sm ${config.amountClass}`}>
                                    {config.sign}{currencyFormatter.format(Number(item.amount))}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}