"use client";

import { useEffect, useState } from "react";

type ModalSuccessProps = {
    open: boolean;
    message: string;
    title?: string;
    onClose: () => void;
};

export default function ModalSuccess({
    open,
    message,
    title = "Operación exitosa",
    onClose,
}: ModalSuccessProps) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (open) {
            setShow(true);
            const timer = setTimeout(() => {
                setShow(false);
                setTimeout(onClose, 250);
            }, 4000);

            return () => clearTimeout(timer);
        } else {
            setShow(false);
        }
    }, [open, onClose]);
    if (!open && !show) return null;

    return (
        <div
            className={`
                fixed z-50 left-6 bottom-6 w-[380px]
                transition-all duration-300 ease-out
                will-change-transform
                ${
                    show
                        ? "opacity-100 translate-y-0 scale-100 blur-0"
                        : "opacity-0 translate-y-4 scale-95 blur-[2px]"
                }
            `}
        >
            <div
                className="
                    relative flex items-start gap-3
                    rounded-2xl
                    bg-white/80 backdrop-blur-xl
                    border border-slate-200/60
                    shadow-[0_20px_50px_rgba(0,0,0,0.12)]
                    p-4 pr-3
                    overflow-hidden
                    hover:shadow-[0_25px_60px_rgba(0,0,0,0.18)]
                    transition-shadow duration-300
                "
            >
                <div className="absolute left-0 top-0 h-full w-[3px] bg-emerald-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/30 via-transparent to-transparent pointer-events-none" />
                <div className="flex-shrink-0 mt-0.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 text-emerald-500">
                        <svg
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M8 12l2.5 2.5L16 9" />
                        </svg>
                    </div>
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-[14px] font-semibold text-slate-900 tracking-tight">
                        {title}
                    </p>
                    <p className="text-[13px] text-slate-500 leading-relaxed mt-0.5 break-words">
                        {message}
                    </p>
                </div>
                <button
                    onClick={() => {
                        setShow(false);
                        setTimeout(onClose, 250);
                    }}
                    className="
                        flex-shrink-0 p-1.5 rounded-lg
                        text-slate-400 hover:text-slate-600 hover:bg-slate-100/80
                        transition-all duration-200
                        hover:scale-105 active:scale-95
                    "
                    aria-label="Cerrar"
                >
                    <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-100">
                    <div
                        className="h-full bg-emerald-500 transition-all ease-linear"
                        style={{
                            width: show ? "0%" : "100%",
                            transitionDuration: show ? "4000ms" : "0ms",
                        }}
                    />
                </div>
            </div>
        </div>
    );
}