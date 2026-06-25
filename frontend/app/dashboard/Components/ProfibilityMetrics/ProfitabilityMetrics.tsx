"use client";

import { useProfitability } from "../../hooks/useProfitability";
import ProfitabilitySkeleton from "./ProfitabilitySkeleton";
import ProfitabilityError from "./ProfitabilityError";
import ProfitabilityHeader from "./ProfitablityHeader";
import ProfitabilityBar from "./ProfitabilityBar";
import MetricsGrid from "./MetricsGrid";

export default function ProfitabilityMetrics() {

    const { data, loading, error } = useProfitability();


    if (loading) {
        return <ProfitabilitySkeleton />;
    }


    if (error) {
        return <ProfitabilityError message={error} />;
    }


    if (!data?.current) {
        return null;
    }


    const metric = data.current;
    const trend = data.trend;


    return (
        <section className="
            relative overflow-hidden
            w-full rounded-3xl
            border border-gray-200/80
            bg-white
            p-6 md:p-8
            shadow-sm
            transition-all
            hover:shadow-md
        ">

            <div className="
                absolute -top-32 -left-32
                w-64 h-64
                bg-purple-50
                rounded-full
                blur-3xl
            "/>


            <div className="
                absolute -bottom-32 -right-32
                w-64 h-64
                bg-indigo-50
                rounded-full
                blur-3xl
            "/>


            <ProfitabilityHeader 
                margin={metric.margen}
            />


            <ProfitabilityBar
                sales={metric.ventas}
                costs={metric.costos}
                profit={metric.ganancia}
            />


            <MetricsGrid
                metric={metric}
                trend={trend}
            />


        </section>
    );
}