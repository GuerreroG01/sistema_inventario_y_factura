
import { useState } from "react";
import { createBenefitRule, updateBenefitRule } from "@/services/Worksheet/Benefit/BenefitRuleService";
import { BenefitRule, CreateBenefitRuleData, UpdateBenefitRuleData } from "@/types/worksheet/benefit/BenefitRule";

type ModalMode = "create" | "edit";

export function useCreateBenefitRule(
    refresh: () => void | Promise<void>
) {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>("create");
    const [selectedRule, setSelectedRule] = useState<BenefitRule | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreate = () => {
        setSelectedRule(null);
        setModalMode("create");
        setError(null);
        setModalOpen(true);
    };

    const handleEdit = (rule: BenefitRule) => {
        setSelectedRule(rule);
        setModalMode("edit");
        setError(null);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        if (loading) return;

        setModalOpen(false);
        setSelectedRule(null);
        setError(null);
    };

    const createRule = async (
        rule: CreateBenefitRuleData
    ): Promise<BenefitRule | null> => {
        setLoading(true);
        setError(null);

        try {
            const createdRule = await createBenefitRule(rule);

            await refresh();

            setModalOpen(false);
            setSelectedRule(null);

            return createdRule;
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Error al crear la regla de beneficio";

            setError(message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const updateRule = async (
        id: number,
        rule: UpdateBenefitRuleData
    ): Promise<BenefitRule | null> => {
        setLoading(true);
        setError(null);

        try {
            const updatedRule = await updateBenefitRule(id, rule);

            await refresh();

            setModalOpen(false);
            setSelectedRule(null);

            return updatedRule;
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Error al actualizar la regla de beneficio";

            setError(message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        modalOpen,
        modalMode,
        selectedRule,
        loading,
        error,
        handleCreate,
        handleEdit,
        handleCloseModal,
        createRule,
        updateRule,
    };
}
