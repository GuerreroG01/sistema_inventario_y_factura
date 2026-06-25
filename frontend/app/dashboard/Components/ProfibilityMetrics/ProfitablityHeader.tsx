import { ChartBarIcon } from "./Icons/ChartBarIcon";


interface Props {
    margin:number;
}


export default function ProfitabilityHeader({
    margin
}:Props){

    return (
        <div className="
            flex flex-col md:flex-row
            justify-between
            gap-4 mb-8
        ">

            <div>

                <h2 className="
                    text-xl font-bold text-gray-900
                    flex items-center gap-2.5
                ">
                    <ChartBarIcon className="w-5 h-5 text-gray-500"/>
                    Análisis de Rentabilidad
                </h2>


                <p className="
                    text-xs font-medium
                    text-gray-500 mt-1
                ">
                    Rendimiento financiero comparado contra periodos anteriores.
                </p>

            </div>


            <div className="
                inline-flex items-center gap-2
                rounded-full
                bg-purple-50
                px-4 py-2
                text-xs font-semibold
                text-purple-700
            ">

                <span className="
                    relative flex h-2 w-2
                ">
                    <span className="
                        animate-ping
                        absolute
                        w-full h-full
                        rounded-full
                        bg-purple-400
                    "/>

                    <span className="
                        relative
                        inline-flex
                        rounded-full
                        h-2 w-2
                        bg-purple-600
                    "/>
                </span>


                Margen Neto:
                <span className="font-mono">
                    {margin.toFixed(2)}%
                </span>

            </div>

        </div>
    );
}