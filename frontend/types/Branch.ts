export type BranchType = "MAIN" | "SECONDARY" | "WAREHOUSE" | "OFFICE";

export type BranchStatus = "ACTIVE" | "INACTIVE";

export interface Branch {
    id: number;
    business_id: number;
    name: string;
    type: BranchType;
    country: string;
    city: string;
    address?: string | null;
    phone?: string | null;
    status: BranchStatus;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBranchData {
    name: string;
    type?: BranchType;
    country: string;
    city: string;
    address?: string;
    phone?: string;
}

export interface UpdateBranchData {
    name?: string;
    type?: BranchType;
    country?: string;
    city?: string;
    address?: string;
    phone?: string;
    status?: BranchStatus;
}

export interface BranchSearchParams {
    name?: string;
    type?: BranchType;
    status?: BranchStatus;
    page?: number;
}

export interface BranchResponse {
    message: string;
    branch: Branch;
}

export interface BranchesResponse {
    message: string;
    branches: Branch[];
}

export interface BranchSearchResponse {
    message: string;
    total: number;
    page: number;
    totalPages: number;
    branches: Branch[];
}

export interface DeleteBranchResponse {
    message: string;
}

export interface BranchStats {
    total: number;
    active: number;
    inactive: number;
}

export interface BranchStatsResponse {
    message: string;
    stats: BranchStats;
}
