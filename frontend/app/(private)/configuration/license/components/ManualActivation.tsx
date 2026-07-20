import { KeyRound } from "lucide-react";

type Props = {
    licenseKey: string;
    setLicenseKey: (value: string) => void;
    processing: boolean;
    onActivate: () => void;
};

export default function ManualActivation({
    licenseKey,
    setLicenseKey,
    processing,
    onActivate,
}: Props) {
    return (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex items-start gap-4">
                <div className="rounded-full bg-amber-100 p-3">
                    <KeyRound className="h-6 w-6 text-amber-600" />
                </div>

                <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Activación manual de licencia
                    </h2>

                    <p className="mt-1 text-sm text-gray-600">
                        Esta licencia se encuentra pendiente de activación.
                        Ingresa la clave de licencia para validarla y activarla.
                    </p>

                    <div className="mt-6 space-y-4">
                        <div>
                            <label
                                htmlFor="licenseKey"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Clave de licencia
                            </label>

                            <input
                                id="licenseKey"
                                type="text"
                                value={licenseKey}
                                onChange={(e) =>
                                    setLicenseKey(e.target.value)
                                }
                                placeholder="XXXX-XXXX-XXXX-XXXX"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                disabled={
                                    processing ||
                                    licenseKey.trim() === ""
                                }
                                onClick={onActivate}
                                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing
                                    ? "Activando..."
                                    : "Activar licencia"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}