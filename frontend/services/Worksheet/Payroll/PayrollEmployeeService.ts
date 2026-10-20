import api from "../../api";
import { PayrollEmployee, CreatePayrollEmployeeData, PayrollEmployeeFilters, 
    PayrollEmployeePagination 
} from "@/types/worksheet/payroll/PayrollEmployee";

export async function getPayrollEmployeesByPeriod(
    periodId: number, 
    filters?: PayrollEmployeeFilters
): Promise<PayrollEmployeePagination> {
    try {
        const { data } = await api.get<PayrollEmployeePagination>(
            `/payroll-employee/${periodId}/employees`,
            {
                params: filters
            }
        );
        return data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            "Error al obtener los empleados del período de nómina"
        );
    }
}

export async function getPayrollEmployeeById(
    periodId: number, 
    id: number
): Promise<PayrollEmployee> {
    try {
        const { data } = await api.get<{ message: string; data: PayrollEmployee }>(
            `/payroll-employee/${periodId}/employees/${id}`
        );

        return data.data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            "Error al obtener el detalle del empleado en la nómina"
        );
    }
}

export async function createPayrollEmployee(
    periodId: number, 
    employeeData: CreatePayrollEmployeeData
): Promise<PayrollEmployee> {
    try {
        const { data } = await api.post<{
            message: string;
            data: PayrollEmployee;
        }>(
            `/payroll-employee/${periodId}/employees`,
            employeeData
        );

        return data.data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            "Error al agregar el empleado al período de nómina"
        );
    }
}

export async function deletePayrollEmployee(
    periodId: number, 
    id: number
): Promise<any> {
    try {
        const { data } = await api.delete(
            `/payroll-employee/${periodId}/employees/${id}`
        );

        return data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            "Error al eliminar el empleado del período de nómina"
        );
    }
}