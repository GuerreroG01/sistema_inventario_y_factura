"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, UserCheck, UserX, BriefcaseBusiness, Eye,
    Edit, MoreVertical, Plus, CalendarDays, DollarSign
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Employee, CreateEmployeeData, UpdateEmployeeData, } from "@/types/worksheet/employee/Employee";
import {EmployeeModal} from "./EmployeeModal";
import { formatDate } from "../[id]/utils/formatDate";

type EmployeeManagerProps = {
    employees: Employee[];
    totalEmployees: number;
    activeEmployees: number;
    inactiveEmployees: number;
    totalSalaries: number;
    loading: boolean;
    loadingSummary: boolean;
    error: string | null;
    createEmployee: (
        employee: CreateEmployeeData
    ) => Promise<Employee>;
    updateEmployee: (
        id: number,
        employee: UpdateEmployeeData
    ) => Promise<Employee>;
    onChangeStatus: (employee: Employee) => void;
};

export default function EmployeeManager({
    employees, loading, error, createEmployee, updateEmployee, onChangeStatus, loadingSummary, totalEmployees, 
    activeEmployees, inactiveEmployees, totalSalaries
}: EmployeeManagerProps) {
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    const openCreateModal = () => {
        setSelectedEmployee(null);
        setIsModalOpen(true);
    };
    const openEditModal = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedEmployee(null);
    };
    const handleSubmit = async (
        data: CreateEmployeeData | UpdateEmployeeData
    ) => {
        if (selectedEmployee) {
            await updateEmployee(
                selectedEmployee.id,
                data as UpdateEmployeeData
            );
        } else {
            await createEmployee(
                data as CreateEmployeeData
            );
        }
    };

    return (
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-b from-slate-50/50 to-white p-6 md:p-10 shadow-sm">
            <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-indigo-100/60 blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-8">

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-slate-900">
                            <div className="rounded-2xl bg-blue-600 p-2.5 text-white shadow-md shadow-blue-500/20">
                                <Users className="h-6 w-6" />
                            </div>

                            Empleados
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Administra la información, estado y datos laborales
                            de los empleados del negocio.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        Nuevo empleado
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Empleados registrados
                                </p>

                                {loadingSummary ? (
                                    <div className="mt-2 h-8 w-16 rounded-lg bg-slate-200 animate-pulse" />
                                ) : (
                                    <p className="mt-2 text-2xl font-extrabold text-slate-900">
                                        {totalEmployees}
                                    </p>
                                )}
                            </div>

                            <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                                <Users className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Empleados activos
                                </p>

                                {loadingSummary ? (
                                    <div className="mt-2 h-8 w-16 rounded-lg bg-slate-200 animate-pulse" />
                                ) : (
                                    <p className="mt-2 text-2xl font-extrabold text-emerald-600">
                                        {activeEmployees}
                                    </p>
                                )}
                            </div>

                            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                                <UserCheck className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Empleados inactivos
                                </p>

                                {loadingSummary ? (
                                    <div className="mt-2 h-8 w-16 rounded-lg bg-slate-200 animate-pulse" />
                                ) : (
                                    <p className="mt-2 text-2xl font-extrabold text-rose-600">
                                        {inactiveEmployees}
                                    </p>
                                )}
                            </div>

                            <div className="rounded-2xl bg-rose-50 p-3 text-rose-600">
                                <UserX className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Salarios activos
                                </p>

                                {loadingSummary ? (
                                    <div className="mt-2 h-8 w-28 rounded-lg bg-slate-200 animate-pulse" />
                                ) : (
                                    <p className="mt-2 text-2xl font-extrabold text-violet-600">
                                        ${totalSalaries.toLocaleString("en-US")}
                                    </p>
                                )}
                            </div>

                            <div className="rounded-2xl bg-violet-50 p-3 text-violet-600">
                                <DollarSign className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[1, 2, 3].map((n) => (
                            <div
                                key={n}
                                className="h-72 rounded-2xl border border-slate-200 bg-slate-100/60 animate-pulse p-6"
                            />
                        ))}
                    </div>
                ) : employees.length === 0 ? (

                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/50 p-12 text-center">
                        <div className="rounded-full bg-slate-100 p-4 text-slate-400 mb-3">
                            <Users className="h-8 w-8" />
                        </div>

                        <h3 className="text-base font-semibold text-slate-800">
                            No hay empleados registrados
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                            Comienza agregando el primer empleado.
                        </p>
                    </div>

                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {employees.map((employee) => {
                            const isActive =
                                employee.status === "ACTIVE";

                            const isMenuOpen =
                                openMenuId === employee.id;

                            const initials =
                                `${employee.first_name?.[0] ?? ""}${employee.last_name?.[0] ?? ""}`
                                    .toUpperCase();

                            return (
                                <div
                                    key={employee.id}
                                    className={`group relative flex flex-col justify-between rounded-2xl border p-6 shadow-sm transition-all duration-300 ${
                                        isActive
                                            ? "border-slate-200 bg-white hover:shadow-xl hover:border-blue-200"
                                            : "border-slate-200 bg-slate-50 opacity-70"
                                    }`}
                                >
                                    <div>

                                        <div className="flex items-start justify-between relative">

                                            <div className="flex items-center gap-3">

                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm shadow-md shadow-blue-500/20">
                                                    {initials || "EM"}
                                                </div>

                                                <div className="min-w-0">
                                                    <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                                        {employee.first_name}{" "}
                                                        {employee.last_name}
                                                    </h2>

                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        Código:{" "}
                                                        <span className="font-semibold text-slate-600">
                                                            {employee.employee_code}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setOpenMenuId(
                                                            isMenuOpen
                                                                ? null
                                                                : employee.id
                                                        )
                                                    }
                                                    className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </button>

                                                {isMenuOpen && (
                                                    <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg z-20 animate-in fade-in zoom-in-95 duration-150">

                                                        <Link
                                                            href={`/employee/${employee.id}`}
                                                            onClick={() => setOpenMenuId(null)}
                                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                                                        >
                                                            <Eye className="h-3.5 w-3.5 text-slate-400" />
                                                            Ver detalles
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setOpenMenuId(null);
                                                                openEditModal(employee);
                                                            }}
                                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                                                        >
                                                            <Edit className="h-3.5 w-3.5 text-slate-400" />
                                                            Editar
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setOpenMenuId(null);
                                                                onChangeStatus(employee);
                                                            }}
                                                            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                                                                isActive
                                                                    ? "text-amber-600 hover:bg-amber-50"
                                                                    : "text-emerald-600 hover:bg-emerald-50"
                                                            }`}
                                                        >
                                                            {isActive ? (
                                                                <>
                                                                    <UserX className="h-3.5 w-3.5" />
                                                                    Desactivar
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <UserCheck className="h-3.5 w-3.5" />
                                                                    Activar
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-6 rounded-2xl bg-slate-50/80 p-4 border border-slate-100 space-y-3">

                                            <div className="flex items-center gap-2.5">
                                                <BriefcaseBusiness className="h-4 w-4 shrink-0 text-slate-400" />

                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                                        Puesto
                                                    </p>

                                                    <p className="text-xs font-semibold text-slate-700 truncate">
                                                        {employee.position ||
                                                            "Sin puesto asignado"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2.5">
                                                <Users className="h-4 w-4 shrink-0 text-slate-400" />

                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                                        Departamento
                                                    </p>

                                                    <p className="text-xs font-semibold text-slate-700 truncate">
                                                        {employee.department ||
                                                            "Sin departamento"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2.5 pt-2 border-t border-slate-200/60">
                                                <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />

                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                                        Fecha de ingreso
                                                    </p>

                                                    <p className="text-xs font-semibold text-slate-700">
                                                        {employee.hire_date
                                                            ? formatDate(employee.hire_date)
                                                            : "Sin fecha"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Estado
                                        </span>

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

                                            {isActive
                                                ? "Activo"
                                                : "Inactivo"}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                <EmployeeModal
                    open={isModalOpen}
                    employee={selectedEmployee}
                    onClose={closeModal}
                    onSave={handleSubmit}
                />
            </div>
        </section>
    );
}