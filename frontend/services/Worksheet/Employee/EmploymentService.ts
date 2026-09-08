import api from "../../api";
import { EmployeeEmployment, CreateEmploymentData } from "../../../types/worksheet/employee/Employment";

export async function createEmployment( employeeId: number, employment: CreateEmploymentData ): Promise<EmployeeEmployment> {
    try {
        const { data } = await api.post<{
            message: string;
            data: EmployeeEmployment;
        }>(`/employment/${employeeId}`, employment);

        return data.data;
    } catch (error: any) {
        throw new Error(
        error?.response?.data?.message ||
            error.message ||
            "Error al crear relación laboral"
        );
    }
}

export async function getEmploymentHistory( employeeId: number ): Promise<EmployeeEmployment[]> {
    try {
        const { data } = await api.get<{
            message: string;
            data: EmployeeEmployment[];
        }>(`/employment/${employeeId}/history`);

        return data.data;
    } catch (error: any) {
        throw new Error(
        error?.response?.data?.message ||
            error.message ||
            "Error al obtener historial laboral"
        );
    }
}

export async function getCurrentEmployment( employeeId: number ): Promise<EmployeeEmployment> {
    try {
        const { data } = await api.get<{
            message: string;
            data: EmployeeEmployment;
        }>(`/employment/${employeeId}/current`);

        return data.data;
    } catch (error: any) {
        throw new Error(
        error?.response?.data?.message ||
            error.message ||
            "Error al obtener relación laboral actual"
        );
    }
}

export async function getEmploymentAtDate( employeeId: number, date: string ): Promise<EmployeeEmployment> {
    try {
        const { data } = await api.get<{
            message: string;
            data: EmployeeEmployment;
        }>(`/employment/${employeeId}/atDate`, {
            params: {
                date,
            },
        });

        return data.data;
    } catch (error: any) {
        throw new Error(
        error?.response?.data?.message ||
            error.message ||
            "Error al obtener relación laboral para la fecha indicada"
        );
    }
}

export async function endEmployment( employeeId: number, endDate: string ): Promise<EmployeeEmployment> {
    try {
        const { data } = await api.patch<{
            message: string;
            data: EmployeeEmployment;
        }>(`/employment/${employeeId}/end`, {
            endDate,
        });

        return data.data;
    } catch (error: any) {
        throw new Error(
        error?.response?.data?.message ||
            error.message ||
            "Error al finalizar relación laboral"
        );
    }
}