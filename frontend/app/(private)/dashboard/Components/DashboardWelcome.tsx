"use client";

import { useAuth } from "@/app/(public)/auth/login/hooks/useAuth";

export default function DashboardWelcome() {
    const { user, businessName } = useAuth();

    return (
        <>
            <h1 className="text-4xl sm:text-5xl font-extrabold drop-shadow-lg">
                Bienvenido {user?.Usuario}
            </h1>

            <p className="mt-4 text-indigo-100 text-lg sm:text-xl max-w-xl">
                Administra{" "}

                {businessName ? (
                    <span className="font-bold text-white">
                        {businessName}
                    </span>
                ) : (
                    <span
                        className="
                            inline-block
                            h-6
                            w-40
                            rounded-md
                            bg-white/30
                            animate-pulse
                            align-middle
                        "
                    />
                )}

                {" "}
                de manera eficiente.
                Visualiza el estado de tu negocio y toma decisiones rápidas.
            </p>
        </>
    );
}