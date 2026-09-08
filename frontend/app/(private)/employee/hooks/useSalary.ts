"use client";

import { useCallback, useEffect, useState } from "react";
import { EmployeeSalaryHistory, CreateSalaryData, ChangeSalaryData } from "@/types/worksheet/employee/Salary";
import {
    createSalary as create, getSalaryHistory, getCurrentSalary, getSalaryAtDate,
    changeSalary as change,
} from "@/services/Worksheet/Employee/SalaryService";

export function useSalary(employeeId: number) {
    const [salaryHistory, setSalaryHistory] = useState<EmployeeSalaryHistory[]>([]);
    const [currentSalary, setCurrentSalary] = useState<EmployeeSalaryHistory | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSalaryHistory = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await getSalaryHistory(employeeId);
            setSalaryHistory(data);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Error al obtener historial salarial";

            setError(message);
        } finally {
            setLoading(false);
        }
    }, [employeeId]);

    const fetchCurrentSalary = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await getCurrentSalary(employeeId);
            setCurrentSalary(data);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Error al obtener salario actual";

            setError(message);
        } finally {
            setLoading(false);
        }
    }, [employeeId]);

    const fetchSalary = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [history, current] = await Promise.all([
                getSalaryHistory(employeeId),
                getCurrentSalary(employeeId),
            ]);
            

            setSalaryHistory(history);
            setCurrentSalary(current);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Error al obtener información salarial";

            setError(message);
        } finally {
            setLoading(false);
        }
    }, [employeeId]);

    const createSalary = async ( salary: CreateSalaryData ): Promise<EmployeeSalaryHistory> => {
        try {
            setError(null);

            const newSalary = await create(employeeId,salary);
            setSalaryHistory((current) => [
                ...current,
                newSalary,
            ]);
            setCurrentSalary(newSalary);
            return newSalary;
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Error al crear salario";

            setError(message);
            throw error;
        }
    };

    const getSalaryAt = async (date: string): Promise<EmployeeSalaryHistory> => {
        try {
            setError(null);
            return await getSalaryAtDate(employeeId, date);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Error al obtener salario para la fecha indicada";

            setError(message);

            throw error;
        }
    };

    const changeSalary = async (salary: ChangeSalaryData): Promise<EmployeeSalaryHistory> => {
        try {
            setError(null);

            const updatedSalary = await change(employeeId, salary);
            setSalaryHistory((current) => [
                ...current,
                updatedSalary,
            ]);

            setCurrentSalary(updatedSalary);
            return updatedSalary;
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Error al cambiar salario";

            setError(message);
            throw error;
        }
    };

    useEffect(() => {
        fetchSalary();
    }, [fetchSalary]);

    return {
        salaryHistory, currentSalary, loading, error, fetchSalary, fetchSalaryHistory,
        fetchCurrentSalary, createSalary, getSalaryAt, changeSalary
    };
}