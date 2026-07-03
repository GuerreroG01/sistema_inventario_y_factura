import { CostIcon } from "../../dashboard/Components/ProfibilityMetrics/Icons/CostIcon";
import { ArrowUpTrend } from "../../dashboard/Components/ProfibilityMetrics/Icons/ArrowUpTrend";
import { ArrowDownTrend } from "../../dashboard/Components/ProfibilityMetrics/Icons/ArrowDownTrend";

interface Props {
    label: string;
    value: string;
    change: {
        percentage: number | null;
        direction: "up" | "down" | "neutral";
    };
    onCreate?: () => void;
}
export default function ExpenseMetricCard({ label, value, change, onCreate }: Props) {
    return (
        <div className="
            group relative
            rounded-3xl
            border border-gray-200
            bg-white
            p-6
            shadow-sm
            transition-all duration-300

            hover:shadow-md
            hover:border-gray-300
            hover:-translate-y-0.5
        ">
            <div className="
                absolute inset-0 rounded-3xl
                opacity-0 group-hover:opacity-100
                transition
                bg-gradient-to-br from-gray-50 via-transparent to-gray-50
                pointer-events-none
            " />
            <div className="relative flex justify-between items-start mb-6">
                <div>
                    <p className="text-sm font-semibold text-gray-800 tracking-tight">
                        {label}
                    </p>

                    <p className="text-xs text-gray-400 mt-0.5">
                        Registro de Egresos del Negocio
                    </p>
                </div>

                <div className="
                    p-3 rounded-2xl
                    bg-gray-100
                    border border-gray-200
                    shadow-sm
                    group-hover:bg-gray-200
                    transition
                ">
                    <CostIcon className="w-5 h-5 text-gray-700" />
                </div>

            </div>
            <div className="relative flex justify-between items-end">
                <div className="flex flex-col">
                    <span className="
                        text-4xl font-bold font-mono text-gray-900
                        tracking-tight leading-none
                    ">
                        C${value}
                    </span>

                    <span className="text-xs text-gray-400 mt-1">
                        Total acumulado
                    </span>
                </div>
                <div className="flex flex-col items-end gap-2">
                    {change.percentage !== null && (
                        <span
                            className={`
                                inline-flex items-center gap-1
                                text-xs font-semibold
                                px-3 py-1.5 rounded-full
                                shadow-sm border
                                ${
                                    change.direction === "up"
                                        ? "bg-rose-50 text-rose-600 border-rose-100"
                                        : change.direction === "down"
                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                        : "bg-gray-50 text-gray-500 border-gray-200"
                                }
                            `}
                        >
                            {change.direction === "up" && <ArrowUpTrend />}
                            {change.direction === "down" && <ArrowDownTrend />}

                            <span className="font-mono">
                                {change.percentage >= 0 ? "+" : ""}
                                {change.percentage.toFixed(2)}%
                            </span>
                        </span>
                    )}
                    <button
                        onClick={onCreate}
                        className="
                            inline-flex items-center gap-2
                            px-4 py-2
                            text-xs font-semibold
                            rounded-xl
                            bg-indigo-600
                            text-white
                            shadow-sm
                            ring-1 ring-indigo-500/20
                            hover:bg-indigo-700
                            hover:shadow-md
                            hover:-translate-y-0.5
                            active:translate-y-0
                            active:shadow-sm
                            transition-all duration-200
                            focus:outline-none focus:ring-2 focus:ring-indigo-500/30
                        "
                    >
                        <span className="text-sm leading-none">+</span>
                        Nuevo egreso
                    </button>

                </div>
            </div>
        </div>
    );
}