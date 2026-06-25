import { SalesIcon } from "./Icons/SalesIcon";
import { CostIcon } from "./Icons/CostIcon";
import { ProfitIcon } from "./Icons/ProfitIcon";
import { EfficiencyIcon } from "./Icons/EfficiencyIcon";
import { ChartBarIcon } from "./Icons/ChartBarIcon";
import { ArrowUpTrend } from "./Icons/ArrowUpTrend";
import { ArrowDownTrend } from "./Icons/ArrowDownTrend";


interface MetricCardProps {

    type:
    | "sales"
    | "costs"
    | "profit"
    | "margin"
    | "ratio"
    | "roi";

    label:string;
    subLabel:string;
    value:string;

    change:{
        change:number;
        percentage:number|null;
        direction:"up"|"down"|"neutral";
    };
}

export default function MetricCard({
    type,
    label,
    subLabel,
    value,
    change
}:MetricCardProps){

    const styles = {
        sales:{
            border:"hover:border-blue-200 hover:bg-blue-50/20",
            icon:<SalesIcon className="w-5 h-5 text-blue-600"/>,
            bg:"bg-blue-50 border-blue-100"
        },
        costs:{
            border:"hover:border-rose-200 hover:bg-rose-50/20",
            icon:<CostIcon className="w-5 h-5 text-rose-600"/>,
            bg:"bg-rose-50 border-rose-100"
        },
        profit:{
            border:"hover:border-emerald-200 hover:bg-emerald-50/20",
            icon:<ProfitIcon className="w-5 h-5 text-emerald-600"/>,
            bg:"bg-emerald-50 border-emerald-100"
        },
        margin:{
            border:"hover:border-purple-200 hover:bg-purple-50/20",
            icon:<ChartBarIcon className="w-5 h-5 text-purple-600"/>,
            bg:"bg-purple-50 border-purple-100"
        },
        ratio:{
            border:"hover:border-indigo-200 hover:bg-indigo-50/20",
            icon:<EfficiencyIcon className="w-5 h-5 text-indigo-600"/>,
            bg:"bg-indigo-50 border-indigo-100"
        },
        roi:{
            border:"hover:border-amber-200 hover:bg-amber-50/20",
            icon:<ProfitIcon className="w-5 h-5 text-amber-600"/>,
            bg:"bg-amber-50 border-amber-100"
        }
    }[type];

    return (
        <div
            className={`
                group
                p-5
                rounded-2xl
                border border-gray-100
                shadow-sm
                transition-all
                ${styles.border}
            `}
        >
            <div className="flex justify-between mb-4">
                <div>
                    <p className="
                        text-xs
                        font-semibold
                        text-gray-500
                    ">
                        {label}
                    </p>
                    <p className="
                        text-[11px]
                        text-gray-400
                    ">
                        {subLabel}
                    </p>
                </div>
                <div className={`
                    p-2
                    rounded-xl
                    border
                    ${styles.bg}
                `}>
                    {styles.icon}
                </div>
            </div>
            <div className="
                flex
                justify-between
                items-end
            ">
                <span className="
                    text-2xl
                    font-bold
                    font-mono
                    text-gray-900
                ">
                    {value}
                </span>

                {
                    change.percentage !== null && (
                        <span
                            className={`
                                flex
                                items-center
                                gap-1
                                text-xs
                                font-bold
                                ${
                                    change.direction === "up"
                                    ? "text-emerald-600"
                                    : change.direction === "down"
                                    ? "text-rose-600"
                                    : "text-gray-400"
                                }
                            `}
                        >
                            {
                                change.direction === "up"
                                ? <ArrowUpTrend/>
                                : change.direction === "down"
                                ? <ArrowDownTrend/>
                                : null
                            }
                            {change.percentage >= 0 ? "+" : ""}
                            {change.percentage.toFixed(2)}%
                        </span>
                    )
                }
            </div>
        </div>
    );
}