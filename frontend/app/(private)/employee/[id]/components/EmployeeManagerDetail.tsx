"use client";

import { ArrowLeft, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import EmployeeInfo from "./EmployeeInfo";
import EmploymentInfo from "./EmploymentInfo";
import EmployeeSalaryInfo from "./SalaryInfo";

type EmployeeProps = {
    employeeId: number;
};

export default function EmployeeManagerDetail({ employeeId }: EmployeeProps) {
    const router = useRouter();
    return (
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-b from-slate-50/50 to-white p-6 md:p-2 shadow-sm">
            <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-indigo-100/60 blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-blue-600 p-2.5 text-white shadow-md shadow-blue-500/20">
                                <Users className="h-6 w-6" />
                            </div>

                            <div>
                                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                                    Detalles del empleado
                                </h1>

                                <p className="mt-1 text-sm text-slate-500">
                                    Consulta la información y datos laborales
                                    del empleado.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            rounded-2xl
                            border
                            border-slate-200
                            bg-white
                            px-5
                            py-3
                            text-sm
                            font-semibold
                            text-slate-700
                            shadow-sm
                            transition-all
                            hover:bg-slate-50
                            hover:border-slate-300
                        "
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver
                    </button>
                </div>

                <EmployeeInfo employeeId={employeeId} />
                <EmploymentInfo employeeId={employeeId} />
                <EmployeeSalaryInfo employeeId={employeeId} />
            </div>
        </section>
    );
}
{/*Falta agregar los botones que abran modales para ya sea cambiar el salario o el puesto
    Y botones para terminar una relación laboral */}