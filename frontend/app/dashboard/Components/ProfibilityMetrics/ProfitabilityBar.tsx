interface Props {
    sales:number;
    costs:number;
    profit:number;
}


export default function ProfitabilityBar({
    sales,
    costs,
    profit
}:Props){


    const profitPercent =
        sales > 0
        ? profit / sales * 100
        : 0;


    const costPercent =
        sales > 0
        ? costs / sales * 100
        : 0;


    return (

        <div className="
            mb-8 p-1
            rounded-2xl
            bg-gray-50
            border border-gray-100
        ">

            <div className="
                h-9
                flex
                rounded-xl
                overflow-hidden
            ">


                <div
                    style={{
                        width:`${profitPercent}%`
                    }}
                    className="
                    bg-gradient-to-r
                    from-emerald-500
                    to-teal-600
                    relative
                    "
                >
                    <span className="
                        absolute inset-0
                        flex items-center
                        px-4
                        text-[10px]
                        font-bold
                        text-white
                    ">
                        Utilidad {profitPercent.toFixed(0)}%
                    </span>

                </div>


                <div
                    style={{
                        width:`${costPercent}%`
                    }}
                    className="
                    bg-gradient-to-r
                    from-rose-500
                    to-amber-500
                    relative
                    "
                >
                    <span className="
                        absolute inset-0
                        flex items-center
                        justify-end
                        px-4
                        text-[10px]
                        font-bold
                        text-white
                    ">
                        Costos {costPercent.toFixed(0)}%
                    </span>

                </div>

            </div>

        </div>
    );
}