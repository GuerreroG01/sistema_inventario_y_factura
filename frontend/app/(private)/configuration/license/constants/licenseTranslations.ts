import { LicenseStatusType, LicenseType } from "@/types/License";

export const licenseTypeTranslations: Record<LicenseType, string> = {
    SUBSCRIPTION: "Suscripción",
    LIFETIME: "De por vida",
    TRIAL_PERIOD: "Período de prueba",
};


export const licenseStatusTranslations: Record<LicenseStatusType, string> = {
    ACTIVE: "Activa",
    EXPIRED: "Expirada",
    SUSPENDED: "Suspendida",
};