"use client";

import { useEffect, useState } from "react";
import { getSales, getSale } from "@/services/salesService";
import { Sale } from "@/types/Sale";

export function useSales() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [selected, setSelected] = useState<Sale | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalSales, setTotalSales] = useState(0);


    const [startDate, setStartDate] = useState<string>(() => {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date.toISOString().split("T")[0];
    });

    const [endDate, setEndDate] = useState<string>(() => {
        return new Date().toISOString().split("T")[0];
    });

    const fetchSales = async () => {
        try {
            setLoading(true);

            const data = await getSales(page, {
                fechaMin: startDate,
                fechaMax: endDate
            });

            setSales(data.sales);
            setTotalPages(data.totalPages);
            setTotalSales(data.total);

            if (!selected && data.sales.length > 0) {
                const firstSale = await getSale(data.sales[0].id);
                setSelected(firstSale);
            } else {
                setSelected(null);
            }
        } catch (error) {
            console.error("Error fetching sales:", error);
        } finally {
            setLoading(false);
        }
    };

    const selectSale = async (id: number) => {
        try {
            setLoading(true);

            const sale = await getSale(id);
            setSelected(sale);
        } catch (error) {
            console.error("Error fetching sale detail:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, [page, startDate, endDate]);

    // 🔹 estilos de estado
    const statusStyle = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return "bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-emerald-500/10";
            case "PENDING":
                return "bg-amber-50 text-amber-700 border-amber-200/60 ring-amber-500/10";
            case "CANCELLED":
                return "bg-rose-50 text-rose-700 border-rose-200/60 ring-rose-500/10";
            default:
                return "bg-slate-50 text-slate-700 border-slate-200/60 ring-slate-500/10";
        }
    };

    return {
        sales, selected, setSelected: selectSale, loading, startDate, setStartDate, endDate, setEndDate, page, setPage,
        totalPages, totalSales, fetchSales, statusStyle
    };
}