import { useState } from "react";
import { CalendarClock, ChevronDown, ChevronUp, Package } from "lucide-react";

import { ExpiringProduct } from "@/types/dashboard/expiringProductsMetrics";
import { ProductUnitsDetail } from "./ProductUnitsDetails";

interface Props {
    product: ExpiringProduct;
}

function getDaysUntilExpiration(fechaVencimiento: string) {
    const today = new Date();
    const expiration = new Date(fechaVencimiento);

    today.setHours(0, 0, 0, 0);
    expiration.setHours(0, 0, 0, 0);

    return Math.ceil(
        (expiration.getTime() - today.getTime()) / 86400000
    );
}

function formatDate(fecha: string) {
    return new Date(fecha).toLocaleDateString("es-NI", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function getExpirationStatus(days: number) {
    if (days <= 7) {
        return {
            label:
                days < 0
                    ? "Expirado"
                    : days === 0
                    ? "Hoy"
                    : `${days} días`,
            className:
                "bg-red-50 text-red-700 border-red-100",
            dot: "bg-red-500",
        };
    }

    return {
        label: `${days} días`,
        className:
            "bg-amber-50 text-amber-700 border-amber-100",
        dot: "bg-amber-500",
    };
}

export function ExpiringProductRow({ product }: Props) {
    const [expanded, setExpanded] = useState(false);

    const days = getDaysUntilExpiration(
        product.fechaVencimiento
    );

    const expiration = getExpirationStatus(days);

    return (
        <>
            <tr
                className={`
                    group
                    border-t border-gray-100
                    transition-colors
                    ${
                        expanded
                            ? "bg-gray-50/70"
                            : "hover:bg-gray-50/50"
                    }
                `}
            >
                <td className="px-4 py-4 sm:px-6 sm:py-5">
                    <div className="flex items-center gap-3 min-w-0">
                        <div
                            className="
                                flex h-9 w-9 sm:h-10 sm:w-10
                                shrink-0
                                items-center justify-center
                                rounded-xl
                                bg-indigo-50
                                text-indigo-600
                            "
                        >
                            <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>

                        <div className="min-w-0">
                            <p className="font-semibold text-sm sm:text-base text-gray-900 truncate max-w-[180px] sm:max-w-xs">
                                {product.nombre}
                            </p>

                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-xs text-gray-400">
                                    {product.unidades.length}
                                </span>

                                <span className="text-xs text-gray-400">
                                    {product.unidades.length === 1
                                        ? "presentación"
                                        : "presentaciones"}
                                </span>
                            </div>
                        </div>
                    </div>
                </td>
                <td className="hidden sm:table-cell px-4 py-4 sm:px-6 sm:py-5">
                    <span
                        className="
                            inline-flex
                            max-w-[120px]
                            truncate
                            items-center
                            rounded-lg
                            bg-gray-100
                            px-2.5
                            py-1.5
                            text-xs
                            font-medium
                            text-gray-600
                        "
                    >
                        {product.categoria ?? "Sin categoría"}
                    </span>
                </td>
                <td className="px-4 py-4 sm:px-6 sm:py-5">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="flex flex-wrap gap-1.5 min-w-0">
                            {product.unidades
                                .slice(0, 2)
                                .map((unidad) => (
                                    <span
                                        key={unidad.id}
                                        className="
                                            inline-flex
                                            max-w-[130px]
                                            sm:max-w-none
                                            items-center
                                            gap-1.5
                                            rounded-lg
                                            border
                                            border-gray-200
                                            bg-white
                                            px-2
                                            sm:px-2.5
                                            py-1.5
                                            text-[11px]
                                            sm:text-xs
                                            shadow-sm
                                        "
                                    >
                                        <span className="truncate font-medium text-gray-700">
                                            {unidad.unidad}
                                        </span>

                                        <span className="h-1 w-1 shrink-0 rounded-full bg-gray-300" />

                                        <span className="font-bold text-indigo-600">
                                            {unidad.stock}
                                        </span>
                                    </span>
                                ))}

                            {product.unidades.length > 2 && (
                                <span
                                    className="
                                        inline-flex
                                        shrink-0
                                        items-center
                                        rounded-lg
                                        bg-gray-100
                                        px-2.5
                                        py-1.5
                                        text-[11px]
                                        font-semibold
                                        text-gray-500
                                    "
                                >
                                    +{product.unidades.length - 2}
                                </span>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() =>
                                setExpanded((value) => !value)
                            }
                            className="
                                flex h-8 w-8
                                shrink-0
                                items-center justify-center
                                rounded-lg
                                border border-gray-200
                                bg-white
                                text-gray-400
                                shadow-sm
                                transition
                                hover:border-gray-300
                                hover:bg-gray-50
                                hover:text-gray-700
                                focus:outline-none
                                focus:ring-2
                                focus:ring-indigo-100
                            "
                            aria-expanded={expanded}
                            aria-label={
                                expanded
                                    ? "Ocultar presentaciones"
                                    : "Mostrar presentaciones"
                            }
                        >
                            {expanded ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </td>
                <td className="hidden sm:table-cell px-4 py-4 sm:px-6 sm:py-5">
                    <div className="flex items-center justify-end gap-2 sm:gap-3">
                        <div className="text-right">
                            <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                                <span
                                    className={`
                                        h-1.5 w-1.5 sm:h-2 sm:w-2
                                        rounded-full
                                        ${expiration.dot}
                                    `}
                                />

                                <span
                                    className={`
                                        inline-flex
                                        whitespace-nowrap
                                        rounded-lg
                                        border
                                        px-2
                                        sm:px-2.5
                                        py-1
                                        text-[10px]
                                        sm:text-xs
                                        font-bold
                                        ${expiration.className}
                                    `}
                                >
                                    {expiration.label}
                                </span>
                            </div>

                            <p className="mt-1 text-[10px] sm:text-xs text-gray-400">
                                {formatDate(
                                    product.fechaVencimiento
                                )}
                            </p>
                        </div>

                        <CalendarClock
                            className="
                                hidden
                                sm:block
                                h-4 w-4
                                shrink-0
                                text-gray-300
                            "
                        />
                    </div>
                </td>
            </tr>
            <ProductUnitsDetail
                expanded={expanded}
                unidades={product.unidades}
                getDaysUntilExpiration={getDaysUntilExpiration}
                getExpirationStatus={getExpirationStatus}
                formatDate={formatDate}
            />
        </>
    );
}