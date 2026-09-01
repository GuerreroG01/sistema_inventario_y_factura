import { useCallback, useState } from "react";
import { register } from "@/services/authService";
import { RegisterRequest, User } from "@/types/Auth";
import { getBranchesByName } from "@/services/branchService";

interface Branch {
    id: number;
    name: string;
}

interface BranchSearchResponse {
    branches: Branch[];
    total?: number;
    page?: number;
}

export function useRegister() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userData, setUserData] = useState<User | null>(null);

    const [branches, setBranches] = useState<Branch[]>([]);
    const [branchesLoading, setBranchesLoading] = useState(false);
    const [branchesError, setBranchesError] = useState<string | null>(null);

    const handleRegister = async (data: RegisterRequest) => {
        try {
            setLoading(true);
            setError(null);

            const response = await register(data);
            setUserData(response.usuario);
            return response;
        } catch (err: any) {
            const message = err.message || "Error al registrar usuario";
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const searchBranchByName = useCallback(
        async (businessId: number, name: string) => {
            try {
                setBranchesLoading(true);
                setBranchesError(null);

                if (!name.trim()) {
                    setBranches([]);
                    return [];
                }

                const response: BranchSearchResponse =
                    await getBranchesByName(
                        businessId,
                        {
                            name: name.trim(),
                            page: 1,
                        }
                    );
                const result = response.branches ?? [];
                setBranches(result);
                return result;
            } catch (err: any) {
                const message =
                    err.message || "Error al buscar sucursales";

                setBranchesError(message);
                setBranches([]);
                throw err;
            } finally {
                setBranchesLoading(false);
            }
        },
        []
    );

    return {
        register: handleRegister, loading, error, userData, branches, branchesLoading, branchesError, searchBranchByName
    };
}