export interface CalculationDate {
    calculation_date?: string;
}

export type EmployeeVacationCalculationStatus =
    | "ACCRUED"
    | "ALREADY_CALCULATED";

export interface EmployeeVacationMovement {
    id: number;
    employee_benefit_id: number;
    transaction_type: string;
    reference_type: string;
    reference_id: number | null;
    amount: number | string;
    balance_before: number | string;
    balance_after: number | string;
    period_start_date: string | null;
    period_end_date: string | null;
    description: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface EmployeeVacationBenefit {
    status: EmployeeVacationCalculationStatus;
    message: string;

    data: EmployeeVacationMovement[];

    completed_months: number;
    recognized_months: number;
    pending_months: number;

    accrued_days: number;
    recognized_days: number;
    pending_days: number;

    current_balance: number;
    last_accrual_date: string | null;
}

export interface EmployeeVacationBenefitResponse {
    success: boolean;
    message: string;
    data: EmployeeVacationBenefit;
}

export type ThirteenthMonthCalculationType =
    | "INITIAL"
    | "RECURRING";

export type ThirteenthMonthCalculationStatus =
    | "ACCRUED"
    | "ALREADY_CALCULATED"
    | "RECALCULATED";

export interface ThirteenthMonthMovement {
    id: number;
    employee_benefit_id: number;
    transaction_type: string;
    reference_type: string;
    reference_id: number | null;
    amount: number | string;
    balance_before: number | string;
    balance_after: number | string;
    period_start_date: string | null;
    period_end_date: string | null;
    description: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface ThirteenthMonthMonthlyBreakdown {
    month: string;
    period_start_date: string;
    period_end_date: string;
    worked_days: number;
    total_month_days: number;
    salary_base: number;
    salary_history_id: number;
    accrued_amount: number;
}

export interface ThirteenthMonthCalculationResult {
    status: ThirteenthMonthCalculationStatus;
    message: string;
    data: ThirteenthMonthMovement[];
    reversals?: ThirteenthMonthMovement[];
    monthly_breakdown: ThirteenthMonthMonthlyBreakdown[];
    period_start_date: string;
    period_end_date: string;
    recognized_months: number;
    pending_months: number;
    accrued_amount: number;
    current_balance: number;
    last_accrual_date?: string | null;
    salary_changed?: boolean;
    salary_history_id?: number;
    previous_balance?: number;
}

export interface EmployeeThirteenthMonthBenefitResponse {
    success: boolean;
    calculation_type: ThirteenthMonthCalculationType;
    message: string;
    result: ThirteenthMonthCalculationResult;
}

export type IndemnificationCalculationType =
    | "INITIAL"
    | "RECURRING";

export type IndemnificationCalculationStatus =
    | "ACCRUED"
    | "ALREADY_CALCULATED"
    | "RECALCULATED";

export interface IndemnificationMovement {
    id: number;
    employee_benefit_id: number;
    transaction_type: string;
    reference_type: string;
    reference_id: number | null;
    amount: number | string;
    balance_before: number | string;
    balance_after: number | string;
    period_start_date: string | null;
    period_end_date: string | null;
    description: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface EmployeeIndemnificationCalculationResult {
    status: IndemnificationCalculationStatus;
    message: string;
    data: IndemnificationMovement[];
    reversals?: IndemnificationMovement[];
    employment_start_date: string;
    calculation_date: string;
    employment_type?: "FULL_TIME" | "PART_TIME";
    salary_base: number;
    daily_salary?: number;
    indemnification_days?: number;
    total_indemnification_days?: number;
    recognized_days?: number;
    pending_days?: number;
    maximum_indemnification_days: number;
    accrued_amount: number;
    current_balance: number;
    salary_history_id?: number;
    salary_changed?: boolean;
    previous_balance?: number;
    first_pending_date?: string | null;
    last_accrual_date?: string | null;
}

export interface EmployeeIndemnificationBenefitResponse {
    success: boolean;
    calculation_type: IndemnificationCalculationType;
    message: string;
    result: EmployeeIndemnificationCalculationResult;
}