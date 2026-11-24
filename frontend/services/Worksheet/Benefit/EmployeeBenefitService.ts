import api from "../../api";

import { EmployeeBenefit, CreateEmployeeBenefitData, UpdateEmployeeBenefitData,
    AssignBenefitRuleData, BulkAssignBenefitRuleData, BulkAssignResult,
    EmployeeBenefitFilters, EmployeeBenefitPagination, ChangeEmployeeBenefitStatusData,
} from "@/types/worksheet/benefit/EmployeeBenefit";

const getErrorMessage = (error: any, fallback: string): string => {
    return (
        error?.response?.data?.message ||
        error?.message ||
        fallback
    );
};

export async function getEmployeeBenefits(
    employeeId: number,
    filters?: EmployeeBenefitFilters
): Promise<EmployeeBenefitPagination> {
    try {
        const { data } = await api.get<EmployeeBenefitPagination>(
            `/benefit-employee/employee/${employeeId}`,
            {
                params: filters,
            }
        );
        return data;
    } catch (error: any) {
        throw new Error(
            getErrorMessage(
                error,
                "Error al obtener los beneficios del empleado"
            )
        );
    }
}

export async function getEmployeeBenefitById(
    id: number
): Promise<EmployeeBenefit> {
    try {
        const { data } = await api.get<{
            success?: boolean;
            data: EmployeeBenefit;
        } | EmployeeBenefit>(`/benefit-employee/${id}`);

        return (data as any).data ?? data;
    } catch (error: any) {
        throw new Error(
            getErrorMessage(
                error,
                "Error al obtener el beneficio del empleado"
            )
        );
    }
}

export async function createEmployeeBenefit(
    payload: CreateEmployeeBenefitData
): Promise<EmployeeBenefit> {
    try {
        const { data } = await api.post<{
            success?: boolean;
            message?: string;
            data: EmployeeBenefit;
        }>("/benefit-employee", payload);

        return data.data;
    } catch (error: any) {
        throw new Error(
            getErrorMessage(
                error,
                "Error al crear el beneficio del empleado"
            )
        );
   
    }
}

export async function assignBenefitRuleToEmployee(
    payload: AssignBenefitRuleData
): Promise<EmployeeBenefit> {
    try {
        const { data } = await api.post<{
            success?: boolean;
            message?: string;
            data: EmployeeBenefit;
        }>("/benefit-employee/assign", payload);

        return data.data;
    } catch (error: any) {
        throw new Error(
            getErrorMessage(
                error,
                "Error al asignar la regla de beneficio al empleado"
            )
        );
    }
}

export async function bulkAssignBenefitRule(
    payload: BulkAssignBenefitRuleData
): Promise<BulkAssignResult> {
    try {
        const { data } = await api.post<{
            success?: boolean;
            message?: string;
            data: BulkAssignResult;
        }>("/benefit-employee/bulk-assign", payload);

        return data.data;
    } catch (error: any) {
        throw new Error(
            getErrorMessage(
                error,
                "Error al asignar la regla de beneficio a los empleados"
            )
        );
    }
}

export async function updateEmployeeBenefit(
    id: number,
    payload: UpdateEmployeeBenefitData
): Promise<EmployeeBenefit> {
    try {
        const { data } = await api.patch<{
            success?: boolean;
            message?: string;
            data: EmployeeBenefit;
        }>(`/benefit-employee/${id}`, payload);

        return data.data;
    } catch (error: any) {
        throw new Error(
            getErrorMessage(
                error,
                "Error al actualizar el beneficio del empleado"
            )
        );
    }
}

export async function changeEmployeeBenefitStatus(
    id: number,
    payload: ChangeEmployeeBenefitStatusData
): Promise<EmployeeBenefit> {
    try {
        const { data } = await api.put<{
            success?: boolean;
            message?: string;
            data: EmployeeBenefit;
        }>(`/benefit-employee/${id}/status`, payload);

        return data.data;
    } catch (error: any) {
        throw new Error(
            getErrorMessage(
                error,
                "Error al cambiar el estado del beneficio"
            )
        );
    }
}