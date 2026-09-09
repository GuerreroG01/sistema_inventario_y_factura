"use client";

import { useState } from "react";
import { CircleDollarSign, Plus } from "lucide-react";
import { useSalary } from "../../hooks/useSalary";
import { useCreateSalary } from "../hooks/useCreateSalary";
import { EmployeeInfoSkeleton } from "./EmployeeInfoSkeleton";
import { CurrentSalary } from "./CurrentSalary";
import { SalaryHistory } from "./SalaryHistory";
import { EmployeeAssignmentModal } from "./EmployeeAsignmentModal";

type SalaryInfoProps = {
    employeeId: number;
};

export default function SalaryInfo({ employeeId }: SalaryInfoProps) {
    const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);

    const { currentSalary, salaryHistory, loading, error, fetchSalary } = useSalary(employeeId);
    const { 
        createSalary, loading: loadingCreate, error: createError, clearError: clearCreateError
    } = useCreateSalary(employeeId);

    const handleCreateSalary = async ( data: Parameters<typeof createSalary>[0] ) => {
        await createSalary(data);
        await fetchSalary();
        setIsSalaryModalOpen(false);
    };

    if (loading) {
        return <EmployeeInfoSkeleton />;
    }

    const noActiveEmployment =
        error === "El empleado no tiene un salario asignado";

    const hasNoSalary =
        salaryHistory.length === 0 || noActiveEmployment;

    if (hasNoSalary) {
        return (
            <>
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
                    <div className="mb-4 rounded-full bg-blue-100 p-4 text-blue-500">
                        <CircleDollarSign className="h-8 w-8" />
                    </div>

                    <h3 className="text-base font-semibold text-slate-800">
                        Sin salario configurado
                    </h3>

                    <p className="mt-1 max-w-md text-sm text-slate-500">
                        Este empleado todavía no tiene un salario
                        configurado. Puedes asignarle un salario para
                        comenzar a gestionar su información salarial.
                    </p>

                    <button
                        type="button"
                        onClick={() => setIsSalaryModalOpen(true)}
                        className="
                            mt-5
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            bg-blue-600
                            px-4
                            py-2.5
                            text-sm
                            font-semibold
                            text-white
                            shadow-md
                            shadow-blue-500/20
                            transition-colors
                            hover:bg-blue-700
                        "
                    >
                        <Plus className="h-4 w-4" />
                        Asignar salario
                    </button>
                </div>

                <EmployeeAssignmentModal
                    open={isSalaryModalOpen}
                    mode="salary"
                    onClose={() => setIsSalaryModalOpen(false)}
                    onSubmit={handleCreateSalary}
                    loading={loadingCreate}
                    createError={createError}
                    onClearError={clearCreateError}
                />
            </>
        );
    }
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-rose-200 bg-rose-50/50 p-12 text-center">
                <div className="mb-4 rounded-full bg-rose-100 p-4 text-rose-500">
                    <CircleDollarSign className="h-8 w-8" />
                </div>

                <h3 className="text-base font-semibold text-slate-800">
                    No se pudo obtener la información salarial
                </h3>

                <p className="mt-1 max-w-md text-sm text-slate-500">
                    {error}
                </p>

                <button
                    type="button"
                    onClick={fetchSalary}
                    className="
                        mt-5
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        bg-blue-600
                        px-4
                        py-2.5
                        text-sm
                        font-semibold
                        text-white
                        shadow-md
                        shadow-blue-500/20
                        transition-colors
                        hover:bg-blue-700
                    "
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <CurrentSalary
                salary={currentSalary}
                onOpenCreateSalary={() =>
                    setIsSalaryModalOpen(true)
                }
            />

            <SalaryHistory
                salaryHistory={salaryHistory}
            />

            <EmployeeAssignmentModal
                open={isSalaryModalOpen}
                mode="salary"
                onClose={() => setIsSalaryModalOpen(false)}
                onSubmit={handleCreateSalary}
                loading={loadingCreate}
                createError={createError}
                onClearError={clearCreateError}
            />
        </div>
    );
}
/* Falta ver si hay errores para mostrar el modalError en el otro modal de Employment y ver si talves se corrige ese desface
aparente al cerrar el modalError en el modal de salario que es solo con ese componente que ocurre eso con los demás funciona bien */