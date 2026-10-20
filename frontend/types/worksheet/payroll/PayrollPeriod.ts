export type PayrollPeriodStatus = "DRAFT" | "CALCULATED" | "APPROVED" | "PAID" | "CANCELLED";

export interface PayrollPeriod {
    id: number;
    business_id: number;
    start_date: string;
    end_date: string;
    payment_date: string;
    status: PayrollPeriodStatus;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreatePayrollPeriodData {
    start_date: string;
    end_date: string;
    payment_date: string;
    status?: PayrollPeriodStatus;
}

export interface UpdatePayrollPeriodData {
    start_date?: string;
    end_date?: string;
    payment_date?: string;
    status?: PayrollPeriodStatus;
}

export interface PayrollPeriodFilters {
    status?: PayrollPeriodStatus;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
    [key: string]: any;
}

export interface PayrollPeriodPagination {
    data: PayrollPeriod[];
    total?: number;
    page?: number;
    totalPages?: number;
    [key: string]: any;
}

export interface PayrollCalculationItem {
    payroll_rule_id: number | null;
    concept: string;
    type: "EARNING" | "DEDUCTION" | "EMPLOYER_COST";
    amount: number;
    calculation_base: number | null;
    applied_percentage: number | null;
    description: string | null;
}

export interface PayrollCalculationEmployee {
    employee_id: number;
    employment_id: number | null;
    gross_salary: number;
    total_earnings: number;
    total_deductions: number;
    net_salary: number;
    employer_cost: number;
    status: "CALCULATED" | "ERROR";
    payroll_employee_id?: number;
    items?: PayrollCalculationItem[];
    error?: string;
}

export interface CalculatePayrollResult {
    period: {
        id: number;
        start_date: string;
        end_date: string;
        payment_date: string;
        status: PayrollPeriodStatus;
    };
    totalEmployees: number;
    employees: PayrollCalculationEmployee[];
}


export interface PayrollPeriodSummary {
    period: {
        id: number;
        start_date: string;
        end_date: string;
        status: string;
    };
    summary: {
        total_employees: number;
        total_gross_salary: number;
        total_earnings: number;
        total_deductions: number;
        total_net_salary: number;
        total_employer_cost: number;
    };
    employees: {
        employee_id: number;
        payroll_employee_id: number;
        employee_name: string;
    }[];
}