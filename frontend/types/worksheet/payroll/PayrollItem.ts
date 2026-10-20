export type PayrollItemType = "EARNING" | "DEDUCTION" | "EMPLOYER_COST";

export interface PayrollItem {
    id: number;
    payroll_employee_id: number;
    payroll_rule_id?: number | null;
    concept: string;
    type: PayrollItemType;
    amount: number | string;
    calculation_base?: number | string | null;
    applied_percentage?: number | string | null;
    description?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreatePayrollItemData {
    payroll_rule_id?: number | null;
    concept: string;
    type: PayrollItemType;
    amount: number | string;
    calculation_base?: number | string | null;
    applied_percentage?: number | string | null;
    description?: string | null;
}

export interface UpdatePayrollItemData {
    payroll_rule_id?: number | null;
    concept?: string;
    type?: PayrollItemType;
    amount?: number | string;
    calculation_base?: number | string | null;
    applied_percentage?: number | string | null;
    description?: string | null;
}