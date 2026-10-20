
import Link from "next/link";
import { ArrowLeft, CircleAlert, RefreshCw } from "lucide-react";

interface PayrollPeriodErrorProps {
  error: string;
  loading: boolean;
  onRetry: () => void | Promise<unknown>;
}

export default function PeriodError({
  error,
  loading,
  onRetry,
}: PayrollPeriodErrorProps) {
    return (
        <section className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-b from-slate-50/80 via-white to-white p-4 shadow-sm md:p-6">
            <div className="pointer-events-none absolute -left-32 -top-32 h-72 w-72 rounded-full bg-blue-100/50 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-indigo-100/50 blur-3xl" />

            <div className="relative z-10 space-y-6">
                <Link
                href="/payroll-periods"
                className="inline-flex w-fit items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition-all duration-200 hover:bg-white hover:text-blue-700 hover:shadow-sm"
                >
                <ArrowLeft className="h-4 w-4" />
                Volver a períodos
                </Link>

                <div
                role="alert"
                className="rounded-2xl border border-rose-200/80 bg-rose-50/90 p-5 text-rose-800 shadow-sm backdrop-blur-sm"
                >
                <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-rose-100 p-2.5">
                    <CircleAlert className="h-5 w-5 text-rose-600" />
                    </div>

                    <div className="min-w-0 flex-1">
                    <h2 className="font-bold tracking-tight">
                        No se pudo cargar el período
                    </h2>

                    <p className="mt-1.5 text-sm leading-relaxed">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() => void onRetry()}
                        disabled={loading}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 shadow-sm transition-all duration-200 hover:bg-rose-100 hover:shadow active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <RefreshCw
                        className={`h-4 w-4 ${
                            loading ? "animate-spin" : ""
                        }`}
                        />
                        Reintentar
                    </button>
                    </div>
                </div>
                </div>
            </div>
        </section>
    );
}
