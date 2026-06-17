"use client";

import { Sale } from "@/types/Sale";

type Props = {
    selected: Sale | null;
    statusStyle: (status: string) => string;
};

export default function SalesRightPanel({
    selected,
    statusStyle,
}: Props) {
    console.log("Datos de la venta seleccionada: ", selected);

    return (
        <div className="lg:col-span-2 bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl shadow-lg h-full overflow-hidden flex flex-col">
            {selected ? (
                (() => {
                    const details = selected.details ?? [];

                    return (
                        <div className="p-6 md:p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">

                            {/* HEADER */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
                                <div>
                                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-200/30">
                                        Detalles de la venta
                                    </span>

                                    <h2 className="text-2xl font-extrabold text-slate-800 mt-3 tracking-tight">
                                        Venta #{selected.id}
                                    </h2>

                                    <p className="text-xs text-slate-500 mt-1">
                                        Revisión y desglose oficial de la transacción en el sistema.
                                    </p>
                                </div>

                                <span
                                    className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusStyle(
                                        selected.status
                                    )}`}
                                >
                                    {selected.status}
                                </span>
                            </div>

                            {/* CARDS */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                <div className="bg-white/70 border border-slate-200/60 rounded-xl p-5 shadow-sm hover:shadow-md transition">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        Monto Total
                                    </p>
                                    <p className="text-3xl font-black text-slate-800 mt-2">
                                        ${Number(selected.total).toLocaleString("en-US", {
                                            minimumFractionDigits: 2,
                                        })}
                                    </p>
                                </div>

                                <div className="bg-white/70 border border-slate-200/60 rounded-xl p-5 shadow-sm hover:shadow-md transition">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        Fecha de Emisión
                                    </p>
                                    <p className="text-sm font-semibold text-slate-700 mt-3">
                                        {selected.fecha}
                                    </p>
                                </div>

                                <div className="bg-white/70 border border-slate-200/60 rounded-xl p-5 shadow-sm hover:shadow-md transition">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        Categoría
                                    </p>
                                    <p className="text-sm font-semibold text-slate-700 mt-3">
                                        {selected.category || "Sin categoría"}
                                    </p>
                                </div>

                                <div className="bg-white/70 border border-slate-200/60 rounded-xl p-5 shadow-sm hover:shadow-md transition">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        Última Actualización
                                    </p>
                                    <p className="text-sm font-semibold text-slate-700 mt-3">
                                        {selected.updatedAt
                                            ? new Date(selected.updatedAt).toLocaleString("es-NI")
                                            : "Sin fecha"}
                                    </p>
                                </div>
                            </div>

                            {/* 🔥 DETAILS */}
                            {details.length > 0 && (
                                <div className="border-t border-slate-200 pt-6">
                                    <h3 className="text-sm font-bold text-slate-700 mb-4">
                                        Detalle de productos
                                    </h3>

                                    <div className="space-y-3">
                                        {details.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between bg-white/60 border border-slate-200/50 rounded-lg p-3"
                                            >
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {item.descripcion}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        Cantidad: {item.cantidad} • Tipo: {item.tipo_item}
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-slate-800">
                                                        ${Number(item.subtotal).toFixed(2)}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        ${Number(item.precio_unitario).toFixed(2)} c/u
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* FOOTER */}
                            <div className="border-t border-dashed border-slate-200 pt-6">
                                <div className="bg-white/40 border border-slate-200/40 rounded-xl p-4 flex items-center justify-between text-[11px] text-slate-500 shadow-inner">
                                    <p>
                                        ID Transacción:{" "}
                                        <span className="font-mono text-slate-600 font-medium">
                                            tx_{selected.id}99283f
                                        </span>
                                    </p>

                                    <p className="hidden sm:block font-medium text-emerald-600 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                        Soporte activo
                                    </p>
                                </div>
                            </div>

                        </div>
                    );
                })()
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white/10">
                    <h3 className="text-sm font-bold text-slate-800">
                        No hay selección
                    </h3>
                </div>
            )}
        </div>
    );
}