export const PAYROLL_STATUS_STYLES = {
    DRAFT: {
        label: "Borrador",
        className:
            "border-slate-200/80 bg-slate-100/80 text-slate-700",
        dot: "bg-slate-500",
    },
    CALCULATED: {
        label: "Calculado",
        className:
            "border-blue-200/80 bg-blue-50/90 text-blue-700",
        dot: "bg-blue-500",
    },
    APPROVED: {
        label: "Aprobado",
        className:
            "border-indigo-200/80 bg-indigo-50/90 text-indigo-700",
        dot: "bg-indigo-500",
    },
    PAID: {
        label: "Pagado",
        className:
            "border-emerald-200/80 bg-emerald-50/90 text-emerald-700",
        dot: "bg-emerald-500",
    },
    CLOSED: {
        label: "Cerrado",
        className:
            "border-slate-300/80 bg-slate-200/80 text-slate-800",
        dot: "bg-slate-600",
    },
} as const;

export type PayrollStatus = keyof typeof PAYROLL_STATUS_STYLES;