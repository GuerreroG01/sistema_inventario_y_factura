"use client";

import { Sale } from "@/types/Sale";

type Props = {
    sales: Sale[];
    selected: Sale | null;
    setSelected: (id: number) => void;

    page: number;
    totalPages: number;
    setPage: (page: number) => void;

    startDate: string;
    setStartDate: (value: string) => void;

    endDate: string;
    setEndDate: (value: string) => void;

    statusStyle: (status: string) => string;
};


export default function SalesLeftPanel({
    sales,
    selected,
    setSelected,
    page,
    totalPages,
    setPage,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    statusStyle,
}: Props) {

    return (
        <div
            className="
                lg:col-span-1
                bg-white/70
                backdrop-blur-xl
                border border-white/50
                rounded-3xl
                shadow-xl
                flex flex-col
                h-full
                overflow-hidden
            "
        >

            {/* HEADER */}

            <div
                className="
                    p-5
                    border-b border-slate-200/60
                    bg-gradient-to-b
                    from-white/70
                    to-white/30
                    space-y-4
                "
            >

                <div className="flex justify-between items-center">

                    <div>
                        <h1
                            className="
                                text-lg
                                font-bold
                                text-slate-900
                                tracking-tight
                            "
                        >
                            Ventas
                        </h1>

                        <p
                            className="
                                text-xs
                                text-slate-500
                                mt-1
                            "
                        >
                            Mostrando {sales.length} registros
                        </p>
                    </div>


                    <div
                        className="
                            px-3
                            py-1
                            rounded-full
                            bg-indigo-50
                            text-indigo-600
                            text-xs
                            font-semibold
                        "
                    >
                        {page}/{totalPages}
                    </div>

                </div>


                {/* FILTROS */}

                <div
                    className="
                        grid grid-cols-2
                        gap-3
                        bg-slate-100/60
                        p-3
                        rounded-2xl
                        border border-slate-200/60
                    "
                >

                    <div>
                        <label
                            className="
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-wider
                                text-slate-400
                            "
                        >
                            Desde
                        </label>

                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="
                                mt-1
                                w-full
                                rounded-xl
                                bg-white
                                border border-slate-200
                                px-3
                                py-2
                                text-xs
                                font-medium
                                text-slate-700
                                outline-none
                                focus:ring-2
                                focus:ring-indigo-500/20
                            "
                        />
                    </div>


                    <div>
                        <label
                            className="
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-wider
                                text-slate-400
                            "
                        >
                            Hasta
                        </label>

                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="
                                mt-1
                                w-full
                                rounded-xl
                                bg-white
                                border border-slate-200
                                px-3
                                py-2
                                text-xs
                                font-medium
                                text-slate-700
                                outline-none
                                focus:ring-2
                                focus:ring-indigo-500/20
                            "
                        />
                    </div>

                </div>

            </div>



            {/* LISTADO */}

            <div
                className="
                    flex-1
                    overflow-y-auto
                    p-3
                    space-y-2
                    custom-scrollbar
                "
            >

                {sales.length === 0 ? (

                    <div
                        className="
                            h-full
                            flex
                            items-center
                            justify-center
                            text-center
                        "
                    >
                        <div>

                            <div
                                className="
                                    mx-auto
                                    w-12
                                    h-12
                                    rounded-full
                                    bg-slate-100
                                    flex
                                    items-center
                                    justify-center
                                    text-slate-400
                                "
                            >
                                📄
                            </div>


                            <p
                                className="
                                    mt-3
                                    text-xs
                                    text-slate-400
                                "
                            >
                                No hay ventas disponibles
                            </p>

                        </div>

                    </div>

                ) : (

                    sales.map((sale) => {

                        const active = selected?.id === sale.id;


                        return (
                            <div
                                key={sale.id}
                                onClick={() => setSelected(sale.id)}
                                className={`
                                    group
                                    cursor-pointer
                                    rounded-2xl
                                    border
                                    transition-all
                                    duration-200
                                    p-4
                                    ${
                                        active
                                            ? "bg-white border-indigo-200 shadow-lg shadow-indigo-100/50"
                                            : "bg-white/40 border-transparent hover:bg-white hover:border-slate-200"
                                    }
                                `}
                            >

                                <div
                                    className="
                                        flex
                                        justify-between
                                        items-start
                                    "
                                >

                                    <div>

                                        <div
                                            className="
                                                flex
                                                items-center
                                                gap-2
                                            "
                                        >

                                            <h3
                                                className="
                                                    font-bold
                                                    text-sm
                                                    text-slate-900
                                                "
                                            >
                                                Venta #{sale.id}
                                            </h3>


                                            {active && (
                                                <span
                                                    className="
                                                        w-2
                                                        h-2
                                                        rounded-full
                                                        bg-indigo-500
                                                        animate-pulse
                                                    "
                                                />
                                            )}

                                        </div>


                                        <p
                                            className="
                                                text-[11px]
                                                text-slate-400
                                                mt-1
                                            "
                                        >
                                            {sale.fecha}
                                        </p>

                                    </div>



                                    <span
                                        className={`
                                            text-[10px]
                                            px-3
                                            py-1
                                            rounded-full
                                            font-bold
                                            border
                                            ${statusStyle(sale.status)}
                                        `}
                                    >
                                        {sale.status}
                                    </span>

                                </div>



                                <div
                                    className="
                                        mt-4
                                        flex
                                        justify-between
                                        items-end
                                    "
                                >

                                    <p
                                        className="
                                            text-[10px]
                                            uppercase
                                            tracking-wider
                                            font-bold
                                            text-slate-400
                                        "
                                    >
                                        Total
                                    </p>


                                    <p
                                        className={`
                                            font-bold
                                            transition
                                            ${
                                                active
                                                    ? "text-indigo-600 text-lg"
                                                    : "text-slate-800 text-base"
                                            }
                                        `}
                                    >
                                        $
                                        {Number(sale.total).toLocaleString(
                                            "en-US",
                                            {
                                                minimumFractionDigits: 2,
                                            }
                                        )}
                                    </p>

                                </div>

                            </div>
                        );
                    })

                )}

            </div>




            {/* PAGINACIÓN */}

            <div
                className="
                    border-t
                    border-slate-200/70
                    bg-white/60
                    p-3
                    flex
                    items-center
                    justify-between
                "
            >

                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="
                        px-4
                        py-2
                        rounded-xl
                        text-xs
                        font-semibold
                        bg-white
                        border border-slate-200
                        text-slate-600
                        hover:bg-slate-50
                        disabled:opacity-40
                        transition
                    "
                >
                    Anterior
                </button>


                <span
                    className="
                        text-xs
                        font-medium
                        text-slate-500
                    "
                >
                    Página {page} de {totalPages}
                </span>


                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="
                        px-4
                        py-2
                        rounded-xl
                        text-xs
                        font-semibold
                        bg-indigo-600
                        text-white
                        hover:bg-indigo-700
                        disabled:opacity-40
                        transition
                        shadow-sm
                    "
                >
                    Siguiente
                </button>

            </div>

        </div>
    );
}