"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import StockReasonModal from "@/components/StockReasonModal";
import ProductForm from "../../components/ProductForm";
import { useProductForm } from "../../hooks/useProductForm";

export default function EditProductPage(){
    const router = useRouter();
    const params = useParams();
    const productId = Number(params.id);
    const { formData, updateField, submit, isSubmitting, submitWithStockReason } = useProductForm({ productId });
    const [showStockReasonModal, setShowStockReasonModal] = useState(false);
    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        const result = await submit();

        if (result.success) {
            router.push("/products");
            return;
        }

        if ("requiresStockReason" in result) {
            setShowStockReasonModal(true);
            return;
        }

        console.error(result.message);
    };
    const handleStockReasonConfirm = async (reason: string) => {
        const result = await submitWithStockReason(reason);

        if (result.success) {
            setShowStockReasonModal(false);
            router.push("/products");
            return;
        }

        console.error(result.message);
    };
    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <ProductForm
                formData={formData}
                updateField={updateField}
                onSubmit={handleSubmit}
                onCancel={()=>
                    router.back()
                }
                isSubmitting={isSubmitting}
                isEditMode
            />
            <StockReasonModal
                open={showStockReasonModal}
                onClose={() => setShowStockReasonModal(false)}
                onConfirm={handleStockReasonConfirm}
            />
        </div>
    );
}