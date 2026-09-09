import { useState, useCallback } from "react";
import { createEmployment } from "@/services/Worksheet/Employee/EmploymentService";
import { CreateEmploymentData, EmployeeEmployment } from "@/types/worksheet/employee/Employment";

export function useCreateEmployment(employeeId: number) {
    const [loadingCreate, setLoadingCreate] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clearError = useCallback(() => {
        setError(null);
    }, []);
    const handleCreateEmployment = async (
        employment: CreateEmploymentData
    ): Promise<EmployeeEmployment> => {
        try {
            setLoadingCreate(true);
            setError(null);

            const data = await createEmployment(
                employeeId,
                employment
            );

            return data;
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Error al crear relación laboral";

            setError(message);
            throw error;
        } finally {
            setLoadingCreate(false);
        }
    };

    return {
        createEmployment: handleCreateEmployment,
        loadingCreate,
        error, clearError
    };
}