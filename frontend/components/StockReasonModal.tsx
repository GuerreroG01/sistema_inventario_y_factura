"use client";

import { useState, useEffect } from "react";

type Props = {
    open: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
};

export default function StockReasonModal({
    open,
    onClose,
    onConfirm,
}: Props) {
    const [reason, setReason] = useState("");
    const [animate, setAnimate] = useState(false);

    // Manejo de animación de entrada/salida
    useEffect(() => {
        if (open) {
            setAnimate(true);
        } else {
            setAnimate(false);
        }
    }, [open]);

    if (!open) return null;

    const handleConfirm = () => {
        if (!reason.trim()) return;
        onConfirm(reason);
        setReason(""); 
    };

    return (
        <div 
            className={`
                fixed inset-0 z-50 flex items-center justify-center 
                bg-slate-900/50 backdrop-blur-md p-4
                transition-opacity duration-300 ease-out
                ${animate ? "opacity-100" : "opacity-0"}
            `}
        >
            <div 
                className={`
                    bg-white rounded-2xl w-full max-w-[460px] 
                    border border-slate-100
                    shadow-[0_25px_60px_-15px_rgba(15,23,42,0.2)]
                    overflow-hidden
                    transition-all duration-300 ease-out
                    ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-3"}
                `}
            >
                <div className="flex items-center gap-4 p-6 pb-4 border-b border-slate-50">
                    <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center shadow-sm">
                        <svg 
                            className="w-5 h-5" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <path d="m7.5 4.27 9 5.15" />
                            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                            <path d="m3.3 7 8.7 5 8.7-5" />
                            <path d="M12 22V12" />
                        </svg>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base font-bold text-slate-900 tracking-tight">
                            Motivo de reducción de stock
                        </h2>
                        <p className="text-xs font-medium text-slate-500 leading-normal mt-0.5">
                            Indica detalladamente la razón (ej. rotura, fecha de caducidad expirada o merma).
                        </p>
                    </div>
                </div>

                <div className="p-6 bg-slate-50/50">
                    <div className="relative">
                        <textarea
                            className="
                                w-full border border-slate-200 rounded-xl p-3.5 text-sm text-slate-800
                                placeholder-slate-400 bg-white min-h-[120px] resize-none
                                shadow-inner shadow-slate-50
                                focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10
                                transition-all duration-200 leading-relaxed
                            "
                            rows={4}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Escribe aquí los detalles del motivo..."
                        />
                        <span className="absolute bottom-3 right-3 text-[11px] font-semibold text-slate-400 bg-white/80 px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                            {reason.length} caract.
                        </span>
                    </div>
                </div>

                <div className="flex justify-end gap-2.5 px-6 py-4 bg-white border-t border-slate-100">
                    <button
                        onClick={onClose}
                        className="
                            px-4 py-2.5 text-xs font-bold text-slate-600 rounded-xl
                            hover:bg-slate-100 hover:text-slate-800 active:bg-slate-200/70
                            transition-all duration-200
                        "
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={handleConfirm}
                        disabled={!reason.trim()}
                        className={`
                            px-4 py-2.5 text-xs font-bold rounded-xl text-white
                            transition-all duration-200 flex items-center gap-2
                            ${
                                reason.trim()
                                    ? "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/15 active:scale-[0.98]"
                                    : "bg-slate-200 cursor-not-allowed text-slate-400 select-none"
                            }
                        `}
                    >
                        <span>Confirmar</span>
                        <svg 
                            className="w-3.5 h-3.5 stroke-[2.5]" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}