"use client";

import { useEffect, useState } from "react";

type ModalSuccessProps = {
    open: boolean;
    onClose: () => void;
};

export default function ModalSuccess({
    open,
    onClose,
}: ModalSuccessProps) {

    const [show, setShow] = useState(false);

    useEffect(() => {
        if (!open) return;

        setShow(true);

        const timer = setTimeout(() => {
            setShow(false);

            setTimeout(() => {
                onClose();
            }, 300);

        }, 3000);

        return () => clearTimeout(timer);

    }, [open, onClose]);


    if (!open && !show) return null;


    return (
        <div
            className={`
                fixed inset-0 z-50
                flex items-center justify-center
                bg-slate-900/30
                backdrop-blur-sm
                transition-opacity duration-300
                ${show ? "opacity-100" : "opacity-0"}
            `}
        >

            <div
                className={`
                    w-[360px]
                    rounded-3xl
                    bg-white
                    border border-slate-200
                    shadow-2xl
                    p-8
                    text-center
                    transition-all duration-500

                    ${
                        show
                            ? "scale-100 translate-y-0"
                            : "scale-90 translate-y-5"
                    }
                `}
            >

                <div
                    className="
                        mx-auto
                        flex items-center justify-center
                        w-20 h-20
                        rounded-full
                        bg-emerald-50
                        border border-emerald-100
                    "
                >

                    <div
                        className="
                            flex items-center justify-center
                            w-14 h-14
                            rounded-full
                            bg-emerald-500
                            shadow-lg
                            shadow-emerald-500/30
                            animate-pulse
                        "
                    >
                        <svg
                            className="w-8 h-8 text-white"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>

                </div>


                <h2 className="
                    mt-6
                    text-xl
                    font-bold
                    text-slate-900
                ">
                    Venta Registrada
                </h2>


                <p className="
                    mt-2
                    text-sm
                    text-slate-500
                ">
                    La venta fue procesada correctamente
                </p>


                <div className="
                    mt-6
                    h-1
                    overflow-hidden
                    rounded-full
                    bg-slate-100
                ">
                    <div
                        className="
                            h-full
                            w-full
                            bg-gradient-to-r
                            from-indigo-500
                            to-emerald-500
                        "
                        style={{
                            animation: "progress 3s linear forwards"
                        }}
                    />
                </div>

            </div>


            <style>{`
                @keyframes progress {
                    from {
                        width: 100%;
                    }

                    to {
                        width: 0%;
                    }
                }
            `}</style>

        </div>
    );
}