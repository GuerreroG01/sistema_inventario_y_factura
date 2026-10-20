import type { PayrollPeriodStatus } from "@/types/worksheet/payroll/PayrollPeriod";

type PayrollPeriodStatusConfig = {
    label: string;
    color: string;
    bg: string;
    border: string;
    dot: string;
};

export const PAYROLL_PERIOD_STATUS_CONFIG: Record<
    PayrollPeriodStatus, PayrollPeriodStatusConfig
> = {
    DRAFT: {
        label: "Borrador",
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-100",
        dot: "bg-amber-500",
    },
    CALCULATED: {
        label: "Calculado",
        color: "text-purple-600",
        bg: "bg-purple-50",
        border: "border-purple-100",
        dot: "bg-purple-500",
    },
    APPROVED: {
        label: "Aprobado",
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-100",
        dot: "bg-blue-500",
    },
    PAID: {
        label: "Pagado",
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        dot: "bg-emerald-500",
    },
    CANCELLED: {
        label: "Cancelado",
        color: "text-rose-600",
        bg: "bg-rose-50",
        border: "border-rose-100",
        dot: "bg-rose-500",
    },
};

export const PAYROLL_PERIOD_STATUSES: PayrollPeriodStatus[] = [
    "DRAFT",
    "CALCULATED",
    "APPROVED",
    "PAID",
    "CANCELLED",
];

export const PAYROLL_PERIOD_VALID_TRANSITIONS: Record<
    PayrollPeriodStatus,
    PayrollPeriodStatus[]
> = {
    DRAFT: ["CALCULATED", "CANCELLED"],
    CALCULATED: ["DRAFT", "APPROVED", "CANCELLED"],
    APPROVED: ["CALCULATED", "PAID", "CANCELLED"],
    PAID: [],
    CANCELLED: [],
};