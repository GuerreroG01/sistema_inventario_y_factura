"use client";

import { useCallback, useEffect, useState } from "react";
import {
    EmployeeEmployment, CreateEmploymentData,
} from "@/types/worksheet/employee/Employment";
import {
    createEmployment as create, getEmploymentHistory, getCurrentEmployment,
    getEmploymentAtDate, endEmployment as end,
} from "@/services/Worksheet/Employee/EmploymentService";

export function useEmployment(employeeId: number) {
    const [employmentHistory, setEmploymentHistory] = useState<EmployeeEmployment[]>([]);
    const [currentEmployment, setCurrentEmployment] = useState<EmployeeEmployment | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchEmploymentHistory = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await getEmploymentHistory(employeeId);
            setEmploymentHistory(data);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Error al obtener historial laboral";

            setError(message);
        } finally {
            setLoading(false);
        }
    }, [employeeId]);

    const fetchCurrentEmployment = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await getCurrentEmployment(employeeId);

            setCurrentEmployment(data);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Error al obtener relación laboral actual";

            setError(message);
        } finally {
            setLoading(false);
        }
    }, [employeeId]);

    const fetchEmployment = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [history, current] = await Promise.all([
                getEmploymentHistory(employeeId),
                getCurrentEmployment(employeeId),
            ]);

            setEmploymentHistory(history);
            setCurrentEmployment(current);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Error al obtener información laboral";

            setError(message);
        } finally {
            setLoading(false);
        }
    }, [employeeId]);

    const createEmployment = async (
        employment: CreateEmploymentData
    ): Promise<EmployeeEmployment> => {
        try {
            setError(null);

            const newEmployment = await create(employeeId, employment);
            setEmploymentHistory((current) => [
                ...current,
                newEmployment,
            ]);

            setCurrentEmployment(newEmployment);

            return newEmployment;
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Error al crear relación laboral";

            setError(message);

            throw error;
        }
    };

    const getEmploymentAt = async (
        date: string
    ): Promise<EmployeeEmployment> => {
        try {
            setError(null);

            return await getEmploymentAtDate(
                employeeId,
                date
            );
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Error al obtener relación laboral para la fecha indicada";

            setError(message);

            throw error;
        }
    };

    const endEmployment = async ( endDate: string ): Promise<EmployeeEmployment> => {
        try {
            setError(null);

            const endedEmployment = await end(employeeId, endDate);
            setEmploymentHistory((current) =>
                current.map((employment) =>
                    employment.id === endedEmployment.id
                        ? endedEmployment
                        : employment
                )
            );
            setCurrentEmployment(null);

            return endedEmployment;
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Error al finalizar relación laboral";

            setError(message);

            throw error;
        }
    };

    useEffect(() => {
        fetchEmployment();
    }, [fetchEmployment]);

    return {
        employmentHistory, currentEmployment, loading, error, fetchEmployment,
        fetchEmploymentHistory, fetchCurrentEmployment, createEmployment, getEmploymentAt,
        endEmployment,
    };
}