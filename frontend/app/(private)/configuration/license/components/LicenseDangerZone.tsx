"use client";

import { AlertTriangle, Trash2 } from "lucide-react";

interface LicenseDangerZoneProps {
    executeAction: (
        action: () => Promise<unknown>,
        successMessage: string
    ) => Promise<void>;

    actions: {
        revokeLicense: () => Promise<void>;
    };
}

export default function LicenseDangerZone({
    executeAction,
    actions,
}: LicenseDangerZoneProps) {
    return (
        <section className="rounded-2xl border border-red-200 bg-red-50/60 p-6">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                </div>

                <div>
                    <h2 className="font-bold text-red-700">
                        Zona peligrosa
                    </h2>

                    <p className="mt-1 text-sm text-red-600">
                        Esta acción eliminará permanentemente la licencia.
                    </p>
                </div>
            </div>

            <button
                className="
                    mt-5
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-red-600
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    transition-all
                    hover:bg-red-700
                    active:scale-95
                "
                onClick={() => {
                    if (confirm("¿Eliminar licencia?")) {
                        executeAction(
                            actions.revokeLicense,
                            "Licencia eliminada"
                        );
                    }
                }}
            >
                <Trash2 className="h-4 w-4" />
                Eliminar licencia
            </button>
        </section>
    );
}