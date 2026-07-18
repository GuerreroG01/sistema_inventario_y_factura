"use client";

import { useEffect, useState } from "react";
import { getBusinesses, createBusiness, changeBusinessStatus, deleteBusiness } from "@/services/businessService";
import { Business } from "@/types/Business";

export function useBusinesses() {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadBusinesses();
    }, []);

    async function loadBusinesses() {
        try {
            setLoading(true);
            setError("");
            const data = await getBusinesses();
            setBusinesses(data);

        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }
    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) return;

        try {
            setLoading(true);
            await createBusiness(name);
            setName("");
            await loadBusinesses();
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleStatus(id: number,status: "ACTIVE" | "INACTIVE") {
        try {
            await changeBusinessStatus(
                id,
                status === "ACTIVE"
                    ? "INACTIVE"
                    : "ACTIVE"
            );
            await loadBusinesses();
        } catch (error: any) {
            setError(error.message);
        }
    }

    async function handleDelete(id: number) {
        const confirmDelete = window.confirm(
            "¿Desea eliminar esta empresa?"
        );
        if (!confirmDelete) return;
        try {
            await deleteBusiness(id);
            await loadBusinesses();
        } catch (error: any) {
            setError(error.message);
        }
    }
    const activeBusinesses = businesses.filter(business => business.status === "ACTIVE").length;
    return {
        businesses, loading, error, handleCreate, handleStatus, handleDelete, activeBusinesses, name, setName
    };
}