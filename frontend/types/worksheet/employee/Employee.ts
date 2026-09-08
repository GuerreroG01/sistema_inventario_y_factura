export type EmployeeStatus = "ACTIVE" | "INACTIVE";

export type Employee = {
    id: number;
    business_id: number;
    employee_code: string;
    first_name: string;
    last_name: string;
    identification: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    position?: string | null;
    department?: string | null;
    hire_date: string;
    termination_date?: string | null;
    status: EmployeeStatus;
    createdAt?: string;
    updatedAt?: string;
};

export type CreateEmployeeData = {
    employee_code: string;
    first_name: string;
    last_name: string;
    identification: string;
    phone?: string;
    email?: string;
    address?: string;
    position?: string;
    department?: string;
    hire_date: string;
};

export type UpdateEmployeeData = Partial<
    Omit<Employee, "id" | "business_id" | "createdAt" | "updatedAt">
>;

export type EmployeePagination = {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

export type EmployeesResponse = {
    message: string;
    data: Employee[];
    pagination: EmployeePagination;
};

export interface EmployeeSummary {
    employees: {
        total: number;
        active: number;
        inactive: number;
    };
    salaries: {
        total: number;
        employeesWithSalary: number;
    };
    filters: {
        business_id: number;
        branch_id: number | null;
        date: string;
    };
}
