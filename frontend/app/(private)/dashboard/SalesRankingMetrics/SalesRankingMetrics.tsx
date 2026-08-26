"use client";

import { useState } from "react";
import {
    useSalesRankingMetrics
} from "../hooks/useSalesRankingMetrics";
import RankingPanel from "./RankingPanel";
import RankingRow from "./RankingRow";
import RankingSkeleton from "./RankingSkeleton";
import RankingError from "./RankingError";
import { RankingIcon } from "./Icons/RankingIcon";

export default function SalesRankingMetrics() {
    const { topProductos, topCategorias, loading, errors } = useSalesRankingMetrics();
    const [expandedProduct, setExpandedProduct] = useState<number | null>(null);

    if (loading) {
        return <RankingSkeleton />;
    }

    if (errors.length > 0) {
        return (
            <RankingError
                message={errors[0]}
            />
        );
    }

    return (
        <section
            className="
                w-full
                rounded-3xl
                border
                border-gray-200/80
                bg-white
                p-6
                md:p-8
                shadow-sm
                hover:shadow-md
                transition-all
                duration-300
                relative
                overflow-hidden
            "
        >
            <div
                className="
                    absolute
                    -top-32
                    -right-32
                    w-64
                    h-64
                    bg-blue-50
                    rounded-full
                    blur-3xl
                "
            />
            <header
                className="
                    flex
                    justify-between
                    mb-8
                    relative
                    z-10
                "
            >
                <div>
                    <h2
                        className="
                            flex
                            items-center
                            gap-2
                            text-xl
                            font-bold
                            text-gray-900
                        "
                    >
                        <RankingIcon
                            className="
                                w-5
                                h-5
                                text-gray-500
                            "
                        />
                        Ranking de Ventas
                    </h2>
                    <p
                        className="
                            text-xs
                            text-gray-500
                            mt-1
                        "
                    >
                        Productos y categorías con mayor rendimiento comercial.
                    </p>
                </div>
            </header>
            <div
                className="
                    grid
                    grid-cols-1
                    xl:grid-cols-2
                    gap-5
                    relative
                    z-10
                "
            >
                <RankingPanel
                    title="Productos más vendidos"
                    subtitle="Ranking por unidades"
                >
                    {topProductos.map((producto) => {
                        const isExpanded =
                            expandedProduct === producto.posicion;
                        const hasUnits =
                            producto.unidades.length > 0;
                        const maxUnits = hasUnits
                            ? Math.max(
                                ...producto.unidades.map(
                                    (unidad) => unidad.unidadesVendidas
                                )
                            )
                            : 0;
                        return (
                            <div
                                key={producto.posicion}
                                className="
                                    border-b
                                    border-gray-100
                                    last:border-b-0
                                "
                            >
                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-1
                                    "
                                >
                                    <div className="min-w-0 flex-1">
                                        <RankingRow
                                            position={producto.posicion}
                                            name={producto.producto}
                                            description={
                                                `${producto.unidadesVendidas} ${
                                                    producto.unidadesVendidas === 1
                                                        ? "unidad vendida"
                                                        : "unidades vendidas"
                                                }`
                                            }
                                            value={
                                                `C$${producto.ingresos.toFixed(2)}`
                                            }
                                        />
                                    </div>
                                    {hasUnits && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setExpandedProduct(
                                                    isExpanded
                                                        ? null
                                                        : producto.posicion
                                                )
                                            }
                                            aria-expanded={isExpanded}
                                            aria-label={
                                                isExpanded
                                                    ? `Ocultar unidades de ${producto.producto}`
                                                    : `Mostrar unidades de ${producto.producto}`
                                            }
                                            title={
                                                isExpanded
                                                    ? "Ocultar unidades"
                                                    : "Mostrar unidades"
                                            }
                                            className={`
                                                flex
                                                shrink-0
                                                items-center
                                                justify-center
                                                w-8
                                                h-8
                                                mr-1
                                                rounded-full
                                                transition-all
                                                duration-200
                                                focus:outline-none
                                                focus:ring-2
                                                focus:ring-blue-100
                                                ${
                                                    isExpanded
                                                        ? `
                                                            bg-blue-50
                                                            text-blue-600
                                                        `
                                                        : `
                                                            text-gray-400
                                                            hover:bg-gray-50
                                                            hover:text-blue-600
                                                        `
                                                }
                                            `}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className={`
                                                    w-4
                                                    h-4

                                                    transition-transform
                                                    duration-200

                                                    ${
                                                        isExpanded
                                                            ? "rotate-90"
                                                            : "rotate-0"
                                                    }
                                                `}
                                            >
                                                <polyline points="9 18 15 12 9 6" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                                {isExpanded && hasUnits && (
                                    <div
                                        className="
                                            mx-3
                                            mb-4
                                            mt-1
                                            rounded-2xl
                                            border
                                            border-blue-100
                                            bg-gradient-to-br
                                            from-blue-50/60
                                            via-white
                                            to-white
                                            overflow-hidden
                                            shadow-sm
                                        "
                                    >
                                        <div
                                            className="
                                                flex
                                                items-center
                                                justify-between

                                                px-4
                                                py-3

                                                border-b
                                                border-blue-100/70
                                            "
                                        >
                                            <div>
                                                <p
                                                    className="
                                                        text-[10px]
                                                        font-bold
                                                        uppercase
                                                        tracking-wider
                                                        text-blue-500
                                                    "
                                                >
                                                    Unidades vendidas
                                                </p>

                                                <p
                                                    className="
                                                        mt-0.5
                                                        text-[11px]
                                                        text-gray-500
                                                    "
                                                >
                                                    Presentaciones que contribuyeron
                                                </p>
                                            </div>
                                            <span
                                                className="
                                                    rounded-full
                                                    bg-blue-100
                                                    px-2.5
                                                    py-1

                                                    text-[10px]
                                                    font-semibold
                                                    text-blue-600
                                                "
                                            >
                                                {producto.unidades.length}{" "}
                                                {producto.unidades.length === 1
                                                    ? "presentación"
                                                    : "presentaciones"}
                                            </span>
                                        </div>
                                        <div className="p-3 space-y-2">
                                            {producto.unidades.map(
                                                (unidad, unitIndex) => {
                                                    const percentage =
                                                        maxUnits > 0
                                                            ? (
                                                                unidad.unidadesVendidas /
                                                                maxUnits
                                                            ) * 100
                                                            : 0;
                                                    const isTopUnit =
                                                        unitIndex === 0;
                                                    return (
                                                        <div
                                                            key={
                                                                unidad.productUnitId
                                                            }
                                                            className="
                                                                rounded-xl
                                                                bg-white
                                                                border
                                                                border-gray-100
                                                                px-3
                                                                py-2.5
                                                                hover:border-blue-100
                                                                hover:shadow-sm
                                                                transition-all
                                                                duration-200
                                                            "
                                                        >
                                                            <div
                                                                className="
                                                                    flex
                                                                    items-center
                                                                    justify-between
                                                                    gap-3
                                                                "
                                                            >
                                                                <div
                                                                    className="
                                                                        flex
                                                                        items-center
                                                                        gap-2.5
                                                                        min-w-0
                                                                    "
                                                                >
                                                                    <span
                                                                        className={`
                                                                            flex
                                                                            shrink-0
                                                                            items-center
                                                                            justify-center
                                                                            w-6
                                                                            h-6
                                                                            rounded-full
                                                                            text-[10px]
                                                                            font-bold
                                                                            ${
                                                                                isTopUnit
                                                                                    ? `
                                                                                        bg-blue-100
                                                                                        text-blue-600
                                                                                    `
                                                                                    : `
                                                                                        bg-gray-100
                                                                                        text-gray-500
                                                                                    `
                                                                            }
                                                                        `}
                                                                    >
                                                                        {unitIndex + 1}
                                                                    </span>

                                                                    <div
                                                                        className="
                                                                            min-w-0
                                                                        "
                                                                    >
                                                                        <p
                                                                            className="
                                                                                truncate
                                                                                text-xs
                                                                                font-semibold
                                                                                text-gray-700
                                                                            "
                                                                        >
                                                                            {unidad.unit}
                                                                        </p>
                                                                        {isTopUnit && (
                                                                            <p
                                                                                className="
                                                                                    text-[9px]
                                                                                    font-medium
                                                                                    text-blue-500
                                                                                "
                                                                            >
                                                                                Mayor cantidad
                                                                                vendida
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <span
                                                                    className={`
                                                                        shrink-0

                                                                        rounded-full

                                                                        px-2
                                                                        py-1

                                                                        text-[10px]
                                                                        font-semibold

                                                                        ${
                                                                            isTopUnit
                                                                                ? `
                                                                                    bg-blue-50
                                                                                    text-blue-600
                                                                                `
                                                                                : `
                                                                                    bg-gray-50
                                                                                    text-gray-600
                                                                                `
                                                                        }
                                                                    `}
                                                                >
                                                                    {
                                                                        unidad.unidadesVendidas
                                                                    }{" "}
                                                                    {
                                                                        unidad.unidadesVendidas === 1
                                                                            ? "unidad"
                                                                            : "unidades"
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div
                                                                className="
                                                                    mt-2

                                                                    h-1.5
                                                                    w-full

                                                                    overflow-hidden
                                                                    rounded-full

                                                                    bg-gray-100
                                                                "
                                                            >
                                                                <div
                                                                    className={`
                                                                        h-full
                                                                        rounded-full

                                                                        transition-all
                                                                        duration-500

                                                                        ${
                                                                            isTopUnit
                                                                                ? "bg-blue-500"
                                                                                : "bg-blue-300"
                                                                        }
                                                                    `}
                                                                    style={{
                                                                        width: `${percentage}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </RankingPanel>
                <RankingPanel
                    title="Categorías líderes"
                    subtitle="Ranking por ingresos"
                >
                    {topCategorias.map((categoria) => (
                        <RankingRow
                            key={categoria.posicion}
                            position={categoria.posicion}
                            name={categoria.categoria}
                            description="Ingresos generados"
                            value={
                                `C$${categoria.ventas.toFixed(2)}`
                            }
                        />
                    ))}
                </RankingPanel>
            </div>
        </section>
    );
}