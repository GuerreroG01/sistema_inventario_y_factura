import { BenefitRule, BenefitType, BenefitMode, BenefitUnit } from "./BenefitRule";

export type EmployeeBenefitStatus =
    | "ACTIVE"
    | "PAUSED"
    | "CLOSED";

export type { BenefitType, BenefitMode, BenefitUnit };

export interface BenefitResume {
    id: number;
    type: BenefitType;
    name: string | null;
    benefit_mode: BenefitMode;
    balance: number | string;
    unit: BenefitUnit;
    status: EmployeeBenefitStatus;
    start_date: string | null;
    end_date: string | null;
}
 
export interface EmployeeBenefit {
    id: number;
    employee_id: number;
    business_id: number;
    benefit_rule_id: number | null;

    type: BenefitType;
    benefit_mode: BenefitMode;
    balance: number | string;
    unit: BenefitUnit;
    status: EmployeeBenefitStatus;

    start_date: string | null;
    end_date: string | null;

    benefitRule?: BenefitRule | null;

    createdAt?: string;
    updatedAt?: string;
}

export interface CreateEmployeeBenefitData {
    employee_id: number;
    benefit_rule_id?: number | null;

    type: BenefitType;
    benefit_mode?: BenefitMode;
    balance?: number;
    unit: BenefitUnit;
    status?: EmployeeBenefitStatus;

    start_date?: string | null;
    end_date?: string | null;
}

export interface UpdateEmployeeBenefitData {
    type?: BenefitType;
    benefit_mode?: BenefitMode;
    balance?: number;
    unit?: BenefitUnit;
    status?: EmployeeBenefitStatus;
    start_date?: string | null;
    end_date?: string | null;
    benefit_rule_id?: number | null;
}

export interface AssignBenefitRuleData {
    benefit_rule_id: number;
    employee_id: number;
    start_date?: string | null;
    end_date?: string | null;
    initial_balance?: number | null;
}

export interface BulkAssignBenefitRuleData {
    benefit_rule_id: number;
    employee_ids: number[];
    start_date?: string | null;
    end_date?: string | null;
    initial_balance?: number | null;
}

export interface BulkAssignResult {
    created: EmployeeBenefit[];
    skipped: Array<{
        employee_id: number;
        reason: string;
    }>;
    errors: Array<{
        employee_id: number;
        error: string;
    }>;
}

export interface EmployeeBenefitFilters {
    page?: number;
    limit?: number;

    type?: BenefitType;
    status?: EmployeeBenefitStatus;
    benefit_mode?: BenefitMode;
    unit?: BenefitUnit;

    from?: string;
    to?: string;
}

export interface EmployeeBenefitPaginationData {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface EmployeeBenefitPagination {
    data: BenefitResume[];
    pagination: EmployeeBenefitPaginationData;
}

export interface ChangeEmployeeBenefitStatusData {
    status: EmployeeBenefitStatus;
}