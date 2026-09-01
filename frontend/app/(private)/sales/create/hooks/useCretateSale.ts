"use client";

import { useState, useEffect } from "react";
import { createSale } from "@/services/salesService";
import { autocompleteProducts } from "@/services/productService";
import { getCustomerAutocomplete } from "@/services/customerService";
import { CustomerAutocomplete } from "@/types/Customer";
import { Product, ProductUnit } from "@/types/product";

export type SaleItem = {
    product_unit_id: number;
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    tipo_item: string;
    stock_disponible: number;
    es_promocion: boolean;
};

const emptyItem: SaleItem = {
    product_unit_id: 0,
    descripcion: "",
    cantidad: 1,
    precio_unitario: 0,
    tipo_item: "",
    stock_disponible: 0,
    es_promocion: false
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
    const [productResults, setProductResults] = useState<Product[]>([]);
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
    
    const isPromotionActive = (productUnit: ProductUnit) => {
        const now = new Date();

        const promotionStart = productUnit.promotionStart
            ? new Date(productUnit.promotionStart)
            : null;

        const promotionEnd = productUnit.promotionEnd
            ? new Date(productUnit.promotionEnd)
            : null;

        if (promotionEnd) {
            promotionEnd.setUTCDate(promotionEnd.getUTCDate() + 1);
        }

        return (
            productUnit.hasPromotion === true &&
            productUnit.promotionPrice != null &&
            (!promotionStart || promotionStart <= now) &&
            (!promotionEnd || now < promotionEnd)
        );
    };

    const searchProducts = async (value: string) => {
        try {
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

    const addProductUnit = (
        product: Product,
        productUnit: ProductUnit
    ) => {
        const promotionActive = isPromotionActive(productUnit);

        setItems(prev => {
            // Primero intentamos consumir promoción
            if (
                promotionActive &&
                Number(productUnit.promotionQuantity ?? 0) > 0
            ) {
                const promotionStock = Number(
                    productUnit.promotionQuantity ?? 0
                );

                const existingPromotion = prev.find(
                    item =>
                        item.product_unit_id === productUnit.id &&
                        item.es_promocion
                );

                if (existingPromotion) {
                    if ( existingPromotion.cantidad >= promotionStock ) {
                    } else {
                        return prev.map(item =>
                            item.product_unit_id === productUnit.id &&
                            item.es_promocion
                                ? {
                                    ...item,
                                    cantidad: item.cantidad + 1
                                }
                                : item
                        );
                    }
                } else {
                    return [
                        ...prev,
                        {
                            product_unit_id: productUnit.id,
                            descripcion: `${product.name} - ${productUnit.unit}`,
                            cantidad: 1,
                            precio_unitario: Number(
                                productUnit.promotionPrice
                            ),
                            tipo_item: product.type_item,
                            stock_disponible: promotionStock,
                            es_promocion: true
                        }
                    ];
                }
            }

            const normalStock = Number(productUnit.stock);

            const existingNormal = prev.find(
                item =>
                    item.product_unit_id === productUnit.id &&
                    !item.es_promocion
            );

            if (existingNormal) {
                if (existingNormal.cantidad >= normalStock) {
                    return prev;
                }

                return prev.map(item =>
                    item.product_unit_id === productUnit.id &&
                    !item.es_promocion
                        ? {
                            ...item,
                            cantidad: item.cantidad + 1
                        }
                        : item
                );
            }

            if (normalStock <= 0) {
                return prev;
            }

            return [
                ...prev,
                {
                    product_unit_id: productUnit.id,
                    descripcion: `${product.name} - ${productUnit.unit}`,
                    cantidad: 1,
                    precio_unitario: Number(productUnit.price),
                    tipo_item: product.type_item,
                    stock_disponible: normalStock,
                    es_promocion: false
                }
            ];
        });

        setSearchProduct("");
        setProductResults([]);
    };
    const addItem = () => {
        if (!item.product_unit_id) {
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
        productUnitId: number,
        cantidad: number,
        esPromocion: boolean
    ) => {
        setItems(prev =>
            prev.map(item => {
                if (
                    item.product_unit_id !== productUnitId ||
                    item.es_promocion !== esPromocion
                ) {
                    return item;
                }

                const nuevaCantidad = Math.min(
                    Math.max(1, cantidad),
                    item.stock_disponible
                );

                return {
                    ...item,
                    cantidad: nuevaCantidad
                };
            })
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

        } catch (error: unknown) {
            if (error instanceof Error) {
                setMessage(error.message);
            } else {
                setMessage("Error al crear venta");
            }
        } finally {
            setLoading(false);
        }
    };

    return {
        fecha, category, client_id, setCategory, setClientId, items, setItems, item, setItem,
        searchProduct, setSearchProduct, productResults, setProductResults, searchLoading,
        addProductUnit, addItem, removeItem, updateItemQuantity, updateItem, now,
        total, loading, message, submit, successOpen, setSuccessOpen, searchCustomer,
        setSearchCustomer, customerResults, setCustomerResults, searchLoadingCus, selectCustomer,
        selectedCustomer, setSelectedCustomer, payment_type, setPaymentType, isPromotionActive
    };
}