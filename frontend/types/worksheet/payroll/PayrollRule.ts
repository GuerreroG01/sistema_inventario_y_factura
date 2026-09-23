export type PayrollRuleType =
    | "DEDUCTION"
    | "EMPLOYER_COST"
    | "EARNING";

export type PayrollRuleCalculationType =
    | "FIXED"
    | "PERCENTAGE"
    | "PROGRESSIVE";

export type PayrollRuleBaseType =
    | "GROSS_SALARY"
    | "NET_SALARY"
    | "ANNUAL_NET_SALARY"
    | "ANNUAL_GROSS_SALARY"
    | "CUSTOM";

export interface PayrollRule {
    id: number;
    business_id: number;
    branch_id: number | null;
    code: string;
    name: string;
    type: PayrollRuleType;
    calculation_type: PayrollRuleCalculationType;
    base_type: PayrollRuleBaseType;
    value: number | null;
    percentage: number | null;
    effective_from: string;
    effective_to: string | null;
    active: boolean;
    created_by: number | null;
    updated_by: number | null;
    createdAt?: string;
    updatedAt?: string;
    tiers?: PayrollRuleTier[];
    branch?: {
        id: number;
        name: string;
    } | null;
}

export interface PayrollRuleTier {
    id: number;
    payroll_rule_id: number;
    min_amount: number;
    max_amount: number | null;
    fixed_amount: number;
    percentage: number;
}

export interface PayrollRuleTierData {
    min_amount: number;
    max_amount?: number | null;
    fixed_amount?: number;
    percentage?: number;
}

export interface CreatePayrollRuleData {
    code: string;
    name: string;
    type: PayrollRuleType;
    base_type: PayrollRuleBaseType;
    value?: number | null;
    percentage?: number | null;
    tiers?: PayrollRuleTierData[];
    effective_from: string;
    effective_to?: string | null;
    branch_id?: number | null;
}

export interface CreatePayrollRuleVersionData {
    code?: string;
    name?: string;
    type?: PayrollRuleType;
    base_type?: PayrollRuleBaseType;
    value?: number | null;
    percentage?: number | null;
    tiers?: PayrollRuleTierData[];
    effective_from?: string;
    effective_to?: string | null;
}

export interface PayrollRuleFilters {
    page?: number;
    limit?: number;
    type?: PayrollRuleType;
    active?: boolean;
    code?: string;
    from?: string;
    to?: string;
}

export interface PayrollRulePaginationData {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface PayrollRulePagination {
    data: PayrollRule[];
    pagination: PayrollRulePaginationData;
}