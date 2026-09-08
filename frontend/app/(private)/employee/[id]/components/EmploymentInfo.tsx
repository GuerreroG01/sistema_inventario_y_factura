"use client";

import { useState } from "react";
import { Briefcase, Plus } from "lucide-react";

import { EmployeeInfoSkeleton } from "./EmployeeInfoSkeleton";
import { useEmployment } from "../../hooks/useEmployment";
import { CurrentEmployment } from "./CurrentEmployment";
import { EmploymentHistory } from "./EmploymentHistory";
import { EmployeeAssignmentModal } from "./EmployeeAsignmentModal";
import { useCreateEmployment } from "../hooks/useCreateEmployee";

type EmploymentInfoProps = {
    employeeId: number;
};

export default function EmploymentInfo({ employeeId }: EmploymentInfoProps) {
    const [isEmploymentModalOpen, setIsEmploymentModalOpen] = useState(false);

    const {
        currentEmployment, employmentHistory, loading, error, fetchEmployment
    } = useEmployment(employeeId);

    const { createEmployment, loadingCreate } = useCreateEmployment(employeeId);

    const handleCreateEmployment = async ( data: Parameters<typeof createEmployment>[0] ) => {
        try {
            await createEmployment(data);
            await fetchEmployment();
            setIsEmploymentModalOpen(false);
        } catch {
            console.log("Error al crear la relación laboral");
        }
    };

    if (loading) {
        return <EmployeeInfoSkeleton />;
    }

    const NO_ACTIVE_EMPLOYMENT =
        "El empleado no tiene una relación laboral activa";

    const hasNoActiveEmployment =
        error === NO_ACTIVE_EMPLOYMENT;

    if (hasNoActiveEmployment) {
        return (
            <>
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
                    <div className="mb-4 rounded-full bg-blue-100 p-4 text-blue-500">
                        <Briefcase className="h-8 w-8" />
                    </div>

                    <h3 className="text-base font-semibold text-slate-800">
                        Sin relación laboral configurada
                    </h3>

                    <p className="mt-1 max-w-md text-sm text-slate-500">
                        Este empleado todavía no tiene una relación
                        laboral configurada. Puedes asignarle un puesto
                        para comenzar a gestionar su información laboral.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            setIsEmploymentModalOpen(true)
                        }
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
                        Asignar relación laboral
                    </button>
                </div>

                <EmployeeAssignmentModal
                    open={isEmploymentModalOpen}
                    mode="employment"
                    onClose={() =>
                        setIsEmploymentModalOpen(false)
                    }
                    onSubmit={handleCreateEmployment}
                    loading={loadingCreate}
                />
            </>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-rose-200 bg-rose-50/50 p-12 text-center">
                <div className="mb-4 rounded-full bg-rose-100 p-4 text-rose-500">
                    <Briefcase className="h-8 w-8" />
                </div>

                <h3 className="text-base font-semibold text-slate-800">
                    No se pudo obtener la información laboral
                </h3>

                <p className="mt-1 max-w-md text-sm text-slate-500">
                    {error}
                </p>

                <button
                    type="button"
                    onClick={fetchEmployment}
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
            <CurrentEmployment
                employment={currentEmployment}
                onOpenCreateEmployment={() =>
                    setIsEmploymentModalOpen(true)
                }
            />
            <EmploymentHistory
                employmentHistory={employmentHistory}
            />
            <EmployeeAssignmentModal
                open={isEmploymentModalOpen}
                mode="employment"
                onClose={() =>
                    setIsEmploymentModalOpen(false)
                }
                onSubmit={handleCreateEmployment}
                loading={loadingCreate}
            />
        </div>
    );
}