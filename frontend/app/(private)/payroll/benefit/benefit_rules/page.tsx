
"use client";

import BenefitRuleManager from "./components/BenefitRuleManager";
import { useBenefitRules } from "./hooks/useBenefitRules";
import { useCreateBenefitRule } from "./hooks/useCreateBenefitRule";

export default function BenefitPage() {
    const {
        rules, pagination, filters, loading, error, setFilters, changePage,
        resetFilters, refresh, toggleRuleStatus,
    } = useBenefitRules();

    const {
        modalOpen, modalMode, selectedRule, loading: mutationLoading, error: mutationError,
        handleCreate, handleEdit, handleCloseModal, createRule, updateRule
    } = useCreateBenefitRule(refresh);

    const updateRuleStatus = async (
        id: number,
        active: boolean
    ) => {
        const rule = rules.find((item) => item.id === id);

        if (!rule) {
            throw new Error("No se encontró la regla de beneficio");
        }
        if (rule.is_active === active) {
            return rule;
        }

        await toggleRuleStatus(rule);
        const updatedRule = {
            ...rule,
            is_active: active,
        };

        return updatedRule;
    };

    return (
        <BenefitRuleManager
            rules={rules}
            pagination={pagination}
            filters={filters}
            loading={loading}
            error={error}
            updateFilters={setFilters}
            setPage={changePage}
            setLimit={(limit) =>
                setFilters({ limit, page: 1 })
            }
            resetFilters={resetFilters}
            refresh={refresh}
            modalOpen={modalOpen}
            modalMode={modalMode}
            selectedRule={selectedRule}
            mutationLoading={mutationLoading}
            mutationError={mutationError}
            handleCreate={handleCreate}
            handleEdit={handleEdit}
            handleCloseModal={handleCloseModal}
            createRule={createRule}
            updateRule={updateRule}
            onChangeStatus={updateRuleStatus}
        />
    );
}
