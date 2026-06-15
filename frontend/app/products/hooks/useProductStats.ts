import { useEffect, useState } from "react";
import { getProductStats } from "@/services/productService";

type Stats = {
    totalProducts: number;
    totalStock: number;
    activeProducts: number;
    lowStock: number;
};

export function useProductStats() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        async function fetchStats() {
        try {
            setLoading(true);
            const data = await getProductStats();
            setStats(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
        }

        fetchStats();
    }, []);

    return { stats, loading, error };
}