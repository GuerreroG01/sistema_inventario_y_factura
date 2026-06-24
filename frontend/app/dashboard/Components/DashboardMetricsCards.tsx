"use client";

import { useEffect, useState } from "react";
import ModalError from "../../../components/ModalError";
import { DollarSign, TrendingUp, AlertTriangle, Activity, ShieldAlert } from "lucide-react";
import { useDashboardMetrics } from "../hooks/useDashboardMetrics";

export default function DashboardMetricsCards() {
    const {
        metrics,
        loading,
        error
    } = useDashboardMetrics();

    const [showWarningModal, setShowWarningModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);

    useEffect(() => {

        if (metrics?.warnings?.length > 0) {
            setShowWarningModal(true);
        }

        if (metrics?.errors?.length > 0) {
            setShowErrorModal(true);
        }

    }, [metrics]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between animate-pulse">
                            <div className="h-4 w-24 rounded-md bg-gray-200" />
                            <div className="h-10 w-10 rounded-xl bg-gray-100" />
                        </div>
                        <div className="mt-4 h-8 w-28 rounded-lg bg-gray-200 animate-pulse" />
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50/50 p-4 text-sm text-red-700 shadow-sm backdrop-blur-sm">
                <ShieldAlert className="h-5 w-5 flex-shrink-0 text-red-600 mt-0.5" />
                <div>
                    <span className="font-semibold block text-red-800">Error de conexión:</span> 
                    <span className="text-red-600/90">{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <ModalError
                open={showWarningModal}
                title="Advertencias del Sistema"
                message={
                    metrics.warnings.join("\n")
                }
                onClose={() => setShowWarningModal(false)}
            />


            <ModalError
                open={showErrorModal}
                title="Errores Detectados"
                message={
                    metrics.errors
                        .map(err => `${err.module}: ${err.message}`)
                        .join("\n")
                }
                onClose={() => setShowErrorModal(false)}
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <MetricCard
                    title="Ventas Hoy"
                    value={metrics?.data.ventasHoy}
                    isCurrency
                    Icon={DollarSign}
                    variant="blue"
                />

                <MetricCard
                    title="Ventas Mes"
                    value={metrics?.data.ventasMes}
                    isCurrency
                    Icon={TrendingUp}
                    variant="emerald"
                />

                <MetricCard
                    title="Ganancia"
                    value={metrics?.data.ganancia}
                    isCurrency
                    Icon={DollarSign}
                    variant="purple"
                />

                <MetricCard
                    title="Stock Bajo"
                    value={metrics?.data.stockBajo}
                    Icon={AlertTriangle}
                    variant="amber"
                    highlight={metrics?.data.stockBajo > 0}
                />

                <MetricCard
                    title="Productos Activos"
                    value={metrics?.data.productosActivos}
                    Icon={Activity}
                    variant="sky"
                />
            </div>
        </div>
    );
}

type CardVariant = "blue" | "emerald" | "purple" | "amber" | "sky";

type MetricCardProps = {
    title: string;
    value: number;
    isCurrency?: boolean;
    Icon: React.ComponentType<{ className?: string }>;
    variant: CardVariant;
    highlight?: boolean;
};

function MetricCard({ title, value, isCurrency = false, Icon, variant, highlight = false }: MetricCardProps) {
    const variantStyles: Record<CardVariant, { badge: string; icon: string; gradient: string }> = {
        blue: {
            badge: "bg-blue-50 border-blue-100",
            icon: "text-blue-600",
            gradient: "from-blue-500/5 to-transparent",
        },
        emerald: {
            badge: "bg-emerald-50 border-emerald-100",
            icon: "text-emerald-600",
            gradient: "from-emerald-500/5 to-transparent",
        },
        purple: {
            badge: "bg-purple-50 border-purple-100",
            icon: "text-purple-600",
            gradient: "from-purple-500/5 to-transparent",
        },
        amber: {
            badge: "bg-amber-50 border-amber-100",
            icon: "text-amber-600",
            gradient: "from-amber-500/5 to-transparent",
        },
        sky: {
            badge: "bg-sky-50 border-sky-100",
            icon: "text-sky-600",
            gradient: "from-sky-500/5 to-transparent",
        },
    };

    const formattedValue = isCurrency
        ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : value.toLocaleString();

    return (
        <div 
            className={`relative overflow-hidden rounded-2xl border bg-white p-6 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_20px_-8px_rgba(0,0,0,0.08)] ${
                highlight 
                    ? "border-amber-300 ring-4 ring-amber-500/10" 
                    : "border-gray-100"
            }`}
        >
            <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium tracking-tight text-gray-500/90">{title}</span>
                <div className={`p-2.5 rounded-xl border transition-colors ${variantStyles[variant].badge}`}>
                    <Icon className={`h-4 w-4 ${variantStyles[variant].icon}`} />
                </div>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                    {formattedValue}
                </h2>
            </div>
            
            <div className={`absolute -bottom-2 -right-2 h-16 w-16 bg-gradient-to-br rounded-full blur-xl ${variantStyles[variant].gradient}`} />
        </div>
    );
}