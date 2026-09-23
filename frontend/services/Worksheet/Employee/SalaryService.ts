import api from "../../api";
import { EmployeeSalaryHistory, CreateSalaryData, 
    ChangeSalaryData, EmployeeNIPayroll, CalculateNIPayrollResponse
} from "../../../types/worksheet/employee/Salary";

export async function createSalary(
    employeeId: number,
    salary: CreateSalaryData
): Promise<EmployeeSalaryHistory> {
    try {
        const { data } = await api.post<{
            message: string;
            data: EmployeeSalaryHistory;
        }>(`/salary/${employeeId}`, salary);

        return data.data;
    } catch (error: any) {
        throw new Error(
        error?.response?.data?.message ||
            error.message ||
            "Error al crear salario"
        );
    }
}

export async function getSalaryHistory(
    employeeId: number
): Promise<EmployeeSalaryHistory[]> {
    try {
        const { data } = await api.get<{
            message: string;
            data: EmployeeSalaryHistory[];
        }>(`/salary/${employeeId}/history`);

        return data.data;
    } catch (error: any) {
        throw new Error(
        error?.response?.data?.message ||
            error.message ||
            "Error al obtener historial salarial"
        );
    }
}

export async function getCurrentSalary(
    employeeId: number
): Promise<EmployeeSalaryHistory> {
    try {
        const { data } = await api.get<{
            message: string;
            data: EmployeeSalaryHistory;
        }>(`/salary/${employeeId}/current`);

        return data.data;
    } catch (error: any) {
        throw new Error(
        error?.response?.data?.message ||
            error.message ||
            "Error al obtener salario actual"
        );
    }
}

export async function getSalaryAtDate(
    employeeId: number,
    date: string
): Promise<EmployeeSalaryHistory> {
    try {
        const { data } = await api.get<{
            message: string;
            data: EmployeeSalaryHistory;
        }>(`/salary/${employeeId}/atDate`, {
            params: {
                date,
            },
        });

        return data.data;
    } catch (error: any) {
        throw new Error(
        error?.response?.data?.message ||
            error.message ||
            "Error al obtener salario para la fecha indicada"
        );
    }
}

export async function changeSalary(
    employeeId: number,
    salary: ChangeSalaryData
): Promise<EmployeeSalaryHistory> {
    try {
        const { data } = await api.patch<{
            message: string;
            data: EmployeeSalaryHistory;
        }>(`/salary/${employeeId}/salary`, salary);

        return data.data;
    } catch (error: any) {
        throw new Error(
        error?.response?.data?.message ||
            error.message ||
            "Error al cambiar salario"
        );
    }
}

export async function calculateEmployeePayroll(
    employeeId: number,
    periodStart?: string,
    periodEnd?: string
): Promise<EmployeeNIPayroll> {
    try {
        const { data } = await api.get<CalculateNIPayrollResponse>(
            `/salary/${employeeId}/payroll`,
            {
                params: {
                    ...(periodStart && { periodStart }),
                    ...(periodEnd && { periodEnd })
                }
            }
        );

        return data.data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            "Error al calcular la nómina del empleado"
        );
    }
}