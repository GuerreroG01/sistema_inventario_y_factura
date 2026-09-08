import { useState } from "react";
import { createSalary } from "@/services/Worksheet/Employee/SalaryService";
import { CreateSalaryData, EmployeeSalaryHistory } from "@/types/worksheet/employee/Salary";

export function useCreateSalary(employeeId: number) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreateSalary = async (
        salary: CreateSalaryData
    ): Promise<EmployeeSalaryHistory> => {
        try {
            setLoading(true);
            setError(null);

            const data = await createSalary(
                employeeId,
                salary
            );

            return data;
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Error al crear salario";

            setError(message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        createSalary: handleCreateSalary,
        loading,
        error,
    };
}