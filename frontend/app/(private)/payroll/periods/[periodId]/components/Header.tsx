import Link from "next/link";
import { ArrowLeft, CalendarDays, CircleAlert, FileText, RefreshCw } from "lucide-react";
import type { usePayrollPeriodDetails } from "../hooks/usePayrollPeriodDetails";
import { getPayrollStatus } from "../utils/get-payroll-status";

type Period = NonNullable<
    ReturnType<typeof usePayrollPeriodDetails>["summary"]
>["period"];

interface Props {
    period: Period;
    loading: boolean;
    error: string | null;
    onRefresh: () => void | Promise<unknown>;
}

export default function Header({ period, loading, error, onRefresh }: Props) {
    const status = getPayrollStatus(String(period.status));

    return (
        <>
            <header className="w-full">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="flex min-w-0 items-center gap-3">
                    <Link
                        href="/payroll/periods"
                        className="inline-flex shrink-0 items-center justify-center rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                        aria-label="Volver a períodos"
                    >
                    <ArrowLeft className="h-4 w-4" />
                    </Link>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-600/20">
                    <FileText className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <h1 className="truncate text-lg font-bold tracking-tight text-slate-900">
                        Detalle del período de nómina
                        </h1>

                        <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${status.className}`}
                        >
                        <span
                            className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                        />
                        {status.label}
                        </span>
                    </div>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                    <div className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-sm text-slate-600 ring-1 ring-slate-200/60">
                    <CalendarDays className="h-4 w-4 shrink-0 text-blue-600" />
                    <span className="whitespace-nowrap font-medium text-slate-800">
                        {period.start_date}
                        <span className="mx-1.5 font-normal text-slate-300">—</span>
                        {period.end_date}
                    </span>
                    </div>

                    <button
                    type="button"
                    onClick={() => void onRefresh()}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                    <RefreshCw
                        className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                    />
                    <span className="hidden sm:inline">
                        {loading ? "Actualizando..." : "Actualizar"}
                    </span>
                    </button>
                </div>
                </div>
            </header>

            {error && (
                <div
                role="alert"
                className="mt-3 flex items-start gap-3 rounded-xl border border-rose-200/80 bg-rose-50/90 px-4 py-3 text-sm text-rose-800 shadow-sm"
                >
                <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                <div className="min-w-0 flex-1">
                    <p className="font-semibold">No se pudo actualizar el resumen</p>
                    <p className="mt-1 leading-relaxed">{error}</p>
                </div>
                <button
                    type="button"
                    onClick={() => void onRefresh()}
                    disabled={loading}
                    aria-label="Reintentar actualización del resumen"
                    className="rounded-lg p-1.5 transition-all duration-200 hover:bg-rose-100 active:scale-95 disabled:opacity-50"
                >
                    <RefreshCw
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                    />
                </button>
                </div>
            )}
        </>
    );
}