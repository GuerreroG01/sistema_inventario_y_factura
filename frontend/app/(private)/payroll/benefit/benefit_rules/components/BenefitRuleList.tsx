
"use client";

import { useState } from "react";
import { CalendarDays, MoreVertical, Building2, Power, Pencil, DollarSign, ReceiptText,
    Wallet, Plane, Gift, Utensils, Bus, ShieldCheck, Clock, Calculator, Sparkles
} from "lucide-react";
import { BenefitRule, BenefitType } from "@/types/worksheet/benefit/BenefitRule";

type BenefitRuleListProps = {
    rules: BenefitRule[];
    loading: boolean;
    error: string | null;
    onEdit?: (rule: BenefitRule) => void;
    onCreateVersion?: (rule: BenefitRule) => void;
    onChangeStatus?: (
        id: number,
        active: boolean
    ) => Promise<BenefitRule>;
};

const typeConfig: Record<
    BenefitType,
    {
        label: string;
        icon: typeof Wallet;
        color: string;
        bg: string;
        border: string;
        dot: string;
    }
> = {
    VACATION: {
        label: "Vacaciones",
        icon: Plane,
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-100",
        dot: "bg-blue-500",
    },

    THIRTEENTH_MONTH: {
        label: "Décimo tercer mes",
        icon: Gift,
        color: "text-violet-600",
        bg: "bg-violet-50",
        border: "border-violet-100",
        dot: "bg-violet-500",
    },

    SEVERANCE: {
        label: "Indemnización",
        icon: ShieldCheck,
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-100",
        dot: "bg-amber-500",
    },

    TRANSPORT: {
        label: "Transporte",
        icon: Bus,
        color: "text-cyan-600",
        bg: "bg-cyan-50",
        border: "border-cyan-100",
        dot: "bg-cyan-500",
    },

    FOOD: {
        label: "Alimentación",
        icon: Utensils,
        color: "text-orange-600",
        bg: "bg-orange-50",
        border: "border-orange-100",
        dot: "bg-orange-500",
    },

    OTHER: {
        label: "Otro beneficio",
        icon: Sparkles,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        dot: "bg-emerald-500",
    },
};

function formatDate(date: string | null) {
    if (!date) return "Sin fecha";

    const parsedDate = new Date(`${date.slice(0, 10)}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Fecha inválida";
    }

    return parsedDate.toLocaleDateString("es-NI", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatAmount(amount: number | string | null) {
    if (amount === null || amount === "") {
        return "No definido";
    }

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount)) {
        return String(amount);
    }

    return parsedAmount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function formatRuleValue(rule: BenefitRule) {
    if (rule.formula) {
        return {
            value: "Personalizada",
            type: "Fórmula de cálculo",
            icon: Calculator,
        };
    }

    if (rule.amount !== null && rule.amount !== "") {
        return {
            value:
                rule.unit === "CURRENCY"
                    ? formatAmount(rule.amount)
                    : `${formatAmount(rule.amount)} días`,
            type:
                rule.unit === "CURRENCY"
                    ? "Importe monetario"
                    : "Cantidad de días",
            icon:
                rule.unit === "CURRENCY"
                    ? DollarSign
                    : Clock,
        };
    }

    return {
        value: "No definido",
        type: "Sin importe ni fórmula",
        icon: ReceiptText,
    };
}

function getBenefitModeLabel(mode: BenefitRule["benefit_mode"]) {
    switch (mode) {
        case "RECURRING":
            return "Recurrente";

        case "ONE_TIME":
            return "Una sola vez";

        default:
            return mode;
    }
}

function getFrequencyLabel(
    frequency: BenefitRule["frequency"]
) {
    switch (frequency) {
        case "NONE":
            return "Sin frecuencia";

        case "MONTHLY":
            return "Mensual";

        case "BIWEEKLY":
            return "Quincenal";

        case "YEARLY":
            return "Anual";

        case "ON_DEMAND":
            return "Bajo demanda";

        default:
            return frequency;
    }
}

function getScopeLabel(scope: BenefitRule["scope"]) {
    switch (scope) {
        case "GLOBAL":
            return "Global";

        case "EMPLOYEE":
            return "Por empleado";

        default:
            return scope;
    }
}

function getBenefitValue(rule: BenefitRule) {
    const ValueIcon =
        rule.unit === "DAYS" ? CalendarDays : DollarSign;

    let value = "—";
    let detail = "Sin valor definido";

    if (rule.amount !== null && rule.amount !== undefined) {
        const numericAmount = Number(rule.amount);

        value = Number.isFinite(numericAmount)
            ? numericAmount.toLocaleString("es-NI", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
              })
            : String(rule.amount);

        detail =
            rule.unit === "DAYS"
                ? "Días"
                : "Monto monetario";
    } else if (rule.formula) {
        value = "Por fórmula";
        detail = rule.formula;
    }

    return {
        value,
        detail,
        icon: ValueIcon,
    };
}

export default function BenefitRuleList({
    rules, loading, error, onEdit, onChangeStatus
}: BenefitRuleListProps) {
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    if (error) {
        return (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
                {error}
            </div>
        );
    }

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3, 4].map((n) => (
                    <div
                        key={n}
                        className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-slate-100/60"
                    />
                ))}
            </div>
        );
    }

    if (rules.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/50 p-12 text-center">
                <div className="mb-3 rounded-full bg-slate-100 p-4 text-slate-400">
                    <Wallet className="h-8 w-8" />
                </div>

                <h3 className="text-base font-semibold text-slate-800">
                    No hay reglas de beneficios
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                    No se encontraron reglas de beneficios que coincidan
                    con los filtros seleccionados.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {rules.map((rule) => {
                const config = typeConfig[rule.type];
                const TypeIcon = config.icon;
                const benefitValue = getBenefitValue(rule);
                const ValueIcon = benefitValue.icon;
                const isActive = rule.is_active;
                const canActivate = !isActive;
                const canDeactivate = isActive;
                const hasMenuOptions = Boolean(
                    onEdit || onChangeStatus
                );
                const isMenuOpen = openMenuId === rule.id;

                return (
                    <div
                        key={rule.id}
                        className={`group relative rounded-2xl border bg-white shadow-sm transition-all duration-200 ${
                            isActive
                                ? "border-slate-200 hover:border-blue-200 hover:shadow-md"
                                : "border-slate-200 bg-slate-50/80 opacity-70"
                        } ${isMenuOpen ? "z-50" : "z-0"}`}
                    >
                        <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center">
                            <div className="flex min-w-0 flex-1 items-center gap-3 lg:min-w-[220px]">
                                <div
                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${config.bg} ${config.color} shadow-sm`}
                                >
                                    <TypeIcon className="h-5 w-5" />
                                </div>

                                <div className="min-w-0">
                                    <h2
                                        className={`truncate text-sm font-bold text-slate-900 transition-colors ${
                                            isActive
                                                ? "group-hover:text-blue-600"
                                                : ""
                                        }`}
                                    >
                                        {rule.name}
                                    </h2>

                                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                                        {rule.description ||
                                            "Sin descripción"}
                                    </p>
                                </div>
                            </div>
                            <div className="lg:w-[160px]">
                                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 lg:hidden">
                                    Tipo de beneficio
                                </p>

                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${config.bg} ${config.color} ${config.border}`}
                                >
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
                                    />
                                    {config.label}
                                </span>
                            </div>
                            {((rule.amount !== null &&
                                rule.amount !== undefined &&
                                rule.amount !== "") ||
                                (typeof rule.formula === "string" &&
                                    rule.formula.trim() !== "")) && (
                                <div className="flex items-center gap-2 lg:w-[160px]">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                                        <ValueIcon className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                            Valor
                                        </p>

                                        <p className="text-sm font-extrabold text-slate-800">
                                            {benefitValue.value}
                                            {rule.unit === "DAYS" &&
                                                rule.amount !== null &&
                                                rule.amount !== undefined &&
                                                rule.amount !== "" &&
                                                " días"}
                                        </p>

                                        {benefitValue.detail?.trim() && (
                                            <p
                                                title={benefitValue.detail}
                                                className="truncate text-[10px] font-medium text-slate-400"
                                            >
                                                {benefitValue.detail}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="flex min-w-0 items-center gap-2 lg:w-[140px]">
                                <Building2 className="h-4 w-4 shrink-0 text-slate-400" />

                                <div className="min-w-0">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                        Alcance
                                    </p>

                                    <p className="truncate text-xs font-semibold text-slate-700">
                                        {getScopeLabel(rule.scope)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex min-w-0 items-center gap-2 lg:w-[170px]">
                                <ReceiptText className="h-4 w-4 shrink-0 text-slate-400" />

                                <div className="min-w-0">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                        Modalidad
                                    </p>

                                    <p className="truncate text-xs font-semibold text-slate-700">
                                        {getBenefitModeLabel(
                                            rule.benefit_mode
                                        )}
                                    </p>

                                    <p className="truncate text-[10px] text-slate-400">
                                        {getFrequencyLabel(
                                            rule.frequency
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex min-w-0 items-center gap-2 lg:w-[190px]">
                                <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />

                                <div className="min-w-0">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                        Vigencia
                                    </p>

                                    <p className="truncate text-xs font-semibold text-slate-700">
                                        Desde {formatDate(rule.start_date)}
                                    </p>

                                    <p className="truncate text-[10px] text-slate-400">
                                        {rule.end_date
                                            ? `Hasta ${formatDate(
                                                  rule.end_date
                                              )}`
                                            : "Sin fecha de finalización"}
                                    </p>
                                </div>
                            </div>
                            <div className="lg:w-[100px]">
                                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                    Estado
                                </p>

                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                                        isActive
                                            ? "bg-emerald-50 text-emerald-600"
                                            : "bg-rose-50 text-rose-600"
                                    }`}
                                >
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${
                                            isActive
                                                ? "bg-emerald-500"
                                                : "bg-rose-500"
                                        }`}
                                    />

                                    {isActive ? "Activa" : "Inactiva"}
                                </span>
                            </div>
                            {hasMenuOptions && (
                                <div className="relative ml-auto shrink-0">
                                    <button
                                        type="button"
                                        aria-label={`Acciones de ${rule.name}`}
                                        aria-expanded={isMenuOpen}
                                        onClick={() =>
                                            setOpenMenuId(
                                                isMenuOpen ? null : rule.id
                                            )
                                        }
                                        className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </button>

                                    {isMenuOpen && (
                                        <div className="absolute right-0 top-full z-30 mt-1 w-44 animate-in fade-in zoom-in-95 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl duration-150">
                                            {canDeactivate && (
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        setOpenMenuId(null);

                                                        await onChangeStatus!(
                                                            rule.id,
                                                            false
                                                        );
                                                    }}
                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-50"
                                                >
                                                    <Power className="h-3.5 w-3.5" />
                                                    Desactivar
                                                </button>
                                            )}

                                            {canActivate && (
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        setOpenMenuId(null);

                                                        await onChangeStatus!(
                                                            rule.id,
                                                            true
                                                        );
                                                    }}
                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-50"
                                                >
                                                    <Power className="h-3.5 w-3.5" />
                                                    Activar
                                                </button>
                                            )}
                                            {onEdit && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setOpenMenuId(null);
                                                        onEdit(rule);
                                                    }}
                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
                                                >
                                                    <Pencil className="h-3.5 w-3.5 text-blue-500" />
                                                    Editar regla
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}