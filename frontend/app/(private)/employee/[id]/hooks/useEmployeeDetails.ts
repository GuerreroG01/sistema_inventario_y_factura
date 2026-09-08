import { useCallback, useEffect, useState } from "react";
import { Employee } from "@/types/worksheet/employee/Employee";
import { getEmployeeById } from "@/services/Worksheet/Employee/EmployeeService";

type UseEmployeeDetailsReturn = {
    employee: Employee | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
};

export function useEmployeeDetails(
    id?: number
): UseEmployeeDetailsReturn {
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchEmployee = useCallback(async () => {
        if (!id) {
            setEmployee(null);
            return;
        }
        try {
            setLoading(true);
            setError(null);

            const data = await getEmployeeById(id);
            setEmployee(data);
        } catch (error: any) {
            setError(
                error?.message || "Error al obtener los detalles del empleado"
            );
            setEmployee(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchEmployee();
    }, [fetchEmployee]);

    return {
        employee, loading, error, refetch: fetchEmployee
    };
}
