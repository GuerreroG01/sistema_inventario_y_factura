import { EmployeeSalaryHistory } from "@/types/worksheet/employee/Salary";

export function getSalaryTypeLabel(
    type: EmployeeSalaryHistory["salary_type"]
) {
    const labels: Record<
        EmployeeSalaryHistory["salary_type"],
        string
    > = {
        MONTHLY: "Mensual",
        WEEKLY: "Semanal",
        DAILY: "Diario",
        HOURLY: "Por hora",
    };

    return labels[type];
}
export function SalaryStatusBadge({
    effective_from,
    effective_to,
}: {
    effective_from?: string | null;
    effective_to?: string | null;
}) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const effectiveFrom = effective_from
        ? new Date(effective_from)
        : null;

    const effectiveTo = effective_to
        ? new Date(effective_to)
        : null;

    if (effectiveFrom) {
        effectiveFrom.setHours(0, 0, 0, 0);
    }

    if (effectiveTo) {
        effectiveTo.setHours(0, 0, 0, 0);
    }

    let status: "ACTIVE" | "ENDED" | "SCHEDULED";

    if (effectiveFrom && effectiveFrom > today) {
        status = "SCHEDULED";
    } else if (effectiveTo && effectiveTo < today) {
        status = "ENDED";
    } else {
        status = "ACTIVE";
    }

    const config = {
        ACTIVE: {
            label: "Activo",
            className: "bg-emerald-50 text-emerald-700",
        },
        ENDED: {
            label: "Finalizado",
            className: "bg-rose-50 text-rose-700",
        },
        SCHEDULED: {
            label: "Programado",
            className: "bg-amber-50 text-amber-700",
        },
    };

    const current = config[status];

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${current.className}`}
        >
            {current.label}
        </span>
    );
}
