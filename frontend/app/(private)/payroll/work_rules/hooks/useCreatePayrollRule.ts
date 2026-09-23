"use client";

import { useCallback, useState } from "react";
import { getPayrollRuleById, createPayrollRule, createPayrollRuleVersion } from "@/services/Worksheet/Payroll/PayrollRuleService";
import { PayrollRule, CreatePayrollRuleData, CreatePayrollRuleVersionData } from "@/types/worksheet/payroll/PayrollRule";

export function useCreatePayrollRule(refresh?: () => void | Promise<void>) {
    const [rule, setRule] = useState<PayrollRule | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "version">("create");
    const [selectedRule, setSelectedRule] = useState<PayrollRule | null>(null);

    const fetchRule = useCallback(async (id: number) => {
        try {
            setLoading(true);
            setError(null);

            const response = await getPayrollRuleById(id);
            setRule(response);
            return response;
        } catch (error: any) {
            const message =
                error?.message ||
                "Error al obtener la regla de nómina";

            setError(message);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const handleCreate = useCallback(() => {
        setError(null);
        setRule(null);
        setSelectedRule(null);
        setModalMode("create");
        setModalOpen(true);
    }, []);

    const handleCreateVersion = useCallback(
        async (rule: PayrollRule) => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetchRule(rule.id);

                setSelectedRule(response);
                setModalMode("version");
                setModalOpen(true);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        },
        [fetchRule]
    );

    const handleCloseModal = useCallback(() => {
        setModalOpen(false);
        setSelectedRule(null);
        setRule(null);
        setError(null);
    }, []);

    const createRule = useCallback(
        async (data: CreatePayrollRuleData) => {
            try {
                setLoading(true);
                setError(null);

                const response = await createPayrollRule(data);
                await refresh?.();
                setRule(response);

                return response;
            } catch (error: any) {
                const message =
                    error?.message ||
                    "Error al crear la regla de nómina";

                setError(message);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [refresh]
    );

    const createVersion = useCallback(
        async (
            id: number,
            data: CreatePayrollRuleVersionData
        ) => {
            try {
                setLoading(true);
                setError(null);

                const response = await createPayrollRuleVersion(
                    id,
                    data
                );

                setRule(response);
                await refresh?.();

                return response;
            } catch (error: any) {
                const message =
                    error?.message ||
                    "Error al crear la nueva versión de la regla";

                setError(message);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [refresh]
    );

    const clearRule = useCallback(() => {
        setRule(null);
        setSelectedRule(null);
        setError(null);
    }, []);

    return {
        rule, loading, error,
        modalOpen, modalMode, selectedRule,
        fetchRule,
        handleCreate, handleCreateVersion, handleCloseModal,
        createRule, createVersion,
        clearRule,
    };
}