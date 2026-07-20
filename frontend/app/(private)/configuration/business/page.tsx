"use client";

import BusinessManager from "./components/BusinessManager";
import ModalError from "@/components/ModalError";
import { useBusinesses } from "./hooks/useBusiness";
import { ConfirmDeleteModal } from "@/components/ConfirmDelete";
import ModalSuccess from "@/components/ModalSuccess";

export default function BusinessPage() {
    const business = useBusinesses();

    return (
        <>
            <BusinessManager {...business} />

            <ModalError
                open={!!business.error}
                title="Ha ocurrido un error"
                message={business.error}
                onClose={() => business.setError("")}
            />
            <ConfirmDeleteModal
                isOpen={business.isDeleteOpen}
                title="Eliminar negocio"
                description={
                    business.selectedBusiness
                        ? `¿Deseas eliminar el negocio "${business.selectedBusiness.name}"? Esta acción no se puede deshacer.`
                        : ""
                }
                isDeleting={business.loading}
                onClose={() => {
                    business.setSelectedBusiness(null);
                    business.setIsDeleteOpen(false);
                }}
                onConfirm={async () => {
                    if (!business.selectedBusiness) return;

                    await business.handleDelete(business.selectedBusiness.id);

                    business.setSelectedBusiness(null);
                    business.setIsDeleteOpen(false);
                }}
            />
            <ModalSuccess
                open={!!business.success}
                title="Operación exitosa"
                message={business.success}
                onClose={() => business.setSuccess("")}
            />
        </>
    );
}