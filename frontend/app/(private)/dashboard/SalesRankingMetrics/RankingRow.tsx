interface Props{
    position:number;
    name:string;
    description:string;
    value:string;
}
export default function RankingRow({
    position,
    name,
    description,
    value
}:Props){
    const positionStyle = {
        1:
        "bg-yellow-50 text-yellow-600 border-yellow-100",
        2:
        "bg-gray-50 text-gray-600 border-gray-200",
        3:
        "bg-orange-50 text-orange-600 border-orange-100",
    }[position]
    ??
    "bg-blue-50 text-blue-600 border-blue-100";

    return (
        <div
            className="
                flex
                items-center
                justify-between
                rounded-2xl
                bg-white
                border
                border-gray-100
                p-4
                shadow-sm
                hover:border-gray-200
                transition
            "
        >
            <div className="flex items-center gap-3">
                <div
                    className={`
                        w-9
                        h-9
                        rounded-xl
                        border
                        flex
                        items-center
                        justify-center
                        font-bold
                        text-sm
                        ${positionStyle}
                    `}
                >
                    {position}
                </div>
                <div>
                    <p
                        className="
                            text-sm
                            font-semibold
                            text-gray-800
                        "
                    >
                        {name}
                    </p>
                    <p
                        className="
                            text-[11px]
                            text-gray-400
                        "
                    >
                        {description}
                    </p>
                </div>
            </div>
            <span
                className="
                    text-sm
                    font-bold
                    font-mono
                    text-gray-900
                "
            >
                {value}
            </span>
        </div>
    );
}