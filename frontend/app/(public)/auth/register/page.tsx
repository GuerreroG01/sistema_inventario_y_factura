"use client";

import { useState, useEffect } from "react";
import { useRegister } from "./hooks/useRegister";
import RegisterForm from "./components/RegisterForm";
import { RegisterRequest } from "@/types/Auth";
import { SystemStatus } from "../../Utils/SystemStatus";
import { useAuth } from "../login/hooks/useAuth";

export default function RegisterPage() {
    const { register, loading, error, userData, branches, branchesLoading, searchBranchByName } = useRegister();
    const { initialized } = SystemStatus();
    const { user } = useAuth();
    const initialData: RegisterRequest = {
        Usuario: "",
        Clave: "",
        Email: "",
        Telefono: "",
    };
    const [formData, setFormData] = useState<RegisterRequest>(initialData);
    const [search, setSearch] = useState("");
    const [showBranches, setShowBranches] = useState(false);
    const businessId = user?.Business_id;
    useEffect(() => {
        if (!businessId) return;
        const timeout = setTimeout(async () => {
            try {
                await searchBranchByName(
                    businessId,
                    search
                );
            } catch (err) {
                console.error(
                    "Error buscando sucursales:",
                    err
                );
            }
        }, 400);

        return () => clearTimeout(timeout);
    }, [search,businessId,searchBranchByName]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setShowBranches(true);
        setFormData((prev) => ({
            ...prev,
            branch_id: undefined,
        }));
    };

    const handleBranchSelect = (branch: {id: number;name: string;}) => {
        setSearch(branch.name);
        setFormData((prev) => ({
            ...prev,
            branch_id: branch.id,
        }));

        setShowBranches(false);
    };

    const handleRegister = async (data: RegisterRequest) => {
        await register(data);
        setFormData(initialData);
        setSearch("");
        setShowBranches(false);
    };

    return (
        <RegisterForm
            data={formData}
            loading={loading}
            error={error}
            userData={userData}
            branches={branches}
            branchesLoading={branchesLoading}
            search={search}
            onSearchChange={handleSearchChange}
            onBranchSelect={handleBranchSelect}
            showBranches={showBranches}
            onChange={handleChange}
            onSubmit={handleRegister}
            initialized={initialized}
        />
    );
}