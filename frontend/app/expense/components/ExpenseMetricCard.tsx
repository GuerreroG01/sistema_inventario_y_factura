import { CostIcon } from "../../dashboard/Components/ProfibilityMetrics/Icons/CostIcon";

interface Props {
    label: string;
    value: number;
    onCreate?: () => void;
}
export default function ExpenseMetricCard({ label, value, onCreate }: Props) {
    const currencyFormatter = new Intl.NumberFormat("es-NI", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
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
                <div className="flex flex-col items-end gap-2">
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
            <div className="relative flex justify-between items-end">
                <div className="flex flex-col">
                    <span className="
                        text-4xl font-bold font-mono text-gray-900
                        tracking-tight leading-none
                    ">
                        C${currencyFormatter.format(value)}
                    </span>

                    <span className="text-xs text-gray-400 mt-1">
                        Total acumulado
                    </span>
                </div>
            </div>
        </div>
    );
}