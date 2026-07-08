interface Props {
    message:string;
}


export default function ProfitabilityError({
    message
}:Props){


    return (

        <div className="
            rounded-2xl
            border
            border-red-200
            bg-red-50/60
            p-6
            text-sm
            text-red-700
            flex
            items-center
            gap-4
            shadow-sm
        ">


            <div className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-red-100
                border
                border-red-200
                text-red-600
                font-bold
                text-lg
            ">
                !
            </div>




            <div>

                <p className="
                    font-semibold
                    text-gray-900
                    text-base
                ">
                    Error en el Sistema Analítico
                </p>



                <p className="
                    text-xs
                    text-red-600
                    mt-1
                ">
                    {message}
                </p>


            </div>


        </div>

    );
}