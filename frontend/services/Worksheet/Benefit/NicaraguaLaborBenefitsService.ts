import api from "../../api";

import { CalculationDate, EmployeeVacationBenefit, EmployeeThirteenthMonthBenefitResponse,
    EmployeeIndemnificationBenefitResponse
} from "@/types/worksheet/benefit/NicaraguaLaborBenefits";

const getErrorMessage = (
    error: any,
    fallback: string
): string => {
    return (
        error?.response?.data?.message ||
        error?.message ||
        fallback
    );
};

export async function getEmployeeVacationBenefit(
    businessId: number,
    employeeId: number,
    filters?: CalculationDate
): Promise<EmployeeVacationBenefit> {
    try {
        const { data } = await api.get<{
            success: boolean;
            message: string;
            data: EmployeeVacationBenefit;
        }>(
            `/nic_benefit/vacations/${businessId}/${employeeId}`,
            {
                params: filters,
            }
        );

        return data.data;

    } catch (error: any) {
        throw new Error(
            getErrorMessage(
                error,
                "Error al calcular las vacaciones del empleado"
            )
        );
    }
}

export async function calculateEmployeeThirteenthMonth(
    employeeId: number,
    data?: CalculationDate
): Promise<EmployeeThirteenthMonthBenefitResponse> {
    try {
        const { data: response } = await api.post<EmployeeThirteenthMonthBenefitResponse>(
            `/nic_benefit/thirteenth_month/${employeeId}`,
            data || {}
        );

        return response;

    } catch (error: any) {
        throw new Error(
            getErrorMessage(
                error,
                "Error al calcular el décimo tercer mes del empleado"
            )
        );
    }
}

export async function calculateEmployeeIndemnification(
    employeeId: number,
    data?: CalculationDate
): Promise<EmployeeIndemnificationBenefitResponse> {
    try {
        const { data: response } =
            await api.post<EmployeeIndemnificationBenefitResponse>(
                `/nic_benefit/indemnification/${employeeId}`,
                data || {}
            );

        return response;

    } catch (error: any) {
        throw new Error(
            getErrorMessage(
                error,
                "Error al calcular la indemnización del empleado"
            )
        );
    }
}