import { useCallback, useEffect, useState } from "react";
import { getInventoryMovements } from "@/services/inventoryMovService";
import {
    InventoryMovement,
    InventoryMovementsResponse,
    InventoryMovementsFilters
} from "@/types/inventoryMov";

interface UseInventoryMovementsReturn {
    movements: InventoryMovement[];
    pagination: InventoryMovementsResponse["pagination"];
    loading: boolean;
    error: string | null;
    page: number;
    setPage: (page:number)=>void;
    filters: InventoryMovementsFilters;
    updateFilter: (
        key: keyof InventoryMovementsFilters,
        value: string
    ) => void;
    applyFilters: () => void;
    reload: () => Promise<void>;
}

export const useInventoryMovements = (): UseInventoryMovementsReturn => {
    const [movements, setMovements] = useState<InventoryMovement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<InventoryMovementsFilters>({
        product: "",
        tipo: "",
        startDate: "",
        endDate: "",
        referencia: "",
        cantidadMin: "",
        cantidadMax: ""
    });
    const [activeFilters, setActiveFilters] = useState<InventoryMovementsFilters>({
        product: "",
        tipo: "",
        startDate: "",
        endDate: "",
        referencia: "",
        cantidadMin: "",
        cantidadMax: ""
    });

    const [pagination, setPagination] = useState({
        total:0,
        page:1,
        limit:10,
        totalPages:0
    });

    const updateFilter = (
        key: keyof InventoryMovementsFilters,
        value:string
    ) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const fetchMovements = useCallback(async()=>{
        try {
            setLoading(true);
            setError(null);
            const response = await getInventoryMovements({
                page,
                limit:10,
                ...activeFilters
            });
            setMovements(response.data);
            setPagination(response.pagination);
        } catch(error:any){
            setError(
                error.message ||
                "Error obteniendo movimientos"
            );
            setMovements([]);
        } finally {
            setLoading(false);
        }
    },[page, activeFilters]);

    const applyFilters = () => {
        setPage(1);
        setActiveFilters(filters);
    };

    useEffect(()=>{
        fetchMovements();
    },[fetchMovements]);

    return {
        movements, pagination, loading, error, page, setPage, filters, updateFilter, applyFilters,
        reload: fetchMovements
    };
};