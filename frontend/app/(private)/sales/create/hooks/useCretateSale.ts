"use client";

import { useState, useEffect } from "react";
import { createSale } from "@/services/salesService";
import { autocompleteProducts } from "@/services/productService";
import { getCustomerAutocomplete } from "@/services/customerService";
import { CustomerAutocomplete } from "@/types/Customer";

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
    const [payment_type, setPaymentType] = useState<
        "CASH" | "CREDIT" | "CARD" | "TRANSFER"
    >("CASH");

    const [items, setItems] = useState<SaleItem[]>([]);
    const [item, setItem] = useState<SaleItem>(emptyItem);

    const [searchProduct, setSearchProduct] = useState("");
    const [productResults, setProductResults] = useState<any[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [customerResults, setCustomerResults] = useState<CustomerAutocomplete[]>([]);
    const [searchLoadingCus, setSearchLoadingCus] = useState(false);
    const [searchCustomer, setSearchCustomer] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerAutocomplete | null>(null);

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
    
    const isPromotionActive = (product: any) => {
        const now = new Date();

        const promotionStart = product.promotionStart
            ? new Date(product.promotionStart)
            : null;

        const promotionEnd = product.promotionEnd
            ? new Date(product.promotionEnd)
            : null;

        if (promotionEnd) {
            promotionEnd.setUTCDate(promotionEnd.getUTCDate() + 1);
        }

        return (
            product.hasPromotion === true &&
            product.promotionPrice != null &&
            (!promotionStart || promotionStart <= now) &&
            (!promotionEnd || now < promotionEnd)
        );
    };

    const searchProducts = async (value: string) => {

        try {
            const data = await autocompleteProducts({
                name: value
            });
            console.log("Datos obtenidos del producto", data);

            setProductResults(data);

        } catch (error) {
            console.error("Error autocomplete:", error);
        } finally {
            setSearchLoading(false);
        }
    };

    const searchCustomers = async (value: string) => {
        try {
            const data = await getCustomerAutocomplete(value);

            setCustomerResults(data.customers);

        } catch (error) {
            console.error("Error autocomplete clientes:", error);
            setCustomerResults([]);

        } finally {
            setSearchLoadingCus(false);
        }
    };

    const selectCustomer = (customer: CustomerAutocomplete) => {
        setSelectedCustomer(customer);
        setClientId(customer.id);
        setSearchCustomer(customer.name);
        setCustomerResults([]);
    };

    useEffect(() => {

        if (searchProduct.length === 0) {
            setProductResults([]);
            setSearchLoading(false);
            return;
        }
        setSearchLoading(true);

        const timeout = setTimeout(() => {
            searchProducts(searchProduct);
        }, 500);

        return () => clearTimeout(timeout);

    }, [searchProduct]);

    useEffect(() => {
        if (
            selectedCustomer &&
            searchCustomer === selectedCustomer.name
        ) {
            setCustomerResults([]);
            setSearchLoadingCus(false);
            return;
        }

        if (searchCustomer.length === 0) {
            setCustomerResults([]);
            setClientId(null);
            setSelectedCustomer(null);
            setSearchLoadingCus(false);
            return;
        }

        if (searchCustomer.length < 2) {
            setCustomerResults([]);
            setSearchLoadingCus(false);
            return;
        }

        setSearchLoadingCus(true);

        const timeout = setTimeout(() => {
            searchCustomers(searchCustomer);
        }, 500);

        return () => clearTimeout(timeout);

    }, [searchCustomer, selectedCustomer]);

    const addProductDirect = (product: any) => {
        const promotionActive = isPromotionActive(product);

        const salePrice = promotionActive
            ? Number(product.promotionPrice)
            : Number(product.price);

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
                    precio_unitario: salePrice,
                    tipo_item: product.category || "",
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
                payment_type,
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
        searchProduct, setSearchProduct, productResults, setProductResults, searchLoading,
        addProductDirect, addItem, removeItem, updateItemQuantity, updateItem, now,
        total, loading, message, submit, successOpen, setSuccessOpen, searchCustomer,
        setSearchCustomer, customerResults, setCustomerResults, searchLoadingCus, selectCustomer,
        selectedCustomer, setSelectedCustomer, payment_type, setPaymentType, isPromotionActive
    };
}