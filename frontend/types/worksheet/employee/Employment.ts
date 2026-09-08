export type EmploymentType =
    | "FULL_TIME"
    | "PART_TIME"
    | "TEMPORARY"
    | "CONTRACTOR";

export type EmploymentStatus =
    | "ACTIVE"
    | "INACTIVE"
    | "ENDED";

export type EmployeeEmployment = {
    id: number;
    employee_id: number;
    position: string;
    department?: string | null;
    employment_type: EmploymentType;
    start_date: string;
    end_date?: string | null;
    status: EmploymentStatus;
    createdAt?: string;
    updatedAt?: string;
};

export type CreateEmploymentData = {
    position: string;
    department?: string;
    employment_type?: EmploymentType;
    start_date: string;
    end_date?: string | null;
};