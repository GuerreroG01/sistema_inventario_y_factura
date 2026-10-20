
import { Users, UserRound, ArrowDownWideNarrow } from "lucide-react";

import type { usePayrollPeriodDetails } from "../hooks/usePayrollPeriodDetails";
import PayrollEmployeeCard from "./EmployeeCard";

type Hook = ReturnType<typeof usePayrollPeriodDetails>;
type Summary = NonNullable<Hook["summary"]>;

interface Props {
    employees: Summary["employees"];
    selectedEmployeeId: Hook["selectedEmployeeId"];
    items: Hook["items"];
    loadingItems: boolean;
    itemsError: string | null;
    onSelect: Hook["fetchEmployeeItems"];
    onClear: Hook["clearEmployeeItems"];
}

export default function EmployeeList({
    employees,
    selectedEmployeeId,
    items,
    loadingItems,
    itemsError,
    onSelect,
    onClear,
}: Props) {
    const employeeCount = employees.length;

    return (
        <section
        aria-labelledby="payroll-employees-title"
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
        <header className="flex flex-col gap-4 border-b border-slate-100 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-100">
                <Users className="h-5 w-5" aria-hidden="true" />
            </div>

            <div className="min-w-0">
                <h2
                id="payroll-employees-title"
                className="text-base font-bold tracking-tight text-slate-900 sm:text-lg"
                >
                Empleados de la nómina
                </h2>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                Selecciona un empleado para consultar el desglose
                de sus conceptos salariales.
                </p>
            </div>
            </div>

            <div className="flex items-center gap-2 self-start rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 sm:self-center">
            <UserRound
                className="h-4 w-4 text-slate-500"
                aria-hidden="true"
            />

            <span className="text-sm font-semibold tabular-nums text-slate-700">
                {employeeCount.toLocaleString("es-NI")}
            </span>

            <span className="text-sm text-slate-500">
                {employeeCount === 1 ? "empleado" : "empleados"}
            </span>
            </div>
        </header>

        <div className="p-3 sm:p-5">
            {employeeCount > 0 ? (
            <div className="space-y-3">
                {employees.map((employee) => (
                <PayrollEmployeeCard
                    key={employee.payroll_employee_id}
                    employee={employee}
                    isSelected={
                    selectedEmployeeId === employee.payroll_employee_id
                    }
                    items={items}
                    loadingItems={loadingItems}
                    itemsError={itemsError}
                    onSelect={onSelect}
                    onClear={onClear}
                />
                ))}
            </div>
            ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
                <ArrowDownWideNarrow
                    className="h-5 w-5"
                    aria-hidden="true"
                />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-slate-800">
                No hay empleados para mostrar
                </h3>

                <p className="mt-1 max-w-sm text-sm leading-5 text-slate-500">
                No se encontraron empleados asociados a este
                período de nómina.
                </p>
            </div>
            )}
        </div>
        </section>
    );
}
