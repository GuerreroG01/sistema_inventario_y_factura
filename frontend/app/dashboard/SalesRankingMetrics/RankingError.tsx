interface Props{
    message:string;
}
export default function RankingError({
    message
}:Props){
    return (
        <div
            className="
                rounded-2xl
                border
                border-red-200
                bg-red-50/60
                p-6
                flex
                gap-4
                items-center
            "
        >
            <div
                className="
                    w-10
                    h-10
                    rounded-xl
                    bg-red-100
                    flex
                    items-center
                    justify-center
                    text-red-600
                    font-bold
                "
            >
                !
            </div>
            <div>
                <p className="font-semibold text-gray-900">
                    Error en Ranking de Ventas
                </p>
                <p className="text-xs text-red-600 mt-1">
                    {message}
                </p>
            </div>
        </div>
    );
}