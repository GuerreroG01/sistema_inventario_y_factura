export type SalaryType =
    | "MONTHLY"
    | "WEEKLY"
    | "DAILY"
    | "HOURLY";

export type EmployeeSalaryHistory = {
    id: number;
    employee_id: number;
    salary: number;
    salary_type: SalaryType;
    effective_from: string;
    effective_to?: string | null;
    reason?: string | null;
    createdAt?: string;
    updatedAt?: string;
};

export type CreateSalaryData = {
    salary: number;
    salary_type?: SalaryType;
    effective_from: string;
    effective_to?: string | null;
    reason?: string;
};

export type ChangeSalaryData = {
    salary: number;
    salary_type?: SalaryType;
    effective_from: string;
    effective_to?: string | null;
    reason?: string;
};

export interface PayrollDeduction {
    name: string;
    amount: number;
}

export interface EmployeeNIPayroll {
    gross_salary: number;
    deductions: Record<string, PayrollDeduction>;
    total_deductions: number;
    net_salary: number;
}

export interface CalculateNIPayrollResponse {
    message: string;
    data: EmployeeNIPayroll;
}
