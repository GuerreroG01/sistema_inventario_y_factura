interface Props{
    title:string;
    subtitle:string;
    children:React.ReactNode;
}

export default function RankingPanel({
    title,
    subtitle,
    children
}:Props){
    return (
        <div
            className="
                rounded-2xl
                border
                border-gray-100
                bg-gray-50/40
                p-5
            "
        >
            <div className="mb-5">
                <p
                    className="
                        text-sm
                        font-semibold
                        text-gray-800
                    "
                >
                    {title}
                </p>
                <p
                    className="
                        text-[11px]
                        text-gray-400
                    "
                >
                    {subtitle}
                </p>
            </div>
            <div className="space-y-3">
                {children}
            </div>
        </div>
    );
}