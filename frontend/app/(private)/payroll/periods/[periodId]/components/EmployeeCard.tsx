"use client";

import { useEffect, useRef } from "react";
import { BadgeCheck, ChevronDown, CircleDollarSign, UserRound, Wallet } from "lucide-react";
import type { usePayrollPeriodDetails } from "../hooks/usePayrollPeriodDetails";
import PayrollConceptsTable from "./ConceptsTable";

type Hook = ReturnType<typeof usePayrollPeriodDetails>;
type Employee = NonNullable<Hook["summary"]>["employees"][number];

interface Props {
    employee: Employee;
    isSelected: boolean;
    items: Hook["items"];
    loadingItems: boolean;
    itemsError: string | null;
    onSelect: Hook["fetchEmployeeItems"];
    onClear: Hook["clearEmployeeItems"];
}

const currencyFormatter = new Intl.NumberFormat("es-NI", {
    style: "currency",
    currency: "NIO",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export default function EmployeeCard({
    employee, isSelected, items, loadingItems, itemsError, onSelect, onClear,
}: Props) {
    const cardRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (isSelected && cardRef.current) {
            const timeoutId = setTimeout(() => {
                cardRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                });
            }, 100);

            return () => clearTimeout(timeoutId);
        }
    }, [isSelected]);

    function handleToggle() {
        if (isSelected) {
            onClear();
        } else {
            void onSelect(employee.payroll_employee_id);
        }
    }

    const initials = employee.employee_name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join("")
        .toUpperCase();

    const grossSalary = (employee as any).gross_salary ?? null;
    const netSalary = (employee as any).net_salary ?? null;

    const formattedGross =
        grossSalary == null
            ? "N/D"
            : currencyFormatter.format(Number(grossSalary));

    const formattedNet =
        netSalary == null
            ? "No disponible"
            : currencyFormatter.format(Number(netSalary));

    return (
        <article
            ref={cardRef}
            className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 scroll-mt-6 ${
                isSelected
                    ? "border-blue-500/40 bg-white shadow-xl shadow-blue-500/5 ring-2 ring-blue-500/20"
                    : "border-slate-200/90 bg-white shadow-xs hover:border-slate-300 hover:shadow-md"
            }`}
        >
            <div
                aria-hidden="true"
                className={`absolute inset-y-0 left-0 w-1.5 transition-all duration-300 ${
                    isSelected
                        ? "bg-blue-600"
                        : "bg-transparent group-hover:bg-slate-300"
                }`}
            />
            <div 
                onClick={handleToggle}
                className="relative flex cursor-pointer flex-col gap-4 p-4 pl-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5 sm:pl-6 select-none"
            >
                <div className="flex min-w-0 items-center gap-4">
                    <div
                        className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold tracking-wider transition-all duration-300 sm:h-13 sm:w-13 ${
                            isSelected
                                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                                : "bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600"
                        }`}
                        aria-hidden="true"
                    >
                        {initials || <UserRound className="h-6 w-6" />}

                        {isSelected && (
                            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs ring-2 ring-white">
                                <BadgeCheck className="h-3.5 w-3.5" />
                            </span>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                            {employee.employee_name}
                        </h3>

                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                ID: #{employee.employee_id}
                            </span>

                            {isSelected && (
                                <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/10">
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600" />
                                    Detalle activo
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3 sm:justify-end sm:border-0 sm:pt-0">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex flex-col sm:text-right">
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:justify-end">
                                <Wallet className="h-3 w-3 text-slate-400" />
                                Bruto
                            </span>
                            <span className="mt-0.5 text-xs font-semibold tabular-nums text-slate-600 sm:text-sm">
                                {formattedGross}
                            </span>
                        </div>

                        <div className="h-8 w-px bg-slate-200" aria-hidden="true" />
                        <div className="flex flex-col sm:text-right">
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 sm:justify-end">
                                <CircleDollarSign className="h-3.5 w-3.5 text-emerald-500" />
                                Neto
                            </span>
                            <span className="mt-0.5 text-base font-bold tabular-nums text-slate-900 sm:text-lg">
                                {formattedNet}
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        aria-expanded={isSelected}
                        aria-label={`${
                            isSelected ? "Ocultar conceptos de" : "Ver conceptos de"
                        } ${employee.employee_name}`}
                        onClick={(e) => {
                            e.stopPropagation(); // Evita doble evento si se hace clic directo en el botón
                            handleToggle();
                        }}
                        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:scale-95 sm:h-11 sm:w-11 ${
                            isSelected
                                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700"
                                : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                        }`}
                    >
                        <ChevronDown
                            className={`h-5 w-5 transition-transform duration-300 ${
                                isSelected ? "rotate-180" : ""
                            }`}
                        />
                    </button>
                </div>
            </div>
            <div
                id={`employee-details-${employee.payroll_employee_id}`}
                aria-hidden={!isSelected}
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                    isSelected
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                }`}
            >
                <div className="min-h-0 overflow-hidden">
                    {isSelected && (
                        <div className="border-t border-slate-100 bg-slate-50/70 p-4 sm:p-6">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">
                                        Desglose de Conceptos
                                    </h4>
                                    <p className="text-xs text-slate-500">
                                        Percepciones, deducciones y aportes patronales aplicados
                                    </p>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
                                <PayrollConceptsTable
                                    items={items}
                                    loading={loadingItems}
                                    error={itemsError}
                                    onRetry={() =>
                                        onSelect(employee.payroll_employee_id)
                                    }
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}