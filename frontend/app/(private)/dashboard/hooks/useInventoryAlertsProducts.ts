import { useState, useCallback } from "react";
import { getStockAlerts } from "@/services/productService";
import type { InventoryAlertsProductsData } from "../../../../types/dashboard/inventoryAlertsProducts";

const initialData: InventoryAlertsProductsData = {
    exhausted: [],
    critical: []
};

interface UseInventoryAlertsProductsReturn {
    products: InventoryAlertsProductsData;
    loading: boolean;
    error: string | null;
    loadProducts: () => Promise<void>;
    clearProducts: () => void;
}

export const useInventoryAlertsProducts =
    (): UseInventoryAlertsProductsReturn => {

    const [products,setProducts] = useState<InventoryAlertsProductsData>(initialData);
    const [loading,setLoading] = useState<boolean>(false);
    const [error,setError] = useState<string | null>(null);

    const loadProducts = useCallback(async()=>{
        try {
            setLoading(true);
            setError(null);

            const response = await getStockAlerts();
            setProducts(response);
        } catch(error:any){
            setError(
                error.message ||
                "Error obteniendo productos con alertas"
            );
            setProducts(initialData);
        } finally {
            setLoading(false);
        }
    },[]);

    const clearProducts = useCallback(()=>{
        setProducts(initialData);
    },[]);

    return {
        products, loading, error, loadProducts, clearProducts
    };
};