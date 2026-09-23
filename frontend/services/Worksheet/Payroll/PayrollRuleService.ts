import api from "../../api";
import { PayrollRule, CreatePayrollRuleData, CreatePayrollRuleVersionData,
    PayrollRuleFilters, PayrollRulePagination
} from "@/types/worksheet/payroll/PayrollRule";

export async function getPayrollRules(filters?: PayrollRuleFilters): Promise<PayrollRulePagination> {
    try {
        const { data } = await api.get<PayrollRulePagination>(
            `/rules`,
            {
                params: filters
            }
        );
        return data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            "Error al obtener las reglas de nómina"
        );
    }
}

export async function getPayrollRuleById(id: number): Promise<PayrollRule> {
    try {
        const { data } = await api.get<PayrollRule>(
            `/rules/${id}`
        );

        return data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            "Error al obtener la regla de nómina"
        );
    }
}

export async function createPayrollRule( rule: CreatePayrollRuleData): Promise<PayrollRule> {
    try {
        const { data } = await api.post<{
            message: string;
            data: PayrollRule;
        }>(
            `/rules`,
            rule
        );

        return data.data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            "Error al crear la regla de nómina"
        );
    }
}

export async function createPayrollRuleVersion(
    id: number, rule: CreatePayrollRuleVersionData
): Promise<PayrollRule> {
    try {
        const { data } = await api.post<{
            message: string;
            data: PayrollRule;
        }>(
            `/rules/${id}/version`,
            rule
        );

        return data.data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            "Error al crear la nueva versión de la regla"
        );
    }
}

export async function deletePayrollRule(id: number): Promise<PayrollRule> {
    try {
        const { data } = await api.put<{
            message: string;
            data: PayrollRule;
        }>(
            `/rules/${id}/deactivate`
        );

        return data.data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            "Error al desactivar la regla de nómina"
        );
    }
}

export async function activePayrollRule(id: number): Promise<PayrollRule> {
    try {
        const { data } = await api.put<{
            message: string;
            data: PayrollRule;
        }>(
            `/rules/${id}/activate`
        );

        return data.data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            "Error al desactivar la regla de nómina"
        );
    }
}