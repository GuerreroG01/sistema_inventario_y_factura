
export type BenefitType =
    | "VACATION"
    | "THIRTEENTH_MONTH"
    | "SEVERANCE"
    | "TRANSPORT"
    | "FOOD"
    | "OTHER";

export type BenefitRuleScope =
    | "GLOBAL"
    | "EMPLOYEE";

export type BenefitMode =
    | "RECURRING"
    | "ONE_TIME";

export type BenefitFrequency =
    | "NONE"
    | "MONTHLY"
    | "BIWEEKLY"
    | "YEARLY"
    | "ON_DEMAND";

export type BenefitUnit =
    | "DAYS"
    | "CURRENCY";

export interface BenefitRule {
    id: number;
    business_id: number;

    type: BenefitType;
    name: string;
    description: string | null;

    scope: BenefitRuleScope;

    benefit_mode: BenefitMode;
    frequency: BenefitFrequency;

    unit: BenefitUnit;

    amount: number | string | null;

    formula: string | null;

    start_date: string;
    end_date: string | null;

    is_active: boolean;

    conditions: Record<string, unknown> | null;

    createdAt?: string;
    updatedAt?: string;
}

export interface CreateBenefitRuleData {
    type: BenefitType;
    name: string;

    description?: string | null;

    scope?: BenefitRuleScope;

    benefit_mode: BenefitMode;
    frequency: BenefitFrequency;

    unit: BenefitUnit;

    amount?: number | null;
    formula?: string | null;

    start_date: string;
    end_date?: string | null;

    conditions?: Record<string, unknown> | null;
}

export interface UpdateBenefitRuleData {
    type?: BenefitType;
    name?: string;

    description?: string | null;

    scope?: BenefitRuleScope;

    benefit_mode?: BenefitMode;
    frequency?: BenefitFrequency;

    unit?: BenefitUnit;

    amount?: number | null;
    formula?: string | null;

    start_date?: string;
    end_date?: string | null;

    conditions?: Record<string, unknown> | null;
}

export interface BenefitRuleFilters {
    page?: number;
    limit?: number;

    type?: BenefitType;
    scope?: BenefitRuleScope;
    active?: boolean;

    name?: string;

    from?: string;
    to?: string;
}

export interface BenefitRulePaginationData {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface BenefitRulePagination {
    data: BenefitRule[];
    pagination: BenefitRulePaginationData;
}