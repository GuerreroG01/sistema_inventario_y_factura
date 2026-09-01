import api from "./api";

import type { BranchResponse, BranchesResponse, BranchSearchResponse, BranchSearchParams,
    CreateBranchData, UpdateBranchData, DeleteBranchResponse, BranchStatsResponse
} from "@/types/Branch";

export const createBranch = async (
    businessId: number,
    data: CreateBranchData
): Promise<BranchResponse> => {
    const response = await api.post<BranchResponse>(
        `/branches/${businessId}`,
        data
    );
    return response.data;
};

export const getBranches = async (
    businessId: number
): Promise<BranchesResponse> => {
    const response = await api.get<BranchesResponse>(
        `/branches/${businessId}`
    );
    return response.data;
};

export const getBranchById = async (
    businessId: number,
    branchId: number
): Promise<BranchResponse> => {
    const response = await api.get<BranchResponse>(
        `/branches/${businessId}/${branchId}`
    );
    return response.data;
};

export const updateBranch = async (
    businessId: number,
    branchId: number,
    data: UpdateBranchData
): Promise<BranchResponse> => {
    const response = await api.put<BranchResponse>(
        `/branches/${businessId}/${branchId}`,
        data
    );
    return response.data;
};

export const changeBranchStatus = async (
    businessId: number,
    branchId: number,
    status: "ACTIVE" | "INACTIVE"
): Promise<BranchResponse> => {
    const response = await api.patch<BranchResponse>(
        `/branches/${businessId}/${branchId}/status`,
        {
            status
        }
    );
    return response.data;
};

export const deleteBranch = async (
    businessId: number,
    branchId: number
): Promise<DeleteBranchResponse> => {
    const response = await api.delete<DeleteBranchResponse>(
        `/branches/${businessId}/${branchId}`
    );
    return response.data;
};

export const getBranchesByName = async (
    businessId: number,
    params: BranchSearchParams = {}
): Promise<BranchSearchResponse> => {
    const response = await api.get<BranchSearchResponse>(
        `/branches/${businessId}/search`,
        {
            params
        }
    );
    return response.data;
};

export const getBranchStats = async (
    businessId: number
): Promise<BranchStatsResponse> => {
    const response = await api.get<BranchStatsResponse>(
        `/branches/${businessId}/stats`
    );

    return response.data;
};