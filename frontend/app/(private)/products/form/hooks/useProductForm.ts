import { useEffect, useMemo, useState } from "react";
import { getProduct, createProduct, updateProduct } from "@/services/productService";
import { Product } from "@/types/product";

export type ProductForm = {
    name: string;
    barcode: string;
    category: string;
    type_item: "Producto" | "Servicio";
    unit: string;
    price: string;
    hasPromotion: boolean;
    promotionPrice: string;
    promotionStart: string;
    promotionEnd: string;
    cost: string;
    stock: number;
    entryDate: string;
    expirationDate: string;
    active: boolean;
};

const initialFormState = (today: string): ProductForm => ({
    name: "",
    barcode: "",
    category: "",
    type_item: "Producto",
    unit: "",
    price: "",
    hasPromotion: false,
    promotionPrice: "",
    promotionStart: today,
    promotionEnd: "",
    cost: "",
    stock: 0,
    entryDate: today,
    expirationDate: "",
    active: true,
});

type SubmitResult =
    | {
        success: true;
    }
    | {
        success: false;
        message: string;
    }
    | {
        success: false;
        requiresStockReason: true;
        payload: any;
    };

type Props = {
    productId?: number;
};

export function useProductForm({ productId }: Props) {
    const today = useMemo(
        () => new Date().toISOString().split("T")[0],
        []
    );

    const [product, setProduct] = useState<Product | null>(null);
    const [loadingProduct, setLoadingProduct] = useState(false);
    const [formData, setFormData] = useState<ProductForm>(initialFormState(today));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = Boolean(product?.id);
        
    useEffect(() => {
        async function loadProduct(){
            if(!productId){
                setProduct(null);
                return;
            }

            try {
                setLoadingProduct(true);
                const data = await getProduct(productId);

                console.log(
                    "Producto cargado desde hook:",
                    data
                );
                setProduct(data);
            } catch(error){
                console.error(
                    "Error cargando producto:",
                    error
                );
            } finally {
                setLoadingProduct(false);
            }
        }
        loadProduct();
    },[productId]);

    useEffect(()=>{
        if(!product){
            if(!productId){
                setFormData(initialFormState(today));
            }
            return;
        }

        setFormData({
            name: product.name ?? "",
            barcode: product.barcode ?? "",
            category: product.category ?? "",
            type_item: product.type_item,
            unit: product.unit ?? "",
            price: String(product.price ?? ""),
            hasPromotion: product.hasPromotion ?? false,
            promotionPrice:
                product.promotionPrice != null
                    ? String(product.promotionPrice)
                    : "",
            promotionStart:
                product.promotionStart
                    ? product.promotionStart.split("T")[0]
                    : today,
            promotionEnd:
                product.promotionEnd
                    ? product.promotionEnd.split("T")[0]
                    : "",
            cost:
                product.cost != null
                    ? String(product.cost)
                    : "",
            stock: product.stock ?? 0,
            entryDate:
                product.entryDate
                    ? product.entryDate.split("T")[0]
                    : today,
            expirationDate:
                product.expirationDate
                    ? product.expirationDate.split("T")[0]
                    : "",
            active: product.active ?? true,
        });
    },[product,today,productId]);

    const updateField = <K extends keyof ProductForm>(
        field: K,
        value: ProductForm[K]
    )=>{
        setFormData(prev=>({
            ...prev,
            [field]:value
        }));
    };

    const reset = ()=>{
        setFormData(
            initialFormState(today)
        );
    };

    const buildPayload = ()=>({
        ...formData,
        price:Number(formData.price),
        promotionPrice:
            formData.hasPromotion &&
            formData.promotionPrice
                ? Number(formData.promotionPrice)
                : undefined,
        promotionStart:
            formData.hasPromotion
                ? formData.promotionStart
                : undefined,
        promotionEnd:
            formData.hasPromotion
                ? formData.promotionEnd
                : undefined,
        cost:
            formData.cost
                ? Number(formData.cost)
                : undefined,
        stock:
            formData.type_item === "Servicio"
                ? 0
                : Number(formData.stock),
    });

    const submit = async():Promise<SubmitResult>=>{
        setIsSubmitting(true);

        try {
            const payload = buildPayload();

            if(isEditMode && product){
                const diff =
                    Number(formData.stock) - product.stock;
                if(
                    product.type_item === "Producto" &&
                    formData.type_item === "Producto" &&
                    diff < 0
                ){
                    return {
                        success:false,
                        requiresStockReason:true,
                        payload
                    };
                }
                const res = await updateProduct(
                    product.id,
                    payload
                );
                if(!res.ok){
                    return {
                        success:false,
                        message:res.message
                    };
                }
            } else{
                await createProduct(payload);
            }
            return {
                success:true
            };
        }catch(error:any){
            return {
                success:false,
                message:error.message ?? "Error inesperado"
            };
        } finally{
            setIsSubmitting(false);
        }
    };

    const submitWithStockReason = async(reason:string):Promise<SubmitResult>=>{

        if(!product){
            return {
                success:false,
                message:"Producto inválido"
            };
        }

        try {
            const payload = {
                ...buildPayload(),
                stockObservation:reason
            };

            const res = await updateProduct(
                product.id,
                payload
            );

            if(!res.ok){
                return {
                    success:false,
                    message:res.message
                };
            }
            return { success:true };
        } catch(error:any){
            return {
                success:false,
                message:error.message ?? "Error inesperado"
            };
        }
    };

    return {
        product, formData, updateField, setFormData, reset, submit, submitWithStockReason, isSubmitting, isEditMode, loadingProduct
    };
}