"use client";

import { useEffect, useState } from "react";
import { getLicense, createTrialLicense, getLicenseStatus, renewLicense, extendLicense,
    suspendLicense, reactivateLicense, createLifetimeLicense, revokeLicense
} from "@/services/licenseService";
import { License, LicenseStatus } from "@/types/License";

export function useLicense(businessId: number) {
    const [license, setLicense] = useState<License | null>(null);
    const [status, setStatus] = useState<LicenseStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [noLicense, setNoLicense] = useState(false);
    const [message, setMessage] = useState("");
    const [duration, setDuration] = useState(1);
    const [durationUnit, setDurationUnit] = useState<"DAY" | "MONTH" | "YEAR">("MONTH");

    const loadLicense = async () => {
        try {
            setLoading(true);

            const licenseData = await getLicense(businessId);
            const statusData = await getLicenseStatus(businessId);

            setLicense(licenseData);
            setStatus(statusData);
            setNoLicense(false);

        } catch (error: any) {
            if (error.message === "Licencia no encontrada") {
                setNoLicense(true);
                setLicense(null);
                setStatus(null);
            } else {
                setMessage(error.message ?? "Error al cargar la licencia");
            }
        } finally {
            setLoading(false);
        }
    };


    const executeAction = async (
        action: () => Promise<any>,
        success: string
    ) => {
        try {
            setProcessing(true);

            const result = await action();

            if (result) {
                setLicense(result);
            }

            await loadLicense();

            setMessage(success);

        } catch (error: any) {
            setMessage(error.message ?? "Error ejecutando acción");

        } finally {
            setProcessing(false);
        }
    };


    useEffect(() => {
        loadLicense();
    }, [businessId]);


    return {
        license, status, loading, processing, noLicense, message, duration, setDuration, 
        durationUnit, setDurationUnit, executeAction, reload: loadLicense,
        actions: {
            renewLicense: () =>
                renewLicense(businessId, duration, durationUnit),
            extendLicense: () =>
                extendLicense(businessId, duration, durationUnit),
            suspendLicense: () =>
                suspendLicense(businessId),
            reactivateLicense: () =>
                reactivateLicense(businessId),
            createLifetimeLicense: () =>
                createLifetimeLicense(businessId),
            revokeLicense: () =>
                revokeLicense(businessId),
            createTrialLicense: () =>
                createTrialLicense(businessId),
        }
    };
}