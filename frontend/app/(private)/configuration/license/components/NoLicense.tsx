import { ShieldCheck } from "lucide-react";

type Props = {
    processing: boolean;
    onCreateTrialLicense: () => Promise<void>;
};

export default function NoLicense({
    processing,
    onCreateTrialLicense,
}: Props) {
    return (
        <section className="
            relative
            overflow-hidden
            rounded-3xl
            border
            border-yellow-200
            bg-white
            p-8
            shadow-sm
        ">
            <div className="
                absolute
                -top-32
                -right-32
                h-64
                w-64
                rounded-full
                bg-yellow-50
                blur-3xl
            "/>

            <div className="relative z-10">
                <div className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    bg-yellow-100
                    text-yellow-700
                ">
                    <ShieldCheck />
                </div>

                <h1 className="
                    mt-5
                    text-xl
                    font-bold
                    text-gray-900
                ">
                    Sin licencia activa
                </h1>

                <p className="
                    mt-2
                    text-sm
                    text-gray-500
                ">
                    Este negocio todavía no posee una licencia registrada.
                </p>

                <button
                    onClick={onCreateTrialLicense}
                    disabled={processing}
                    className="
                        mt-6
                        rounded-xl
                        bg-blue-600
                        px-5
                        py-2.5
                        text-sm
                        font-semibold
                        text-white
                        transition
                        hover:bg-blue-700
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >
                    {processing
                        ? "Creando licencia..."
                        : "Crear licencia de prueba"}
                </button>
            </div>
        </section>
    );
}