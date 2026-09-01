import { useEffect, useMemo, useState } from "react";
import { getProduct, createProduct, updateProduct } from "@/services/productService";
import { Product, CreateProduct, UpdateProduct } from "@/types/product";

type Branch = {
    id: number;
    name: string;
}
export type ProductUnitForm = {
    id?: number;
    branch?: Branch | null;
    unit: string;
    barcode: string;
    price: string;
    cost: string;
    stock: number;
    hasPromotion: boolean;
    promotionPrice: string;
    promotionQuantity: string;
    promotionStart: string;
    promotionEnd: string;
    entryDate: string;
    expirationDate: string;
    active: boolean;
};

export type ProductForm = {
    name: string;
    category: string;
    type_item: "Producto" | "Servicio";
    active: boolean;
    units: ProductUnitForm[];
};

const initialUnitState = (today: string): ProductUnitForm => ({
    unit: "",
    barcode: "",
    price: "",
    cost: "",
    stock: 0,

    hasPromotion: false,
    promotionPrice: "",
    promotionQuantity: "",
    promotionStart: today,
    promotionEnd: "",

    entryDate: today,
    expirationDate: "",

    active: true,
});
const initialFormState = (today: string): ProductForm => ({
    name: "",
    category: "",
    type_item: "Producto",
    active: true,

    units: [
        initialUnitState(today)
    ],
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

type UpdateResult =
    | {
          success: true;
      }
    | {
          success: false;
          message: string;
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

    const [loadingProduct, setLoadingProduct] =
        useState(false);

    const [formData, setFormData] =
        useState<ProductForm>(
            initialFormState(today)
        );

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const isEditMode = Boolean(productId);

    useEffect(() => {
        async function loadProduct() {
            if (!productId) {
                setProduct(null);
                setFormData(
                    initialFormState(today)
                );
                return;
            }
            try {
                setLoadingProduct(true);
                const data = await getProduct(productId);
                console.log(
                    "[useProductForm] Producto cargado:",
                    data
                );

                setProduct(data);
            } catch (error) {
                console.error(
                    "[useProductForm] Error cargando producto:",
                    error
                );

                setProduct(null);
            } finally {
                setLoadingProduct(false);
            }
        }
        loadProduct();
    }, [productId, today]);

    const mapProductToForm = (
        product: Product,
        today: string
    ): ProductForm => ({
        name: product.name ?? "",
        category: product.category ?? "",
        type_item:
            product.type_item ?? "Producto",
        active:
            product.active ?? true,

        units: (product.units ?? []).map(
            (unit) => ({
                id: unit.id,
                branch: unit.branch
                    ? {
                        id: unit.branch.id,
                        name: unit.branch.name,
                    }
                    : null,
                unit: unit.unit ?? "",
                barcode: unit.barcode ?? "",
                price:
                    unit.price != null
                        ? String(unit.price)
                        : "",
                cost:
                    unit.cost != null
                        ? String(unit.cost)
                        : "",
                stock: unit.stock ?? 0,
                hasPromotion:
                    unit.hasPromotion ?? false,
                promotionPrice:
                    unit.promotionPrice != null
                        ? String(unit.promotionPrice)
                        : "",
                promotionQuantity:
                    unit.promotionQuantity != null
                        ? String(unit.promotionQuantity)
                        : "",
                promotionStart:
                    unit.promotionStart
                        ? unit.promotionStart.split("T")[0]
                        : today,
                promotionEnd:
                    unit.promotionEnd
                        ? unit.promotionEnd.split("T")[0]
                        : "",
                entryDate:
                    unit.entryDate
                        ? unit.entryDate.split("T")[0]
                        : today,
                expirationDate:
                    unit.expirationDate
                        ? unit.expirationDate.split("T")[0]
                        : "",
                active:
                    unit.active ?? true,
            })
        ),
    });
    useEffect(() => {
        if (!product) {
            if (!productId) {
                setFormData(
                    initialFormState(today)
                );
            }

            return;
        }

        setFormData(
            mapProductToForm(product, today)
        );
    }, [product, productId, today]);

    const updateField = <
        K extends keyof ProductForm
    >(
        field: K,
        value: ProductForm[K]
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const addUnit = () => {
        setFormData((prev) => ({
            ...prev,
            units: [
                ...prev.units,
                initialUnitState(today),
            ],
        }));
    };

    const removeUnit = (index: number) => {
        setFormData((prev) => {
            const unit = prev.units[index];

            if (!unit.id) {
                return {
                    ...prev,
                    units: prev.units.filter(
                        (_, i) => i !== index
                    ),
                };
            }

            return {
                ...prev,
                units: prev.units.map((item, i) =>
                    i === index
                        ? {
                            ...item,
                            active: false,
                        }
                        : item
                ),
            };
        });
    };
    const restoreUnit = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            units: prev.units.map((unit, i) =>
                i === index
                    ? {
                        ...unit,
                        active: true,
                    }
                    : unit
            ),
        }));
    };

    const updateUnitField = <
        K extends keyof ProductUnitForm
    >(
        index: number,
        field: K,
        value: ProductUnitForm[K]
    ) => {
        setFormData((prev) => ({
            ...prev,
            units: prev.units.map((unit, i) =>
                i === index
                    ? {
                        ...unit,
                        [field]: value,
                    }
                    : unit
            ),
        }));
    };

    const reset = () => {
        if (product) {
            setFormData(
                mapProductToForm(product, today)
            );
            return;
        }

        setFormData(
            initialFormState(today)
        );
    };

    const buildPayload = () => {
        const productData = {
            name: formData.name,
            category: formData.category || undefined,
            type_item: formData.type_item,
            active: formData.active,
        };

        const units = formData.units.map((unit) => ({
            ...(unit.id
                ? {
                    product_unit_id: unit.id,
                }
                : {}),

            unit: unit.unit,

            barcode: unit.barcode || undefined,

            price: Number(unit.price),

            cost: unit.cost
                ? Number(unit.cost)
                : undefined,

            stock:
                formData.type_item === "Servicio"
                    ? 0
                    : Number(unit.stock),

            hasPromotion: unit.hasPromotion,

            promotionPrice:
                unit.hasPromotion && unit.promotionPrice
                    ? Number(unit.promotionPrice)
                    : undefined,

            promotionQuantity:
                unit.hasPromotion && unit.promotionQuantity
                    ? Number(unit.promotionQuantity)
                    : undefined,

            promotionStart:
                unit.hasPromotion
                    ? unit.promotionStart || undefined
                    : undefined,

            promotionEnd:
                unit.hasPromotion
                    ? unit.promotionEnd || undefined
                    : undefined,

            entryDate:
                unit.entryDate || undefined,

            expirationDate:
                unit.expirationDate || undefined,

            active: unit.active,
        }));

        return {
            productData,
            units,
        };
    };

    const submit = async (): Promise<SubmitResult> => {
        setIsSubmitting(true);

        try {
            const { productData, units } = buildPayload();

            if (!isEditMode || !product) {
                const payload: CreateProduct = {
                    ...productData,
                    units: units.map((unit) => ({
                        unit: unit.unit,
                        barcode: unit.barcode,
                        price: unit.price,
                        cost: unit.cost,
                        stock: unit.stock,
                        hasPromotion: unit.hasPromotion,
                        promotionPrice: unit.promotionPrice,
                        promotionQuantity: unit.promotionQuantity,
                        promotionStart: unit.promotionStart,
                        promotionEnd: unit.promotionEnd,
                        entryDate: unit.entryDate,
                        expirationDate: unit.expirationDate,
                        active: unit.active,
                    })),
                };

                await createProduct(payload);

                return {
                    success: true,
                };
            }

            const stockChanges = units
                .filter(
                    (unit) =>
                        unit.product_unit_id !== undefined
                )
                .map((unit) => {
                    const previousUnit = product.units?.find(
                        (productUnit) =>
                            productUnit.id === unit.product_unit_id
                    );

                    const previousStock =
                        Number(previousUnit?.stock ?? 0);

                    const newStock =
                        Number(unit.stock ?? 0);

                    return {
                        unit,
                        previousStock,
                        newStock,
                        diff: newStock - previousStock,
                    };
                }
            );
            const hasStockReduction =
                product.type_item === "Producto" &&
                formData.type_item === "Producto" &&
                stockChanges.some(
                    ({ diff }) => diff < 0
                );

            if (hasStockReduction) {
                return {
                    success: false,
                    requiresStockReason: true,

                    payload: {
                        ...productData,
                        units,
                    },
                };
            }

            const payload: UpdateProduct = {
                ...productData,
                units,
            };

            const res = await updateProduct(
                product.id,
                payload
            );

            if (!res.ok) {
                return {
                    success: false,
                    message: res.message,
                };
            }
            setProduct(res.data);

            return {
                success: true,
            };
        } catch (error: any) {
            console.error(
                "[useProductForm] Error submit:",
                error
            );

            return {
                success: false,
                message:
                    error?.message ??
                    "Error inesperado",
            };
        } finally {
            setIsSubmitting(false);
        }
    };

    const submitWithStockReason = async (
        reason: string
    ): Promise<UpdateResult> => {
        if (!product) {
            return {
                success: false,
                message: "Producto inválido",
            };
        }

        try {
            const {
                productData,
                units,
            } = buildPayload();

            const unitsWithStockObservation = units.map(
                (unit) => {
                    if (unit.product_unit_id === undefined) {
                        return unit;
                    }

                    const previousUnit =
                        product.units?.find(
                            (productUnit) =>
                                productUnit.id ===
                                unit.product_unit_id
                        );

                    const previousStock =
                        Number(
                            previousUnit?.stock ?? 0
                        );

                    const newStock =
                        Number(unit.stock ?? 0);

                    const diff =
                        newStock - previousStock;

                    if (diff < 0) {
                        return {
                            ...unit,
                            stockObservation: reason,
                        };
                    }

                    return unit;
                }
            );

            const payload: UpdateProduct = {
                ...productData,
                units: unitsWithStockObservation,
            };

            const res = await updateProduct(
                product.id,
                payload
            );

            if (!res.ok) {
                return {
                    success: false,
                    message: res.message,
                };
            }

            setProduct(res.data);

            return {
                success: true,
            };
        } catch (error: any) {
            console.error(
                "[useProductForm] Error actualizando stock:",
                error
            );

            return {
                success: false,
                message:
                    error?.message ??
                    "Error inesperado",
            };
        }
    };

    return {
        product, formData, updateField, addUnit, removeUnit, restoreUnit, updateUnitField, setFormData,
        reset, submit, submitWithStockReason, isSubmitting, isEditMode, loadingProduct
    };
}