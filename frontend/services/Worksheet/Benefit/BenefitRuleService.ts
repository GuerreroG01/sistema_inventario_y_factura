
import api from "../../api";

import { BenefitRule, CreateBenefitRuleData, UpdateBenefitRuleData, BenefitRuleFilters,
    BenefitRulePagination
} from "@/types/worksheet/benefit/BenefitRule";

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

export async function getBenefitRules(
    filters?: BenefitRuleFilters
): Promise<BenefitRulePagination> {
    try {
        const { data } = await api.get<BenefitRulePagination>(
            "/benefit-rules",
            {
                params: filters
            }
        );

        return data;
    } catch (error: any) {
        throw new Error(
            getErrorMessage(
                error,
                "Error al obtener las reglas de beneficios"
            )
        );
    }
}

export async function getBenefitRuleById(
    id: number
): Promise<BenefitRule> {
    try {
        const { data } = await api.get<BenefitRule>(
            `/benefit-rules/${id}`
        );

        return data;
    } catch (error: any) {
        throw new Error(
            getErrorMessage(
                error,
                "Error al obtener la regla de beneficio"
            )
        );
    }
}

export async function createBenefitRule(
    rule: CreateBenefitRuleData
): Promise<BenefitRule> {
    try {
        const { data } = await api.post<{
            message: string;
            data: BenefitRule;
        }>(
            "/benefit-rules",
            rule
        );

        return data.data;
    } catch (error: any) {
        throw new Error(
            getErrorMessage(
                error,
                "Error al crear la regla de beneficio"
            )
        );
    }
}

export async function updateBenefitRule(
    id: number,
    rule: UpdateBenefitRuleData
): Promise<BenefitRule> {
    try {
        const { data } = await api.patch<{
            message: string;
            data: BenefitRule;
        }>(
            `/benefit-rules/${id}`,
            rule
        );

        return data.data;
    } catch (error: any) {
        throw new Error(
            getErrorMessage(
                error,
                "Error al actualizar la regla de beneficio"
            )
        );
    }
}

export async function deactivateBenefitRule(
    id: number
): Promise<BenefitRule> {
    try {
        const { data } = await api.put<{
            message: string;
            data: BenefitRule;
        }>(
            `/benefit-rules/${id}/deactivate`
        );

        return data.data;
    } catch (error: any) {
        throw new Error(
            getErrorMessage(
                error,
                "Error al desactivar la regla de beneficio"
            )
        );
    }
}

export async function activateBenefitRule(
    id: number
): Promise<BenefitRule> {
    try {
        const { data } = await api.put<{
            message: string;
            data: BenefitRule;
        }>(
            `/benefit-rules/${id}/activate`
        );

        return data.data;
    } catch (error: any) {
        throw new Error(
            getErrorMessage(
                error,
                "Error al activar la regla de beneficio"
            )
        );
    }
}