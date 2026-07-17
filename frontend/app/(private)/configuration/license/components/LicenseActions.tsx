"use client";

import { RefreshCcw, ShieldCheck} from "lucide-react";

interface LicenseActionsProps {
    processing: boolean;
    duration: number;
    durationUnit: "DAY" | "MONTH" | "YEAR";
    setDuration: React.Dispatch<React.SetStateAction<number>>;
    setDurationUnit: React.Dispatch<
        React.SetStateAction<"DAY" | "MONTH" | "YEAR">
    >;
    executeAction: (
        action: () => Promise<any>,
        successMessage: string
    ) => Promise<void>;
    actions: {
        renewLicense: (
            duration: number,
            unit: "DAY" | "MONTH" | "YEAR"
        ) => Promise<any>;
        extendLicense: (
            duration: number,
            unit: "DAY" | "MONTH" | "YEAR"
        ) => Promise<any>;
        suspendLicense: () => Promise<any>;
        reactivateLicense: () => Promise<any>;
        createLifetimeLicense: () => Promise<any>;
    };
}

export default function LicenseActions({
    processing, duration, durationUnit, setDuration, setDurationUnit, executeAction, actions
}: LicenseActionsProps) {
    return (
        <>
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mb-8">
                <div className="flex items-start gap-3 mb-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 border border-blue-100">
                        <RefreshCcw
                            className="
                                h-5
                                w-5
                                text-blue-600
                            "
                        />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Renovación / Extensión
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Amplía el tiempo de vigencia de la licencia.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                    <input
                        type="number"
                        min={1}
                        value={duration}
                        onChange={(e)=>
                            setDuration(
                                Number(e.target.value)
                            )
                        }
                        className="
                            w-full
                            md:w-32
                            rounded-xl
                            border
                            border-gray-200
                            px-4
                            py-3
                            text-sm
                            outline-none
                            transition-all
                            focus:border-blue-300
                            focus:ring-4
                            focus:ring-blue-100
                        "
                    />
                    <select
                        value={durationUnit}
                        onChange={(e)=>
                            setDurationUnit(
                                e.target.value as
                                "DAY" |
                                "MONTH" |
                                "YEAR"
                            )
                        }
                        className="
                            rounded-xl
                            border
                            border-gray-200
                            px-4
                            py-3
                            text-sm
                            outline-none
                            transition-all
                            focus:border-blue-300
                            focus:ring-4
                            focus:ring-blue-100
                        "
                    >
                        <option value="DAY">
                            Día
                        </option>
                        <option value="MONTH">
                            Mes
                        </option>
                        <option value="YEAR">
                            Año
                        </option>
                    </select>
                </div>
                <div className="flex flex-wrap gap-3 mt-5">
                    <button
                        disabled={processing}
                        onClick={()=>
                            executeAction(
                                ()=>
                                    actions.renewLicense(
                                        duration,
                                        durationUnit
                                    ),
                                "Licencia renovada"
                            )
                        }
                        className="
                            rounded-xl
                            bg-blue-600
                            px-5
                            py-3
                            text-sm
                            font-semibold
                            text-white
                            transition-all
                            hover:bg-blue-700
                            active:scale-95
                            disabled:opacity-50
                        "
                    >
                        Renovar
                    </button>
                    <button
                        disabled={processing}
                        onClick={()=>
                            executeAction(
                                ()=>
                                    actions.extendLicense(
                                        duration,
                                        durationUnit
                                    ),
                                "Licencia extendida"
                            )
                        }
                        className="
                            rounded-xl
                            border
                            border-blue-200
                            bg-blue-50
                            px-5
                            py-3
                            text-sm
                            font-semibold
                            text-blue-700
                            transition-all
                            hover:bg-blue-100
                            active:scale-95
                        "
                    >
                        Extender
                    </button>
                </div>
            </section>
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mb-8">
                <div className="flex items-start gap-3 mb-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 border border-purple-100">
                        <ShieldCheck
                            className="
                                h-5
                                w-5
                                text-purple-600
                            "
                        />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Acciones administrativas
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Herramientas de gestión avanzada.
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={()=>
                            executeAction(
                                actions.suspendLicense,
                                "Licencia suspendida"
                            )
                        }
                        className="
                            rounded-xl
                            border
                            border-amber-200
                            bg-amber-50
                            px-4
                            py-2.5
                            text-sm
                            font-semibold
                            text-amber-700
                            transition-all
                            hover:bg-amber-100
                            active:scale-95
                        "
                    >
                        Suspender
                    </button>
                    <button
                        onClick={()=>
                            executeAction(
                                actions.reactivateLicense,
                                "Licencia reactivada"
                            )
                        }
                        className="
                            rounded-xl
                            border
                            border-emerald-200
                            bg-emerald-50
                            px-4
                            py-2.5
                            text-sm
                            font-semibold
                            text-emerald-700
                            transition-all
                            hover:bg-emerald-100
                            active:scale-95
                        "
                    >
                        Reactivar
                    </button>
                    <button
                        onClick={()=>
                            executeAction(
                                actions.createLifetimeLicense,
                                "Licencia Lifetime creada"
                            )
                        }
                        className="
                            rounded-xl
                            border
                            border-indigo-200
                            bg-indigo-50
                            px-4
                            py-2.5
                            text-sm
                            font-semibold
                            text-indigo-700
                            transition-all
                            hover:bg-indigo-100
                            active:scale-95
                        "
                    >
                        Lifetime
                    </button>
                </div>
            </section>
        </>
    );
}