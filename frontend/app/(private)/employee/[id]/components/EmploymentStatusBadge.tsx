import { EmployeeEmployment } from "@/types/worksheet/employee/Employment";

export function getEmploymentTypeLabel(
    type: EmployeeEmployment["employment_type"]
) {
    const labels: Record<
        EmployeeEmployment["employment_type"],
        string
    > = {
        FULL_TIME: "Tiempo completo",
        PART_TIME: "Medio tiempo",
        TEMPORARY: "Temporal",
        CONTRACTOR: "Contratista",
    };

    return labels[type];
}

export function getEmploymentStatusLabel(
    status: EmployeeEmployment["status"]
) {
    const labels: Record<
        EmployeeEmployment["status"],
        string
    > = {
        ACTIVE: "Activo",
        INACTIVE: "Inactivo",
        ENDED: "Finalizado",
    };

    return labels[status];
}

export function EmploymentStatusBadge({ status, endDate }: {
    status: EmployeeEmployment["status"];
    endDate?: string | null;
}) {
    const today = new Date();

    const hasEnded =
        endDate && new Date(endDate) < today;

    const config = {
        ACTIVE: {
            label: "Activo",
            className: "bg-emerald-50 text-emerald-700",
        },
        INACTIVE: {
            label: "Inactivo",
            className: "bg-slate-100 text-slate-500",
        },
        ENDED: {
            label: hasEnded
                ? "Finalizado"
                : "Programado para finalizar",
            className: hasEnded
                ? "bg-rose-50 text-rose-700"
                : "bg-amber-50 text-amber-700",
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