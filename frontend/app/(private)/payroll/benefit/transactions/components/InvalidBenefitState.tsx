
"use client";

import { useRouter } from "next/navigation";

import {
    ArrowLeft,
    ArrowRight,
    Gift,
    AlertTriangle,
    ShieldAlert,
    SearchX,
    Home,
} from "lucide-react";

interface InvalidBenefitStateProps {
    title?: string;
    description?: string;
    showHomeButton?: boolean;
}

export function InvalidBenefitState({
    title = "No encontramos este beneficio",
    description = "No fue posible localizar la información del beneficio que intentas consultar. Es posible que el registro haya sido eliminado, que el identificador sea incorrecto o que ya no esté disponible.",
    showHomeButton = false,
}: InvalidBenefitStateProps) {
    const router = useRouter();

    return (
        <section className="relative flex min-h-[65vh] w-full items-start justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white lg:items-center">

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -right-20 -top-32 h-96 w-96 rounded-full bg-violet-50/80 blur-3xl" />
                <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-indigo-50/70 blur-3xl" />

                <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage:
                            "radial-gradient(#64748b 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                    }}
                />
            </div>

            <div className="relative z-10 grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 py-6 sm:px-10 md:-translate-y-12 md:gap-6 lg:translate-y-0 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-16 lg:py-20">

                <div className="relative top-0 mx-auto flex w-full max-w-md items-center justify-center md:top-[-30px] lg:top-0">

                    <div className="absolute h-72 w-72 rounded-full border border-violet-100 sm:h-96 sm:w-96" />

                    <div className="absolute h-56 w-56 rounded-full border border-dashed border-violet-200 sm:h-72 sm:w-72" />

                    <div className="absolute h-44 w-44 rounded-full bg-gradient-to-br from-violet-100 via-indigo-50 to-white shadow-inner sm:h-60 sm:w-60" />

                    <div className="relative flex h-36 w-36 items-center justify-center rounded-[2rem] border border-white bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 text-white shadow-[0_25px_60px_-15px_rgba(109,40,217,0.45)] sm:h-48 sm:w-48 sm:rounded-[2.5rem]">

                        <Gift className="h-16 w-16 sm:h-24 sm:w-24" strokeWidth={1.2} />

                        <div className="absolute -right-4 -top-4 flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-white bg-rose-500 text-white shadow-lg sm:h-16 sm:w-16">
                            <SearchX className="h-7 w-7 sm:h-8 sm:w-8" />
                        </div>

                    </div>

                    <div className="absolute left-0 top-10 hidden items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2.5 shadow-lg shadow-slate-200/50 sm:flex">
                        <div className="rounded-lg bg-violet-50 p-2 text-violet-600">
                            <Gift className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-700">
                                Beneficios
                            </p>
                            <p className="text-[9px] text-slate-400">
                                Recursos humanos
                            </p>
                        </div>
                    </div>

                    <div className="absolute bottom-8 right-0 hidden items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2.5 shadow-lg shadow-slate-200/50 sm:flex">
                        <AlertTriangle className="h-5 w-5 text-rose-500" />
                        <span className="text-xs font-semibold text-slate-600">
                            Registro no disponible
                        </span>
                    </div>

                </div>

                <div className="mx-auto w-full max-w-xl text-center lg:mx-0 lg:text-left">

                    <div className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-4 py-2">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-50" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
                        </span>

                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose-600">
                            Error 404 · Registro no encontrado
                        </span>
                    </div>

                    <h2 className="mt-7 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                        {title}
                        <span className="mt-1 block bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
                            Estamos aquí para ayudarte.
                        </span>
                    </h2>

                    <p className="mt-5 text-sm leading-7 text-slate-500 sm:text-base sm:leading-8">
                        {description}
                    </p>

                    <div className="mt-7 flex gap-3 rounded-xl border border-violet-100 bg-violet-50/60 p-4 text-left">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-violet-600 shadow-sm">
                            <ShieldAlert className="h-5 w-5" />
                        </div>

                        <div>
                            <p className="text-xs font-bold text-slate-800">
                                ¿Qué puedes hacer?
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                Verifica el enlace o regresa a la página anterior para seleccionar otro beneficio.
                                Si el problema continúa, contacta con el administrador del sistema.
                            </p>
                        </div>

                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-wrap">

                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition-all hover:-translate-y-0.5 hover:bg-violet-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Regresar
                        </button>

                        {showHomeButton && (
                            <button
                                type="button"
                                onClick={() => router.push("/")}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-600 transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                            >
                                <Home className="h-4 w-4" />
                                Ir al inicio
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        )}

                    </div>

                    <div className="mt-9 flex items-center justify-center gap-2 border-t border-slate-100 pt-5 lg:justify-start">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                            <Gift className="h-4 w-4" />
                        </div>

                        <span className="text-[11px] font-semibold tracking-wide text-slate-400">
                            SISTEMA DE GESTIÓN · BENEFICIOS LABORALES
                        </span>
                    </div>

                </div>
            </div>
        </section>
    );
}
