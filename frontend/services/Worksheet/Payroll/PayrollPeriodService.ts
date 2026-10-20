import api from "../../api";
import { PayrollPeriod,  CreatePayrollPeriodData, UpdatePayrollPeriodData, 
    PayrollPeriodFilters, PayrollPeriodPagination, PayrollPeriodStatus, 
    CalculatePayrollResult, PayrollPeriodSummary
} from "@/types/worksheet/payroll/PayrollPeriod";
import { PayrollItem } from "@/types/worksheet/payroll/PayrollItem";

export async function getPayrollPeriods(filters?: PayrollPeriodFilters): Promise<PayrollPeriodPagination> {
    try {
        const { data } = await api.get<PayrollPeriodPagination>(
            `/payroll-periods`,
            {
                params: filters
            }
        );
        return data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            "Error al obtener los períodos de nómina"
        );
    }
}

export async function getPayrollPeriodById(id: number): Promise<PayrollPeriod> {
    try {
        const { data } = await api.get<{ message: string; data: PayrollPeriod }>(
            `/payroll-periods/${id}`
        );

        return data.data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            "Error al obtener el período de nómina"
        );
    }
}

export async function createPayrollPeriod(periodData: CreatePayrollPeriodData): Promise<PayrollPeriod> {
    try {
        const { data } = await api.post<{
            message: string;
            data: PayrollPeriod;
        }>(
            `/payroll-periods`,
            periodData
        );

        return data.data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            "Error al crear el período de nómina"
        );
    }
}

export async function updatePayrollPeriod(
    id: number, 
    periodData: UpdatePayrollPeriodData
): Promise<PayrollPeriod> {
    try {
        const { data } = await api.patch<{
            message: string;
            data: PayrollPeriod;
        }>(
            `/payroll-periods/${id}`,
            periodData
        );

        return data.data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            "Error al actualizar el período de nómina"
        );
    }
}

export async function updatePayrollPeriodStatus(
    id: number, 
    status: PayrollPeriodStatus
): Promise<PayrollPeriod> {
    try {
        const { data } = await api.patch<{
            message: string;
            data: PayrollPeriod;
        }>(
            `/payroll-periods/${id}/status`,
            { status }
        );

        return data.data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            "Error al actualizar el estado del período de nómina"
        );
    }
}

export async function deletePayrollPeriod(id: number): Promise<any> {
    try {
        const { data } = await api.delete(
            `/payroll-periods/${id}`
        );

        return data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            "Error al eliminar el período de nómina"
        );
    }
}

export async function calculatePayrollPeriod(
    periodId: number
): Promise<CalculatePayrollResult> {
    try {
        const { data } = await api.post<{
            success: boolean;
            message: string;
            data: CalculatePayrollResult;
        }>(`/payroll-periods/${periodId}/calculate`);

        return data.data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            "Error al calcular la nómina del período"
        );
    }
}

export async function getPayrollPeriodSummary(
    periodId: number
): Promise<PayrollPeriodSummary> {
    try {
        const { data } = await api.get<{
            success: boolean;
            data: PayrollPeriodSummary;
        }>(`/payroll-periods/${periodId}/summary`);

        return data.data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            "Error al obtener el resumen del período de nómina"
        );
    }
}

export async function getPayrollItemsByEmployee(
    periodId: number,
    payrollEmployeeId: number
): Promise<PayrollItem[]> {
    try {
        const { data } = await api.get<{
            success: boolean;
            data: PayrollItem[];
        }>(
            `/payroll-periods/${periodId}/employees/${payrollEmployeeId}/items`
        );

        return data.data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            "Error al obtener los conceptos de nómina del empleado"
        );
    }
}

/**
 Ya se agregaron las funciones que conectan con la api, ahora lo que sigue es crear el hook y los componentes visuales para
 mostrar el periodo de nómina calculado.
 */