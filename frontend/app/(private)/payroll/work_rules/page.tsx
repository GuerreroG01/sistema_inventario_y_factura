"use client";

import PayrollRuleManager from "./components/PayrollRuleManager";
import { usePayrollRules } from "./hooks/usePayrollRules";

export default function PayrollPage() {
    const {
        rules, pagination, filters, loading, error,
        updateFilters, setPage, setLimit, resetFilters, refresh, updateRuleStatus
    } = usePayrollRules();

    return (
        <PayrollRuleManager
            rules={rules}
            pagination={pagination}
            filters={filters}
            loading={loading}
            error={error}
            updateFilters={updateFilters}
            setPage={setPage}
            setLimit={setLimit}
            resetFilters={resetFilters}
            refresh={refresh}
            onChangeStatus={updateRuleStatus}
        />
    );
}