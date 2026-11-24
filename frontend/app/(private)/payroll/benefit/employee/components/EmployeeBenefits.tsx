"use client";

import { useEffect, useState } from "react";
import { 
    Gift, ChevronDown, CalendarDays, Wallet, Clock3, CalendarCheck, Coins, ExternalLink, Palmtree, Loader2, AlertCircle, CheckCircle2
} from "lucide-react";
import { useEmployeeBenefits } from "../hooks/useEmployeeBenefit";
import { formatDate } from "@/utils/formatDate";
import { useRouter } from "next/navigation";
import { useNicaraguaLaborBenefits } from "../../transactions/hooks/useNicaraguaLaborBenefits";

interface Props {
    employeeId: number;
    businessId: number;
}

type BenefitTheme = "emerald" | "blue" | "violet";
type BenefitCalcKey = "VACATION" | "THIRTEENTH_MONTH" | "SEVERANCE";

interface CalculateButtonProps {
  title: string;
  idleSubtitle?: string;
  calculatedTodayLabel?: string;
  loadingLabel?: string;
  theme: BenefitTheme;
  isLoading: boolean;
  isCalculatedToday?: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}

const TIMEZONE = "America/Managua";

function getManaguaDateKey(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
        day: "2-digit",
    }).format(date);
}

function getDailyCalcStorageKey(
    businessId: number,
    employeeId: number,
    benefitKey: BenefitCalcKey,
    dateKey: string
): string {
    return `benefit_calc_daily:${businessId}:${employeeId}:${benefitKey}:${dateKey}`;
}

function hasCalculatedTodayInStorage(
    businessId: number,
    employeeId: number,
    benefitKey: BenefitCalcKey,
    dateKey: string
): boolean {
    if (typeof window === "undefined") return false;
    try {
        return (
        window.localStorage.getItem(
            getDailyCalcStorageKey(businessId, employeeId, benefitKey, dateKey)
        ) === "1"
        );
    } catch {
        return false;
    }
}

function markCalculatedTodayInStorage(
    businessId: number,
    employeeId: number,
    benefitKey: BenefitCalcKey,
    dateKey: string
): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(
        getDailyCalcStorageKey(businessId, employeeId, benefitKey, dateKey),
        "1"
        );
    } catch {
    }
}

function isIdempotencyAlreadyUsedError(err: unknown): boolean {
    const message =
        typeof err === "string"
        ? err
        : err instanceof Error
        ? err.message
        : typeof err === "object" && err !== null && "message" in err
        ? String((err as { message?: unknown }).message ?? "")
        : "";

    return message.includes("benefit_transaction_idempotency_key_already_used");
}

const THEME_STYLES: Record<
    BenefitTheme,
    {
        card: string;
        topBar: string;
        iconIdle: string;
        iconActive: string;
        ping: string;
        title: string;
        subtitle: string;
        dot: string;
    }
    > = {
    emerald: {
        card: "border-emerald-200/70 from-emerald-50/90 via-white to-white hover:border-emerald-300 hover:shadow-emerald-100/70",
        topBar: "from-emerald-400 via-teal-500 to-emerald-400",
        iconIdle:
        "bg-emerald-100/90 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-emerald-200/80",
        iconActive: "bg-emerald-600 text-white shadow-md shadow-emerald-200/80",
        ping: "bg-emerald-400/40",
        title: "text-emerald-950",
        subtitle: "text-emerald-700/80",
        dot: "bg-emerald-500",
    },
    blue: {
        card: "border-blue-200/70 from-blue-50/90 via-white to-white hover:border-blue-300 hover:shadow-blue-100/70",
        topBar: "from-blue-400 via-sky-500 to-blue-400",
        iconIdle:
        "bg-blue-100/90 text-blue-700 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-blue-200/80",
        iconActive: "bg-blue-600 text-white shadow-md shadow-blue-200/80",
        ping: "bg-blue-400/40",
        title: "text-blue-950",
        subtitle: "text-blue-700/80",
        dot: "bg-blue-500",
    },
    violet: {
        card: "border-violet-200/70 from-violet-50/90 via-white to-white hover:border-violet-300 hover:shadow-violet-100/70",
        topBar: "from-violet-400 via-purple-500 to-violet-400",
        iconIdle:
        "bg-violet-100/90 text-violet-700 group-hover:bg-violet-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-violet-200/80",
        iconActive: "bg-violet-600 text-white shadow-md shadow-violet-200/80",
        ping: "bg-violet-400/40",
        title: "text-violet-950",
        subtitle: "text-violet-700/80",
        dot: "bg-violet-500",
    },
};

function CalculateBenefitButton({
    title, idleSubtitle = "Calcular beneficio", calculatedTodayLabel = "Calculado hoy", loadingLabel = "Calculando",
    theme, isLoading, isCalculatedToday = false, disabled = false, onClick, icon,
}: CalculateButtonProps) {
    const styles = THEME_STYLES[theme];
    const isLockedToday = isCalculatedToday && !isLoading;

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={isLoading || isLockedToday || disabled}
            aria-busy={isLoading}
            title={
                isLockedToday
                ? "Este beneficio ya fue calculado hoy"
                : undefined
            }
            className={`group relative flex w-full items-center gap-3.5 overflow-hidden rounded-2xl border bg-gradient-to-br p-4 text-left shadow-sm transition-all duration-200 ${
                isLockedToday
                ? "cursor-not-allowed border-slate-200/90 from-slate-50 via-slate-50/70 to-white opacity-75 shadow-none"
                : `hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-75 ${styles.card}`
            }`}
        >
            {isLoading && (
                <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 top-0 h-1 animate-pulse bg-gradient-to-r ${styles.topBar}`}
                />
            )}

            {!isLoading && !isLockedToday && (
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
                />
            )}

            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
                {isLoading && (
                    <span
                        aria-hidden="true"
                        className={`absolute inset-0 animate-ping rounded-xl ${styles.ping}`}
                    />
                )}
                <div
                    className={`relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 ${
                        isLoading
                        ? styles.iconActive
                        : isLockedToday
                        ? "bg-slate-200/80 text-slate-500"
                        : `${styles.iconIdle} group-hover:scale-105`
                    }`}
                >
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : isLockedToday ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                        icon
                    )}
                </div>
            </div>

            <div className="relative min-w-0 flex-1">
                <p
                    className={`truncate text-sm font-bold ${
                        isLockedToday ? "text-slate-700" : styles.title
                    }`}
                >
                    {title}
                </p>
                <div
                    className={`mt-0.5 text-xs ${
                        isLockedToday ? "font-medium text-slate-500" : styles.subtitle
                    }`}
                >
                {isLoading ? (
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                        <span>{loadingLabel}</span>
                        <span
                            className="inline-flex items-center gap-0.5"
                            aria-hidden="true"
                        >
                            <span
                            className={`h-1 w-1 animate-bounce rounded-full ${styles.dot} [animation-delay:-0.3s]`}
                            />
                            <span
                            className={`h-1 w-1 animate-bounce rounded-full ${styles.dot} [animation-delay:-0.15s]`}
                            />
                            <span
                            className={`h-1 w-1 animate-bounce rounded-full ${styles.dot}`}
                            />
                        </span>
                    </span>
                ) : isLockedToday ? (
                    <span>{calculatedTodayLabel}</span>
                ) : (
                    <span className="transition-colors group-hover:font-medium">
                        {idleSubtitle}
                    </span>
                )}
                </div>
            </div>
        </button>
    );
}

const formatBalance = (balance: number | string, unit: string) => {
    const value = Number(balance);

    if (unit === "CURRENCY") {
        return new Intl.NumberFormat("es-NI", {
        style: "currency",
        currency: "NIO",
        minimumFractionDigits: 2,
        }).format(value);
    }

    if (unit === "DAYS") {
        const formatted = Number.isInteger(value)
        ? value.toString()
        : value.toFixed(1).replace(/\.0$/, "");

        return `${formatted} ${value === 1 ? "día" : "días"}`;
    }

    return value.toString();
};

const getBenefitModeLabel = (mode: string) => {
    const modes: Record<string, string> = {
        RECURRING: "Recurrente",
        ONE_TIME: "Una sola vez",
    };

    return modes[mode] ?? mode;
};

const getBenefitTypeLabel = (type: string) => {
    const types: Record<string, string> = {
        THIRTEENTH_MONTH: "Décimo tercer mes",
        VACATION: "Vacaciones",
        SEVERANCE: "Indemnización",
    };

    return types[type] ?? type.replaceAll("_", " ");
};

function BenefitStatusBadge({ status }: { status: string }) {
    const isActive = status === "ACTIVE";

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                isActive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}
        >
        <span
            className={`h-1.5 w-1.5 rounded-full ${
            isActive ? "bg-emerald-500" : "bg-slate-400"
            }`}
        />
            {isActive ? "Activo" : status}
        </span>
    );
}

export function EmployeeBenefits({ employeeId, businessId }: Props) {
    const [isOpen, setIsOpen] = useState(true);
    const [todayKey, setTodayKey] = useState<string>(() => getManaguaDateKey());
    const [calculatedToday, setCalculatedToday] = useState<
        Record<BenefitCalcKey, boolean>
    >(() => {
        const initialDate = getManaguaDateKey();
        return {
        VACATION: hasCalculatedTodayInStorage(
            businessId,
            employeeId,
            "VACATION",
            initialDate
        ),
        THIRTEENTH_MONTH: hasCalculatedTodayInStorage(
            businessId,
            employeeId,
            "THIRTEENTH_MONTH",
            initialDate
        ),
        SEVERANCE: hasCalculatedTodayInStorage(
            businessId,
            employeeId,
            "SEVERANCE",
            initialDate
        ),
        };
    });

    const router = useRouter();

    const { benefits, loading, error, refresh } = useEmployeeBenefits(employeeId);
    const {
        calculateVacation, calculateThirteenthMonth, calculateIndemnification, loadingVacation, loadingThirteenthMonth,
        loadingIndemnification, vacationError, thirteenthMonthError, indemnificationError,
    } = useNicaraguaLaborBenefits({
        businessId, employeeId,
    });

    useEffect(() => {
        const syncDailyState = () => {
            const currentDateKey = getManaguaDateKey();
            setTodayKey(currentDateKey);
            setCalculatedToday({
                VACATION: hasCalculatedTodayInStorage(
                    businessId,
                    employeeId,
                    "VACATION",
                    currentDateKey
                ),
                THIRTEENTH_MONTH: hasCalculatedTodayInStorage(
                    businessId,
                    employeeId,
                    "THIRTEENTH_MONTH",
                    currentDateKey
                ),
                SEVERANCE: hasCalculatedTodayInStorage(
                    businessId,
                    employeeId,
                    "SEVERANCE",
                    currentDateKey
                ),
            });
        };

        syncDailyState();
        const interval = window.setInterval(syncDailyState, 60_000);
        return () => window.clearInterval(interval);
    }, [businessId, employeeId]);

    useEffect(() => {
        const currentDateKey = getManaguaDateKey();
        const updates: Partial<Record<BenefitCalcKey, boolean>> = {};

        if (isIdempotencyAlreadyUsedError(vacationError)) {
        markCalculatedTodayInStorage(
            businessId,
            employeeId,
            "VACATION",
            currentDateKey
        );
        updates.VACATION = true;
        }

        if (isIdempotencyAlreadyUsedError(thirteenthMonthError)) {
        markCalculatedTodayInStorage(
            businessId,
            employeeId,
            "THIRTEENTH_MONTH",
            currentDateKey
        );
        updates.THIRTEENTH_MONTH = true;
        }

        if (isIdempotencyAlreadyUsedError(indemnificationError)) {
        markCalculatedTodayInStorage(
            businessId,
            employeeId,
            "SEVERANCE",
            currentDateKey
        );
        updates.SEVERANCE = true;
        }

        if (Object.keys(updates).length > 0) {
        setCalculatedToday((prev) => ({ ...prev, ...updates }));
        }
    }, [
        businessId,
        employeeId,
        vacationError,
        thirteenthMonthError,
        indemnificationError,
    ]);

    const anyCalculating = loadingVacation || loadingThirteenthMonth || loadingIndemnification;

    const calculationErrors = [
        vacationError &&
        !isIdempotencyAlreadyUsedError(vacationError) && {
            label: "Vacaciones",
            message: vacationError,
        },
        thirteenthMonthError &&
        !isIdempotencyAlreadyUsedError(thirteenthMonthError) && {
            label: "Décimo tercer mes",
            message: thirteenthMonthError,
        },
        indemnificationError &&
        !isIdempotencyAlreadyUsedError(indemnificationError) && {
            label: "Indemnización",
            message: indemnificationError,
        },
    ].filter(Boolean) as { label: string; message: string }[];

    const lockBenefitForToday = (benefitKey: BenefitCalcKey) => {
        const currentDateKey = getManaguaDateKey();
        setTodayKey(currentDateKey);
        markCalculatedTodayInStorage(
        businessId,
        employeeId,
        benefitKey,
        currentDateKey
        );
        setCalculatedToday((prev) => ({ ...prev, [benefitKey]: true }));
    };

    const handleCalculateVacation = async () => {
        try {
            const result = await calculateVacation();
            if (!isIdempotencyAlreadyUsedError(result)) {
                lockBenefitForToday("VACATION");
            }
        } catch (err) {
            if (isIdempotencyAlreadyUsedError(err)) {
                lockBenefitForToday("VACATION");
            }
        } finally {
            await refresh();
        }
    };

    const handleCalculateThirteenthMonth = async () => {
        try {
            const result = await calculateThirteenthMonth();
            if (!isIdempotencyAlreadyUsedError(result)) {
                lockBenefitForToday("THIRTEENTH_MONTH");
            }
        } catch (err) {
            if (isIdempotencyAlreadyUsedError(err)) {
                lockBenefitForToday("THIRTEENTH_MONTH");
            }
        } finally {
            await refresh();
        }
    };

    const handleCalculateIndemnification = async () => {
        try {
            const result = await calculateIndemnification();
            if (!isIdempotencyAlreadyUsedError(result)) {
                lockBenefitForToday("SEVERANCE");
            }
        } catch (err) {
            if (isIdempotencyAlreadyUsedError(err)) {
                lockBenefitForToday("SEVERANCE");
            }
        } finally {
            await refresh();
        }
    };

    void todayKey;

    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-slate-50/60"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-violet-50 p-2 text-violet-600">
                        <Gift className="h-5 w-5" />
                    </div>

                    <div>
                        <h3 className="text-base font-bold text-slate-900">
                        Beneficios del empleado
                        </h3>

                        <p className="mt-0.5 text-xs text-slate-500">
                        Beneficios asignados y saldos disponibles.
                        </p>
                    </div>

                    {!loading && (
                        <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">
                        {benefits.length}
                        </span>
                    )}
                </div>
                <ChevronDown
                    className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </button>

            <div
                className={`grid transition-all duration-300 ease-in-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
            >
                <div className="overflow-hidden">
                    <div className="px-6 pt-2 pb-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <CalculateBenefitButton
                                title="Vacaciones"
                                theme="emerald"
                                isLoading={loadingVacation}
                                isCalculatedToday={calculatedToday.VACATION}
                                disabled={anyCalculating && !loadingVacation}
                                onClick={() => void handleCalculateVacation()}
                                icon={<Palmtree className="h-5 w-5" />}
                            />

                            <CalculateBenefitButton
                                title="Décimo tercer mes"
                                theme="blue"
                                isLoading={loadingThirteenthMonth}
                                isCalculatedToday={calculatedToday.THIRTEENTH_MONTH}
                                disabled={anyCalculating && !loadingThirteenthMonth}
                                onClick={() => void handleCalculateThirteenthMonth()}
                                icon={<Gift className="h-5 w-5" />}
                            />

                            <CalculateBenefitButton
                                title="Indemnización"
                                theme="violet"
                                isLoading={loadingIndemnification}
                                isCalculatedToday={calculatedToday.SEVERANCE}
                                disabled={anyCalculating && !loadingIndemnification}
                                onClick={() => void handleCalculateIndemnification()}
                                icon={<Wallet className="h-5 w-5" />}
                            />
                        </div>

                        {calculationErrors.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {calculationErrors.map((err) => (
                                <div
                                    key={err.label}
                                    className="flex items-start gap-2.5 rounded-xl border border-red-200/80 bg-red-50/90 px-3.5 py-2.5 text-xs text-red-700"
                                >
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                                    <div>
                                    <span className="font-bold">{err.label}: </span>
                                    <span>{err.message}</span>
                                    </div>
                                </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="border-t border-slate-100 px-6 pb-6 pt-6">
                        {loading && (
                            <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
                                <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
                                Cargando beneficios...
                            </div>
                        )}

                        {!loading && error && (
                            <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                                <p className="text-sm font-medium text-red-600">{error}</p>

                                <button
                                type="button"
                                onClick={() => void refresh()}
                                className="mt-2 text-xs font-bold text-red-700 hover:underline"
                                >
                                Reintentar
                                </button>
                            </div>
                        )}

                        {!loading && !error && benefits.length === 0 && (
                            <div className="py-8 text-center">
                                <Gift className="mx-auto h-9 w-9 text-slate-300" />

                                <p className="mt-3 text-sm font-semibold text-slate-700">
                                    No hay beneficios calculados
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Puedes utilizar los botones superiores para calcular los
                                    beneficios de este empleado.
                                </p>
                            </div>
                        )}

                        {!loading && !error && benefits.length > 0 && (
                            <div className="space-y-4">
                                {benefits.map((benefit, index) => {
                                    const isActive = benefit.status === "ACTIVE";
                                    const isLast = index === benefits.length - 1;
                                    const isCurrency = benefit.unit === "CURRENCY";

                                    return (
                                        <div key={benefit.id} className="relative flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div
                                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                                                        isActive
                                                        ? "bg-violet-50 text-violet-600"
                                                        : "bg-slate-100 text-slate-500"
                                                    }`}
                                                >
                                                    {isCurrency ? (
                                                        <Coins className="h-4 w-4" />
                                                    ) : (
                                                        <CalendarCheck className="h-4 w-4" />
                                                    )}
                                                </div>

                                                {!isLast && (
                                                    <div className="mt-2 h-full w-px bg-slate-200" />
                                                )}
                                            </div>

                                            <div className="mb-4 flex-1 rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition-colors hover:border-slate-200 hover:bg-slate-50">
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h4 className="text-sm font-bold text-slate-900">
                                                                {benefit.name}
                                                            </h4>

                                                            <BenefitStatusBadge status={benefit.status} />
                                                        </div>

                                                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                                                            <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                                                <Gift className="h-3.5 w-3.5 text-slate-400" />
                                                                    {getBenefitTypeLabel(benefit.type)}
                                                            </span>

                                                            <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                                                <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                                                                    {getBenefitModeLabel(benefit.benefit_mode)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="shrink-0 text-left sm:text-right">
                                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                                            Acumulación
                                                        </p>

                                                        <p className="mt-1 text-lg font-bold text-violet-700">
                                                            {formatBalance(benefit.balance, benefit.unit)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-200/70 pt-3">
                                                    <div className="flex items-center gap-2">
                                                        <CalendarDays className="h-3.5 w-3.5 text-slate-400" />

                                                        <span className="text-xs text-slate-500">
                                                            Inicio:{" "}
                                                            <span className="font-semibold text-slate-700">
                                                                {formatDate(benefit.start_date)}
                                                            </span>
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Wallet className="h-3.5 w-3.5 text-slate-400" />

                                                        <span className="text-xs text-slate-500">
                                                            {benefit.end_date ? (
                                                                <>
                                                                Finaliza:{" "}
                                                                <span className="font-semibold text-slate-700">
                                                                    {formatDate(benefit.end_date)}
                                                                </span>
                                                                </>
                                                            ) : (
                                                                <span className="font-semibold text-emerald-600">
                                                                Vigencia indefinida
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex justify-end border-t border-slate-200/70 pt-3">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                        router.push(
                                                            `/payroll/benefit/employee/${benefit.id}`
                                                        )
                                                        }
                                                        className="inline-flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 transition-colors hover:bg-violet-100"
                                                    >
                                                        Administrar beneficio
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}