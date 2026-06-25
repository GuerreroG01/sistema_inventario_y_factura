import MetricCard from "./MetricCard";


export default function MetricsGrid({
    metric,
    trend
}:any){


    const formatCurrency = (value:number)=>
        `C$${value.toLocaleString("en-US",{
            minimumFractionDigits:2,
            maximumFractionDigits:2
        })}`;


    return (

        <div className="
            grid grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-4
        ">


            <MetricCard
                type="sales"
                label="Ventas Brutas"
                subLabel="Ingresos generados"
                value={formatCurrency(metric.ventas)}
                change={trend.ventas}
            />


            <MetricCard
                type="costs"
                label="Costos Totales"
                subLabel="Egresos operativos"
                value={formatCurrency(metric.costos)}
                change={trend.costos}
            />


            <MetricCard
                type="profit"
                label="Ganancia Operativa"
                subLabel="Utilidad generada"
                value={formatCurrency(metric.ganancia)}
                change={trend.ganancia}
            />


            <MetricCard
                type="margin"
                label="Margen Neto"
                subLabel="Rentabilidad sobre ventas"
                value={`${metric.margen.toFixed(2)}%`}
                change={trend.margen}
            />

            <MetricCard
                type="ratio"
                    label="Retorno / Costo"
                    subLabel="Eficiencia del gasto"
                    value={`x${metric.ratioRetornoCosto.toFixed(2)}`}
                    change={trend.ratioRetornoCosto}
            />

            <MetricCard
                type="roi"
                    label="ROI"
                    subLabel="Retorno inversión"
                    value={`${metric.roi.toFixed(2)}%`}
                    change={trend.roi}
            />
            
        </div>
    );
}