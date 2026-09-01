"use client";

import BranchManager from "./components/BranchesManager";
import ModalError from "@/components/ModalError";
import { useBranches } from "./hooks/useBranches";
import { ConfirmDeleteModal } from "@/components/ConfirmDelete";
import ModalSuccess from "@/components/ModalSuccess";
import { useAuth } from "@/app/(public)/auth/login/hooks/useAuth";

export default function BranchPage() {
    const { user } = useAuth();
    const businessId = user?.Business_id;
    const branch = useBranches(businessId);
    return (
        <>
            <BranchManager
                businessId={businessId}
                {...branch}
            />
            <ModalError
                open={!!branch.error}
                title="Ha ocurrido un error"
                message={branch.error}
                onClose={() => branch.setError("")}
            />
            <ConfirmDeleteModal
                isOpen={branch.isDeleteOpen}
                title="Eliminar sucursal"
                description={
                    branch.selectedBranch
                        ? `¿Deseas eliminar la sucursal "${branch.selectedBranch.name}"? Esta acción no se puede deshacer.`
                        : ""
                }
                isDeleting={branch.loading}
                onClose={() => {
                    branch.setSelectedBranch(null);
                    branch.setIsDeleteOpen(false);
                }}
                onConfirm={async () => {
                    if (!branch.selectedBranch) return;

                    await branch.handleDelete(
                        branch.selectedBranch.id
                    );

                    branch.setSelectedBranch(null);
                    branch.setIsDeleteOpen(false);
                }}
            />
            <ModalSuccess
                open={!!branch.success}
                title="Operación exitosa"
                message={branch.success}
                onClose={() => branch.setSuccess("")}
            />
        </>
    );
}