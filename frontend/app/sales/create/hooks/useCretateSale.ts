"use client";

import { useState, useEffect } from "react";
import { createSale } from "@/services/salesService";
import { autocompleteProducts } from "@/services/productService";

export type SaleItem = {
    product_id: number;
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    tipo_item: string;
};

const emptyItem: SaleItem = {
    product_id: 0,
    descripcion: "",
    cantidad: 1,
    precio_unitario: 0,
    tipo_item: ""
};

export function useCreateSale() {
    const [fecha] = useState(new Date().toISOString().split("T")[0]);
    const [category, setCategory] = useState("");
    const [client_id, setClientId] = useState<number | null>(null);

    const [items, setItems] = useState<SaleItem[]>([]);
    const [item, setItem] = useState<SaleItem>(emptyItem);

    const [searchProduct, setSearchProduct] = useState("");
    const [productResults, setProductResults] = useState<any[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const [now, setNow] = useState<string>("");
    const [successOpen, setSuccessOpen] = useState(false);

    useEffect(() => {
        setNow(
            new Intl.DateTimeFormat("es-NI", {
                dateStyle: "short",
                timeStyle: "short",
            }).format(new Date())
        );
    }, []);

    const searchProducts = async (value: string) => {
        setSearchProduct(value);

        if (!value) {
            setProductResults([]);
            return;
        }

        try {
            setSearchLoading(true);

            const data = await autocompleteProducts({
                name: value
            });

            setProductResults(data);
        } catch (error) {
            console.error("Error autocomplete:", error);
        } finally {
            setSearchLoading(false);
        }
    };

    const addProductDirect = (product: any) => {
        setItems(prev => {
            const existingItem = prev.find(
                item => item.product_id === product.id
            );

            if (existingItem) {
                return prev.map(item =>
                    item.product_id === product.id
                        ? {
                            ...item,
                            cantidad: item.cantidad + 1
                        }
                        : item
                );
            }

            return [
                ...prev,
                {
                    product_id: product.id,
                    descripcion: product.name,
                    cantidad: 1,
                    precio_unitario: Number(product.price),
                    tipo_item: product.category
                }
            ];
        });

        setSearchProduct("");
        setProductResults([]);
    };

    const addItem = () => {
        if (!item.product_id) {
            setMessage("Selecciona un producto");
            return;
        }

        if (item.cantidad <= 0) {
            setMessage("Cantidad inválida");
            return;
        }

        setItems(prev => [...prev, item]);
        setItem(emptyItem);
    };

    const removeItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const updateItemQuantity = (
        productId: number,
        cantidad: number
    ) => {
        setItems(prev =>
            prev.map(item =>
                item.product_id === productId
                    ? {
                        ...item,
                        cantidad: cantidad > 0 ? cantidad : 1
                    }
                    : item
            )
        );
    };

    const updateItem = (field: keyof SaleItem, value: string | number) => {
        setItem(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const total = items.reduce(
        (acc, current) =>
            acc + current.cantidad * current.precio_unitario,
        0
    );

    const submit = async () => {
        try {
            if (items.length === 0) {
                setMessage("Debe agregar al menos un producto");
                return;
            }

            setLoading(true);

            const sale = await createSale({
                fecha,
                category,
                client_id: client_id ?? undefined,
                items
            });
            setSuccessOpen(true);
            setItems([]);
            setItem(emptyItem);

        } catch (error: any) {
            setMessage(error.message || "Error al crear venta");
        } finally {
            setLoading(false);
        }
    };

    return {
        fecha, category, client_id, setCategory, setClientId, items, setItems, item, setItem,
        searchProduct, setSearchProduct, productResults, setProductResults, searchLoading, searchProducts,
        addProductDirect, addItem, removeItem, updateItemQuantity, updateItem, now,
        total, loading, message, submit, successOpen, setSuccessOpen,
    };
}