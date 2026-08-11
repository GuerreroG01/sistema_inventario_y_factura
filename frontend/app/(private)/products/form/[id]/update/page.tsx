"use client";


import { useRouter, useParams } from "next/navigation";

import ProductForm from "../../components/ProductForm";
import { useProductForm } from "../../hooks/useProductForm";

export default function EditProductPage(){
    const router = useRouter();
    const params = useParams();
    const productId = Number(params.id);
    const { formData, updateField, submit, isSubmitting } = useProductForm({ productId });
    
    const handleSubmit = async ( e:React.FormEvent<HTMLFormElement> )=>{
        e.preventDefault();
        const result = await submit();

        if(result.success){
            router.push("/products");
        }
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
        </div>
    );
}