import { useLicense } from "../hooks/useLicense"
import NoLicense from "./NoLicense";
import LicenseCard from "./LicenseCard";
import LicenseInfo from "./LicenseInfo";
import LicenseActions from "./LicenseActions";
import LicenseDangerZone from "./LicenseDangerZone";
import { ShieldCheck, KeyRound, Clock3, Zap } from "lucide-react";
import { licenseTypeTranslations, licenseStatusTranslations } from "../constants/licenseTranslations"
import ModalSuccess from "@/components/ModalSuccess";
import ModalError from "@/components/ModalError";
import ManualActivation from "./ManualActivation";

type Props = {
    businessId: number;
};

export default function LicenseManager({ businessId }: Props) {
    const { license, status, loading, processing, noLicense, duration, setDuration, isSuperAdmin,
        durationUnit, setDurationUnit, executeAction, actions, notification, clearNotification,
        licenseKey, setLicenseKey
    } = useLicense(businessId);
    
    const requiresManualActivation =
        !!license &&
        license.status === "PENDING" &&
        license.activated_at === null &&
        license.expires_at === null;
    if (loading) {
        return (
            <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
                <p className="text-sm text-gray-500">
                    Cargando información de licencia...
                </p>
            </section>
        );
    }


    if (noLicense) {
        return (
            <NoLicense
                processing={processing}
                onCreateTrialLicense={() =>
                    executeAction(
                        actions.createTrialLicense,
                        "Licencia de prueba creada correctamente"
                    )
                }
                isSuperAdmin={isSuperAdmin}
            />
        );
    }

    /*if (requiresManualActivation) {
        return (
            <ManualActivation
                license={license}
                businessId={businessId}
            />
        );
    }*/

    if (!license || !status) {
        return null;
    }

    const statusConfig = {
        ACTIVE: {
            label: "Licencia activa",
            className: "bg-emerald-50 text-emerald-700",
            dot: "bg-emerald-500"
        },
        SUSPENDED: {
            label: "Licencia suspendida",
            className: "bg-amber-50 text-amber-700",
            dot: "bg-amber-500"
        },
        EXPIRED: {
            label: "Licencia expirada",
            className: "bg-red-50 text-red-700",
            dot: "bg-red-500"
        },
        PENDING: {
            label: "Pendiente de Activación",
            className: "bg-amber-50 text-amber-700",
            dot: "bg-slate-500"
        }
    };
    const badge =
        statusConfig[status.status as keyof typeof statusConfig] ??
        statusConfig.ACTIVE;

    return (
        <>
            <ModalSuccess
                open={notification?.type === "success"}
                message={notification?.message ?? ""}
                onClose={clearNotification}
            />

            <ModalError
                open={notification?.type === "error"}
                message={notification?.message ?? ""}
                onClose={clearNotification}
            />
            <section className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-6 md:p-8 shadow-sm">

                <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-blue-50 blur-3xl"/>
                <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-indigo-50 blur-3xl"/>

                <div className="relative z-10">

                    <div className="flex flex-col md:flex-row justify-between gap-5 mb-8">

                        <div>
                            <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                                <KeyRound className="h-6 w-6 text-blue-600"/>
                                Administración de Licencia
                            </h1>
                            <p className="mt-2 text-sm text-gray-500">
                                Controla estado, vigencia y acciones administrativas.
                            </p>
                        </div>

                        <div
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold h-fit ${badge.className}`}
                        >
                            <span className={`h-2 w-2 rounded-full ${badge.dot}`} />
                            {badge.label}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <LicenseCard
                            title="Estado"
                            value={licenseStatusTranslations[status.status]}
                            icon={<ShieldCheck />}
                            color="blue"
                        />
                        <LicenseCard
                            title="Tipo"
                            value={licenseTypeTranslations[status.type]}
                            icon={<Zap />}
                            color="purple"
                        />
                        <LicenseCard
                            title="Vigencia"
                            value={
                                status.days_remaining !== null
                                    ? `${status.days_remaining} días`
                                    : "Sin expiración"
                            }
                            icon={<Clock3 />}
                            color="emerald"
                        />

                    </div>
                    {requiresManualActivation && !isSuperAdmin && (
                        <ManualActivation
                            licenseKey={licenseKey}
                            setLicenseKey={setLicenseKey}
                            processing={processing}
                            onActivate={() =>
                                executeAction(
                                    actions.activatePendingLicense,
                                    "Licencia activada correctamente"
                                )
                            }
                        />
                    )}
                    
                    {(!requiresManualActivation || isSuperAdmin) && (
                        <LicenseInfo
                            license={license}
                        />
                    )}
                    {isSuperAdmin && (
                        <>
                            <LicenseActions
                                processing={processing}
                                duration={duration}
                                durationUnit={durationUnit}
                                setDuration={setDuration}
                                setDurationUnit={setDurationUnit}
                                executeAction={executeAction}
                                actions={actions}
                            />

                            <LicenseDangerZone
                                executeAction={executeAction}
                                actions={actions}
                            />
                        </>
                    )}
                </div>
            </section>
        </>
    );
}