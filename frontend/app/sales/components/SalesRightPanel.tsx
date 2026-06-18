"use client";

import { Sale } from "@/types/Sale";
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';

type Props = {
    selected: Sale | null;
    statusStyle: (status: string) => string;
    handleStatusChange: (status: string) => Promise<void>;
    statusOptions: {
        value: string;
        label: string;
        description: string;
    }[];
};

export default function SalesRightPanel({
    selected, statusStyle, handleStatusChange, statusOptions
}: Props) {

    return (
        <div className="lg:col-span-2 bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl shadow-lg h-full overflow-hidden flex flex-col">
            {selected ? (
                (() => {
                    const details = selected.details ?? [];

                    return (
                        <div className="p-6 md:p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">

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

                                <div className="relative inline-block text-left">
                                    <Listbox value={selected.status} onChange={handleStatusChange}>
                                        <ListboxButton
                                            className={`inline-flex items-center justify-between gap-x-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-all duration-200 ease-in-out hover:bg-opacity-90 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#00A7E1] focus:ring-offset-1 ${statusStyle(

                                                selected.status

                                            )}`}
                                        >
                                            <span className="tracking-wide">
                                                {statusOptions.find((opt) => opt.value === selected.status)?.label || selected.status}
                                            </span>
                                            <svg className="w-3 h-3 opacity-70 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </ListboxButton>
                                        <ListboxOptions className="absolute right-0 mt-2 w-44 origin-top-right rounded-xl border border-white/60 bg-white/95 backdrop-blur-md p-1.5 shadow-xl ring-1 ring-black/5 z-50 focus:outline-none animate-in fade-in slide-in-from-top-2 duration-150">

                                            {statusOptions.map((option) => {

                                                const isSelected = option.value === selected.status;

                                                return (

                                                    /* Usamos ListboxOption directamente en lugar de Listbox.Option */

                                                    <ListboxOption

                                                        key={option.value}

                                                        value={option.value}

                                                        className={({ active }: { active: boolean }) =>

                                                            `flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium cursor-pointer transition-all duration-150 ${

                                                                isSelected

                                                                    ? "bg-cyan-50/80 text-[#00A7E1] font-semibold"

                                                                    : active

                                                                    ? "bg-slate-50 text-slate-900"

                                                                    : "text-slate-600"

                                                            }`

                                                        }

                                                    >

                                                        <span>{option.label}</span>


                                                        {/* Indicador sutil de selección usando el cyan corporativo */}

                                                        {isSelected && (

                                                            <svg className="h-3.5 w-3.5 text-[#00A7E1]" fill="currentColor" viewBox="0 0 20 20">

                                                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />

                                                            </svg>
                                                        )}
                                                    </ListboxOption>
                                                );
                                            })}
                                        </ListboxOptions>
                                    </Listbox>
                                </div>
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

                            <div className="border-t border-dashed border-slate-200 pt-6">
                                <div className="bg-white/40 border border-slate-200/40 rounded-xl p-4 flex items-center justify-between text-[11px] text-slate-500 shadow-inner">
                                    <p>
                                        ID Transacción:{" "}
                                        <span className="font-mono text-slate-600 font-medium">
                                            tx_{selected.id}
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