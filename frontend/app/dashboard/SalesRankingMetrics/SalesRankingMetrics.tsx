"use client";

import {
    useSalesRankingMetrics
} from "../hooks/useSalesRankingMetrics";
import RankingPanel from "./RankingPanel";
import RankingRow from "./RankingRow";
import RankingSkeleton from "./RankingSkeleton";
import RankingError from "./RankingError";
import { RankingIcon } from "./Icons/RankingIcon";

export default function SalesRankingMetrics(){
    const {
        topProductos,
        topCategorias,
        loading,
        errors
    } = useSalesRankingMetrics();

    if(loading){
        return <RankingSkeleton />;
    }

    if(errors.length > 0){
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
                    {
                        topProductos.map(producto=>(

                            <RankingRow
                                key={producto.posicion}
                                position={producto.posicion}
                                name={producto.producto}
                                description={
                                    `${producto.unidadesVendidas} unidades vendidas`
                                }
                                value={
                                    `C$${producto.ingresos.toFixed(2)}`
                                }
                            />
                        ))
                    }
                </RankingPanel>
                <RankingPanel
                    title="Categorías líderes"
                    subtitle="Ranking por ingresos"
                >
                    {
                        topCategorias.map(categoria=>(

                            <RankingRow
                                key={categoria.posicion}
                                position={categoria.posicion}
                                name={categoria.categoria}
                                description="Ingresos generados"
                                value={
                                    `C$${categoria.ventas.toFixed(2)}`
                                }
                            />

                        ))
                    }
                </RankingPanel>
            </div>
        </section>
    );
}