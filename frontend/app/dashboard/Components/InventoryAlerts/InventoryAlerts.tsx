"use client";

import { useInventoryAlertsMetrics } from "../../hooks/useInventoryAlertsMetrics";
import { BoxIcon } from "./Icons/BoxIcon";
import { InventoryIcon } from "./Icons/InventoryIcon";
import { WarningIcon } from "./Icons/WarningIcon";

export default function InventoryAlertsMetrics() {
    const {
        data,
        loading,
        error
    } = useInventoryAlertsMetrics();

    if (loading) {
        return (
            <div className="rounded-3xl border border-gray-200/80 bg-white p-6 md:p-8 shadow-sm animate-pulse w-full">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="h-6 bg-gray-200 rounded-lg w-56 mb-3"/>
                        <div className="h-3 bg-gray-100 rounded-md w-72"/>
                    </div>
                    <div className="h-9 bg-gray-200 rounded-full w-32"/>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1,2].map(i => (
                        <div
                            key={i}
                            className="h-32 bg-gray-50 rounded-2xl border border-gray-100"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if(error){
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50/60 p-6 text-sm text-red-700 flex items-center gap-4 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 border border-red-200 text-red-600 font-bold text-lg">
                    !
                </div>
                <div>
                    <p className="font-semibold text-gray-900 text-base">
                        Error en Alertas de Inventario
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                        {error}
                    </p>
                </div>
            </div>
        );
    }
    return (
        <div className="w-full rounded-3xl border border-gray-200/80 bg-white p-6 md:p-8 shadow-sm transition-all duration-300 hover:shadow-md relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-orange-50 rounded-full blur-3xl pointer-events-none"/>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-red-50 rounded-full blur-3xl pointer-events-none"/>
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-8 relative z-10">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2.5">
                        <InventoryIcon className="w-5 h-5 text-gray-500"/>
                        Alertas de Inventario
                    </h2>
                    <p className="text-xs font-medium text-gray-500 mt-1">
                        Monitoreo de productos con niveles críticos de stock.
                    </p>
                </div>
                <div
                    className={`
                        inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold
                        ${
                            data.agotados > 0
                            ? "bg-red-50 text-red-700"
                            : data.stockCritico > 0
                            ? "bg-orange-50 text-orange-700"
                            : "bg-emerald-50 text-emerald-700"
                        }
                    `}
                >
                    <span className="relative flex h-2 w-2">
                        <span
                            className={`
                                animate-ping absolute w-full h-full rounded-full
                                ${
                                    data.agotados > 0
                                    ? "bg-red-400"
                                    : data.stockCritico > 0
                                    ? "bg-orange-400"
                                    : "bg-emerald-400"
                                }
                            `}
                        />
                        <span
                            className={`
                                relative inline-flex rounded-full h-2 w-2
                                ${
                                    data.agotados > 0
                                    ? "bg-red-600"
                                    : data.stockCritico > 0
                                    ? "bg-orange-600"
                                    : "bg-emerald-600"
                                }
                            `}
                        />
                    </span>
                    {
                        data.agotados > 0
                        ? "Requiere atención"
                        : data.stockCritico > 0
                        ? "Stock bajo"
                        : "Inventario saludable"
                    }
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                <InventoryMetricBlock
                    type="critical"
                    label="Stock Crítico"
                    subLabel="Productos con pocas unidades"
                    value={data.stockCritico}
                />
                <InventoryMetricBlock
                    type="empty"
                    label="Productos Agotados"
                    subLabel="Sin disponibilidad actual"
                    value={data.agotados}
                />
            </div>
        </div>
    );
}
interface InventoryMetricBlockProps {
    type:
    | "critical"
    | "empty";
    label:string;
    subLabel:string;
    value:number;
}
function InventoryMetricBlock({
    type,
    label,
    subLabel,
    value
}:InventoryMetricBlockProps){
    const styles = {
        critical:{
            border:
            "hover:border-orange-200 hover:bg-orange-50/20",
            icon:
            <WarningIcon className="w-5 h-5 text-orange-600"/>,
            bg:
            "bg-orange-50 border-orange-100",
            value:
            "text-orange-700"
        },
        empty:{
            border:
            "hover:border-red-200 hover:bg-red-50/20",
            icon:
            <BoxIcon className="w-5 h-5 text-red-600"/>,
            bg:
            "bg-red-50 border-red-100",
            value:
            "text-red-700"
        }
    }[type];
    return (
        <div
            className={`
                group p-5 rounded-2xl border border-gray-100 shadow-sm
                transition-all duration-300
                ${styles.border}
            `}
        >
            <div className="flex justify-between mb-5">
                <div>
                    <p className="text-xs font-semibold text-gray-500">
                        {label}
                    </p>
                    <p className="text-[11px] text-gray-400">
                        {subLabel}
                    </p>
                </div>
                <div className={`p-2 rounded-xl border ${styles.bg}`}>
                    {styles.icon}
                </div>
            </div>
            <div className="flex justify-between items-end">
                <span
                    className={`
                        text-3xl font-bold font-mono
                        ${styles.value}
                    `}
                >
                    {value}
                </span>
                <span className="text-xs font-semibold text-gray-400">
                    productos
                </span>
            </div>
        </div>
    );
}