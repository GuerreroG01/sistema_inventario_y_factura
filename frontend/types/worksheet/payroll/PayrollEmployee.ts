export type PayrollEmployeeStatus = "PENDING" | "CALCULATED" | "APPROVED" | "PAID" | "CANCELLED";

export interface PayrollEmployee {
    id: number;
    payroll_period_id: number;
    employee_id: number;
    employment_id?: number | null;
    gross_salary: number | string;
    total_earnings: number | string;
    total_deductions: number | string;
    net_salary: number | string;
    employer_cost: number | string;
    status: PayrollEmployeeStatus;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreatePayrollEmployeeData {
    employee_id: number;
}

export interface PayrollEmployeeFilters {
    status?: PayrollEmployeeStatus;
    page?: number;
    limit?: number;
    [key: string]: any;
}

export interface PayrollEmployeePagination {
    data: PayrollEmployee[];
    total?: number;
    page?: number;
    totalPages?: number;
    [key: string]: any;
}