import { PAYROLL_STATUS_STYLES } from "../constants/payroll-status";

export function getPayrollStatus(status: string) {
    if (Object.prototype.hasOwnProperty.call(
        PAYROLL_STATUS_STYLES,
        status
    )) {
        return PAYROLL_STATUS_STYLES[
        status as keyof typeof PAYROLL_STATUS_STYLES
        ];
    }

    return {
        label: status || "Desconocido",
        className:
        "border-slate-200/80 bg-slate-100/80 text-slate-700",
        dot: "bg-slate-400",
    };
}