import api from "../../api";
import { Employee, EmployeesResponse, CreateEmployeeData, UpdateEmployeeData, EmployeeSummary } from "../../../types/worksheet/employee/Employee";

export async function createEmployee(
     employee: CreateEmployeeData
): Promise<Employee> {
    try {
        const { data } = await api.post<{
            message: string;
            data: Employee;
        }>("/employee/", employee);

        return data.data;
    } catch (error: any) {
        throw new Error(
        error?.response?.data?.message ||
            error.message ||
            "Error al crear empleado"
        );
    }
}

export async function getEmployees(
    page: number = 1,
    limit: number = 10
): Promise<EmployeesResponse> {
    try {
        const { data } = await api.get<EmployeesResponse>(
            "/employee",
            {
                params: {page, limit,}
            }
        );
        return data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            "Error al obtener empleados"
        );
    }
}

export async function getEmployeeById(
    id: number
): Promise<Employee> {
    try {
        const { data } = await api.get<{
            message: string;
            data: Employee;
        }>(`/employee/${id}`);

        return data.data;
    } catch (error: any) {
        throw new Error(
        error?.response?.data?.message ||
            error.message ||
            "Error al obtener empleado"
        );
    }
}

export async function updateEmployee(
    id: number,
    employee: UpdateEmployeeData
): Promise<Employee> {
    try {
        const { data } = await api.put<{
            message: string;
            data: Employee;
        }>(`/employee/${id}`, employee);

        return data.data;
    } catch (error: any) {
        throw new Error(
        error?.response?.data?.message ||
            error.message ||
            "Error al actualizar empleado"
        );
    }
}

export async function updateEmployeeStatus(
    id: number,
    status: Employee["status"]
): Promise<Employee> {
    try {
        const { data } = await api.put<{
            message: string;
            data: Employee;
        }>(`/employee/${id}/updateStatus`, {
            status,
        });

        return data.data;
    } catch (error: any) {
        throw new Error(
        error?.response?.data?.message ||
            error.message ||
            "Error al actualizar estado del empleado"
        );
    }
}

export async function getEmployeeSummary(
    date?: string
): Promise<EmployeeSummary> {
    try {
        const { data } = await api.get<{
            message: string;
            data: EmployeeSummary;
        }>("/employee/summary", {
            params: date ? { date } : undefined
        });
        return data.data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            "Error al obtener resumen de empleados"
        );
    }
}