"use client";

import {
    X,
    AlertTriangle,
    PackageX,
    Package
} from "lucide-react";

import type { StockAlertProduct } from "@/types/dashboard/inventoryAlertsProducts";
import StockAlertItem from "./StockAlertItem";

interface InventoryAlertsModalProps {
    open: boolean;
    type: "critical" | "empty";
    products: StockAlertProduct[];
    loading: boolean;
    onClose: () => void;
}

export default function InventoryAlertsModal({
    open, type, products, loading, onClose
}: InventoryAlertsModalProps) {

    if (!open) return null;
    const isCritical = type === "critical";
    const config = isCritical
        ? {
            title: "Productos con Stock Crítico",
            subtitle: "Productos con pocas unidades disponibles.",
            badge: "Stock Bajo",
            icon: AlertTriangle,
            iconBg: "bg-orange-500",
            badgeBg: "bg-orange-50 text-orange-700",
            summaryBg: "bg-orange-50/50 border-orange-100",
        }
        : {
            title: "Productos Agotados",
            subtitle: "Productos sin existencia actualmente.",
            badge: "Sin Existencias",
            icon: PackageX,
            iconBg: "bg-red-500",
            badgeBg: "bg-red-50 text-red-700",
            summaryBg: "bg-red-50/50 border-red-100",
        };
    const Icon = config.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-slate-900/70 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />
            <div
                className="
                    relative
                    w-full
                    max-w-4xl
                    rounded-[2.5rem]
                    bg-white
                    border
                    border-slate-100
                    shadow-2xl
                    overflow-hidden
                    max-h-[92vh]
                    flex
                    flex-col
                "
            >
                <div className="flex items-start justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div
                            className={`
                                flex
                                h-12
                                w-12
                                items-center
                                justify-center
                                rounded-2xl
                                text-white
                                shadow-lg
                                ${config.iconBg}
                            `}
                        >
                            <Icon className="w-6 h-6" />
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span
                                    className={`
                                        rounded-md
                                        px-2
                                        py-0.5
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-widest
                                        ${config.badgeBg}
                                    `}
                                >
                                    {config.badge}
                                </span>
                            </div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">
                                {config.title}
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                {config.subtitle}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="
                            rounded-xl
                            p-2
                            text-slate-400
                            hover:text-slate-700
                            hover:bg-slate-100
                            transition-all
                        "
                    >
                        <X className="w-5 h-5" />
                    </button>

                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-white">
                    <div
                        className={`
                            mb-6
                            rounded-2xl
                            border
                            p-4
                            ${config.summaryBg}
                        `}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Package className="w-5 h-5 text-slate-600" />
                                <div>
                                    <p className="text-xs uppercase tracking-wider font-bold text-slate-500">
                                        Total de productos
                                    </p>
                                    <h3 className="text-2xl font-black text-slate-900">
                                        {products.length}
                                    </h3>
                                </div>
                            </div>
                            <span
                                className={`
                                    rounded-full
                                    px-3
                                    py-1
                                    text-xs
                                    font-bold
                                    ${config.badgeBg}
                                `}
                            >
                                {config.badge}
                            </span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="space-y-4 animate-pulse">
                            {[1, 2, 3, 4].map((item) => (
                                <div
                                    key={item}
                                    className="h-24 rounded-3xl bg-slate-100"
                                />
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Package className="w-12 h-12 text-slate-300 mb-4" />
                            <h3 className="text-lg font-bold text-slate-700">
                                No hay productos
                            </h3>
                            <p className="text-sm text-slate-500 mt-2">
                                No existen productos para mostrar en esta categoría.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {products.map((product) => (
                                <StockAlertItem
                                    key={product.barcode}
                                    product={product}
                                    type={type}
                                />
                            ))}
                        </div>
                    )}

                </div>
                <div className="flex justify-end border-t border-slate-100 bg-slate-50/70 p-5 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="
                            w-full
                            sm:w-auto
                            rounded-xl
                            bg-slate-900
                            px-8
                            py-3
                            text-xs
                            font-bold
                            text-white
                            shadow-md
                            transition-all
                            hover:bg-slate-800
                            active:scale-95
                        "
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}