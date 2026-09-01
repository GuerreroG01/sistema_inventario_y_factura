"use client";

import { useEffect, useState } from "react";
import {
    getBranches, getBranchStats, createBranch, updateBranch, changeBranchStatus, deleteBranch
} from "@/services/branchService";
import {
    Branch, CreateBranchData, UpdateBranchData
} from "@/types/Branch";

export function useBranches(businessId: number) {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [branchStats, setBranchStats] = useState({
        total: 0,
        active: 0,
        inactive: 0
    });

    
    useEffect(() => {
        if (businessId) {
            loadBranches();
        }
    }, [businessId]);

    async function loadBranchStats() {
        try {
            const data = await getBranchStats(businessId);
            setBranchStats(data.stats);
        } catch (error: any) {
            setError(
                error.response?.data?.message ||
                error.message ||
                "Error al obtener las estadísticas de sucursales"
            );
        }
    }

    async function loadBranches() {
        try {
            setLoading(true);
            setError("");

            const [branchesData, statsData] = await Promise.all([
                getBranches(businessId),
                getBranchStats(businessId)
            ]);
            setBranches(branchesData.branches);
            setBranchStats(statsData.stats);
        } catch (error: any) {
            setError(
                error.response?.data?.message ||
                error.message ||
                "Error al obtener las sucursales"
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate(data: CreateBranchData) {
        try {
            setLoading(true);
            setError("");

            await createBranch(
                businessId,
                data
            );

            setSuccess(
                "La sucursal se creó correctamente."
            );
            await loadBranches();

        } catch (error: any) {
            setError(
                error.response?.data?.message ||
                error.message ||
                "Error al crear la sucursal"
            );
        } finally {
            setLoading(false);
        }
    }


    async function handleUpdate(
        branchId: number,
        data: UpdateBranchData
    ) {
        try {
            setLoading(true);
            setError("");

            await updateBranch( businessId, branchId, data );
            setSuccess("La sucursal se actualizó correctamente.");

            await loadBranches();
        } catch (error: any) {
            setError(
                error.response?.data?.message ||
                error.message ||
                "Error al actualizar la sucursal"
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleStatus(
        branchId: number,
        status: "ACTIVE" | "INACTIVE"
    ) {
        try {
            setLoading(true);
            setError("");

            await changeBranchStatus(
                businessId,
                branchId,
                status === "ACTIVE"
                    ? "INACTIVE"
                    : "ACTIVE"
            );

            setSuccess("El estado de la sucursal se actualizó correctamente.");
            await loadBranches();
        } catch (error: any) {
            setError(
                error.response?.data?.message ||
                error.message ||
                "Error al cambiar el estado de la sucursal"
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(branchId: number) {
        try {
            setLoading(true);
            setError("");
            await deleteBranch(businessId,branchId);

            setSuccess("La sucursal se eliminó correctamente.");
            await loadBranches();
        } catch (error: any) {
            setError(
                error.response?.data?.message ||
                error.message ||
                "Error al eliminar la sucursal"
            );
        } finally {
            setLoading(false);
        }
    }

    const activeBranches = branches.filter(
        branch => branch.status === "ACTIVE"
    ).length;

    const mainBranch = branches.find(
        branch => branch.type === "MAIN"
    ) || null;

    return {
        branches, loading, error, setError, success, setSuccess, selectedBranch,
        setSelectedBranch, isDeleteOpen, setIsDeleteOpen, handleCreate, handleUpdate,
        handleStatus, handleDelete, activeBranches, mainBranch, loadBranches, branchStats
    };
}
