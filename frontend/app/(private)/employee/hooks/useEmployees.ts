"use client";

import { useCallback, useEffect, useState } from "react"
import { Employee, CreateEmployeeData, UpdateEmployeeData, EmployeeSummary } from "@/types/worksheet/employee/Employee";
import {
    createEmployee as create, getEmployees, updateEmployee as update,
    updateEmployeeStatus as updateStatus, getEmployeeSummary
} from "@/services/Worksheet/Employee/EmployeeService";

export function useEmployees() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [activeEmployees, setActiveEmployees] = useState(0);
    const [inactiveEmployees, setInactiveEmployees] = useState(0);
    const [totalSalaries, setTotalSalaries] = useState(0);
    const [loadingSummary, setLoadingSummary] = useState<boolean>(false);

    const fetchEmployees = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await getEmployees();
            
            setEmployees(response.data);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Error al obtener empleados";

            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchEmployeeSummary = useCallback(
        async (date?: string) => {
            try {
                setLoadingSummary(true);
                setError(null);

                const summary: EmployeeSummary =
                    await getEmployeeSummary(date);
                setTotalEmployees(
                    summary.employees.total
                );
                setActiveEmployees(
                    summary.employees.active
                );
                setInactiveEmployees(
                    summary.employees.inactive
                );
                setTotalSalaries(
                    summary.salaries.total
                );

            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Error al obtener resumen de empleados";

                setError(message);

            } finally {
                setLoadingSummary(false);
            }
        },
        []
    );

    const createEmployee = async (
        employee: CreateEmployeeData
    ): Promise<Employee> => {
        try {
            setError(null);

            const newEmployee = await create(employee);
            setEmployees((current) => [
                ...current,
                newEmployee,
            ]);

            return newEmployee;
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Error al crear empleado";

            setError(message);

            throw error;
        }
    };

    const updateEmployee = async (
        id: number,
        employee: UpdateEmployeeData
    ): Promise<Employee> => {
        try {
            setError(null);

            const updatedEmployee = await update(id, employee);
            setEmployees((current) =>
                current.map((item) =>
                    item.id === id
                        ? updatedEmployee
                        : item
                )
            );

            return updatedEmployee;
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Error al actualizar empleado";

            setError(message);

            throw error;
        }
    };

    const updateEmployeeStatus = async (
        id: number,
        status: Employee["status"]
    ): Promise<Employee> => {
        try {
            setError(null);

            const updatedEmployee =
                await updateStatus(id, status);

            setEmployees((current) =>
                current.map((item) =>
                    item.id === id
                        ? updatedEmployee
                        : item
                )
            );
            await fetchEmployeeSummary();
            return updatedEmployee;
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Error al actualizar estado del empleado";

            setError(message);

            throw error;
        }
    };

    useEffect(() => {
        fetchEmployees();
        fetchEmployeeSummary();
    }, [fetchEmployees, fetchEmployeeSummary]);

    return {
        employees, loading, error, fetchEmployees, createEmployee, updateEmployee,
        updateEmployeeStatus, loadingSummary, totalEmployees, activeEmployees, inactiveEmployees,
        totalSalaries
    };
}