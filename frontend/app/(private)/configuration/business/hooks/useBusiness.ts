"use client";

import { useEffect, useState } from "react";
import { getBusinesses, createBusiness, changeBusinessStatus, deleteBusiness } from "@/services/businessService";
import { Business } from "@/types/Business";

export function useBusinesses() {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
    const [success, setSuccess] = useState("");

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
            setSuccess("El negocio se creó correctamente.");
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
            setSuccess("El estado del negocio se actualizó correctamente.");
            await loadBusinesses();
        } catch (error: any) {
            setError(error.message);
        }
    }

    async function handleDelete(id: number) {
        try {
            setLoading(true);
            await deleteBusiness(id);
            setSuccess("El negocio se eliminó correctamente.");
            await loadBusinesses();
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }
    const activeBusinesses = businesses.filter(business => business.status === "ACTIVE").length;
    return {
        businesses, loading, error, setError, handleCreate, handleStatus, handleDelete, 
        activeBusinesses, name, setName, isDeleteOpen, setIsDeleteOpen, selectedBusiness,
        setSelectedBusiness, success, setSuccess
    };
}