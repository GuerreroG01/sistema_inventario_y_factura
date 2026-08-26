"use client";

import { Plus } from "lucide-react";
import { CostIcon } from "../../dashboard/Components/ProfibilityMetrics/Icons/CostIcon";

interface Props {
    label: string;
    value: number;
    onCreate?: () => void;
}

export default function ExpenseHeader({
    label,
    value,
    onCreate,
}: Props) {
    const currencyFormatter = new Intl.NumberFormat("es-NI", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return (
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-b from-slate-50/50 to-white p-6 shadow-sm md:p-10">

            <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-violet-100/60 blur-3xl pointer-events-none" />

            <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-indigo-100/60 blur-3xl pointer-events-none" />

            <div className="space-y-8">

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                    <div>
                        <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-slate-900">

                            <div className="rounded-2xl bg-violet-600 p-2.5 text-white shadow-md shadow-violet-500/20">
                                <CostIcon className="h-6 w-6" />
                            </div>

                            Egresos

                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Administra y controla los egresos registrados del negocio.
                        </p>
                    </div>


                    <button
                        onClick={onCreate}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-700"
                    >
                        <Plus className="h-5 w-5" />
                        Nuevo egreso
                    </button>

                </div>

                <div className="border-t border-slate-200 pt-6">

                    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

                        <div>

                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                {label}
                            </p>


                            <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">
                                C${currencyFormatter.format(value)}
                            </h2>


                            <p className="mt-2 text-sm text-slate-500">
                                Total acumulado de egresos registrados.
                            </p>

                        </div>


                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                            <CostIcon className="h-8 w-8" />
                        </div>

                    </div>

                </div>

            </div>

        </section>
    );
}