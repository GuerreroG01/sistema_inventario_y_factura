"use client";

import { useEffect, useState } from "react";
import { getSales, getSale, updateSaleStatus } from "@/services/salesService";
import { getUsernameById } from "@/services/authService";
import { Sale } from "@/types/Sale";

export function useSales() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [selected, setSelected] = useState<Sale | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalSales, setTotalSales] = useState(0);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [username, setUsername] = useState("");
    

    const statusOptions = [
        {
            value: "PENDING",
            label: "Pendiente",
            description: "Venta creada pero aún no procesada o pagada.",
        },
        {
            value: "PAID",
            label: "Pagada",
            description: "El pago fue recibido correctamente.",
        },
        {
            value: "COMPLETED",
            label: "Completada",
            description: "La venta fue entregada/finalizada con éxito.",
        },
        {
            value: "CANCELLED",
            label: "Cancelada",
            description: "La venta fue cancelada antes de completarse.",
        },
        {
            value: "REFUNDED",
            label: "Devolución",
            description: "Se devolvió el dinero al cliente.",
        }
    ];

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

    const [startDate, setStartDate] = useState<string>(() => {
        const date = new Date();
        date.setDate(date.getDate() - 7 );
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
                const user = await getUsernameById(firstSale.created_by);
                setUsername(user);
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
            const user = await getUsernameById(sale.created_by);
            setUsername(user);
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

    const handleStatusChange = async (status: string) => {
        if (!selected) return;

        const res = await updateSaleStatus(selected.id, status);

        if (!res.ok) {
            setErrorMessage(res.message);

            // 👇 ahora depende del "code", no de requiresObservation
            if (
                res.code === "REFUND_OBSERVATION_REQUIRED" &&
                status === "REFUNDED"
            ) {
                setPendingStatus(status);
                setShowRefundModal(true);
                return;
            }

            console.error(res.message);
            return;
        }

        setSelected(res.data);

        setSales((prev) =>
            prev.map((sale) =>
                sale.id === res.data.id ? res.data : sale
            )
        );
    };
    const confirmRefund = async (observation: string) => {
        if (!selected || !pendingStatus) return;

        const res = await updateSaleStatus(
            selected.id,
            pendingStatus,
            observation
        );

        if (!res.ok) {
            setErrorMessage(res.message);
            return;
        }

        setSelected(res.data);

        setSales((prev) =>
            prev.map((sale) =>
                sale.id === res.data.id ? res.data : sale
            )
        );

        setShowRefundModal(false);
        setPendingStatus(null);
    };
    return {
        sales, selected, setSelected: selectSale, loading, startDate, setStartDate, endDate, setEndDate, page, setPage,
        totalPages, totalSales, fetchSales, statusStyle, handleStatusChange, statusOptions, showRefundModal, setShowRefundModal,
        pendingStatus, confirmRefund, errorMessage, username
    };
}