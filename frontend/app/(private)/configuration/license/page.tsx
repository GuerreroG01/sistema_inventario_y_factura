"use client";

import { useState } from "react";
import { useAuth } from "@/app/(public)/auth/login/hooks/useAuth";
import BusinessAutocomplete from "./components/BusinessAutocomplete";
import LicenseManager from "./components/LicenseManager";

export default function LicensePage() {

    const { user } = useAuth();
    const isSuperAdmin = user?.Rol === "superAdmin";
    const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);
    const businessId = isSuperAdmin
        ? selectedBusinessId
        : user?.Business_id;

    return (
        <section className="space-y-6">
            {
                isSuperAdmin && (
                    <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
                        <BusinessAutocomplete
                            onSelect={(business) =>
                                setSelectedBusinessId(business.id)
                            }
                            onClear={() =>
                                setSelectedBusinessId(null)
                            }
                        />
                        {
                            !businessId && (
                                <p className="mt-4 text-sm text-gray-500">
                                    Selecciona un negocio para administrar su licencia.
                                </p>
                            )
                        }
                    </div>
                )
            }

            {
                businessId && (
                    <LicenseManager
                        businessId={businessId}
                    />
                )
            }

        </section>
    );
}