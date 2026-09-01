interface BranchStatsProps {
    branchStats: {
        total: number;
        active: number;
        inactive: number;
    };
}

export default function BranchStats({ branchStats }: BranchStatsProps) {
    const { total, active, inactive } = branchStats;
    return (
        <div
            className="
                grid
                grid-cols-1
                gap-4
                mb-8
                md:grid-cols-3
            "
        >
            <div
                className="
                    rounded-2xl
                    border
                    border-gray-100
                    bg-white
                    p-5
                    shadow-sm
                "
            >
                <p
                    className="
                        text-xs
                        font-semibold
                        text-gray-500
                    "
                >
                    Total de sucursales
                </p>

                <h2
                    className="
                        mt-2
                        text-3xl
                        font-bold
                        text-gray-900
                    "
                >
                    {total}
                </h2>
            </div>

            <div
                className="
                    rounded-2xl
                    border
                    border-emerald-100
                    bg-emerald-50
                    p-5
                "
            >
                <p
                    className="
                        text-xs
                        font-semibold
                        text-emerald-700
                    "
                >
                    Activas
                </p>

                <h2
                    className="
                        mt-2
                        text-3xl
                        font-bold
                        text-emerald-700
                    "
                >
                    {active}
                </h2>
            </div>

            <div
                className="
                    rounded-2xl
                    border
                    border-rose-100
                    bg-rose-50
                    p-5
                "
            >
                <p
                    className="
                        text-xs
                        font-semibold
                        text-rose-700
                    "
                >
                    Inactivas
                </p>

                <h2
                    className="
                        mt-2
                        text-3xl
                        font-bold
                        text-rose-700
                    "
                >
                    {inactive}
                </h2>
            </div>
        </div>
    );
}