"use client";

import { useRouter } from "next/navigation";

import ProductForm from "../form/components/ProductForm";
import { useProductForm } from "../form/hooks/useProductForm";

export default function NewProductPage() {
    const router = useRouter();

    const {
        formData, updateField, updateUnitField, addUnit, removeUnit, restoreUnit, submit,
        isSubmitting,
    } = useProductForm({});

    const handleSubmit = async ( e: React.FormEvent<HTMLFormElement> ) => {
        e.preventDefault();

        const result = await submit();

        if (result.success) {
            router.push("/products");
            return;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <ProductForm
                formData={formData}
                updateField={updateField}
                updateUnitField={updateUnitField}
                addUnit={addUnit}
                removeUnit={removeUnit}
                restoreUnit={restoreUnit}
                onSubmit={handleSubmit}
                onCancel={() => router.back()}
                isSubmitting={isSubmitting}
                isEditMode={false}
            />
        </div>
    );
}