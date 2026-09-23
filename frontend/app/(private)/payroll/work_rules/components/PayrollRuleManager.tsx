"use client";

import { Calculator, Plus } from "lucide-react";
import PayrollRuleFilters from "./PayrollRuleFilters";
import PayrollRuleList from "./PayrollRuleList";
import PayrollRulePagination from "./PayrollRulePagination";
import { PayrollRule } from "@/types/worksheet/payroll/PayrollRule";
import { useCreatePayrollRule } from "../hooks/useCreatePayrollRule";
import PayrollRuleFormModal from "./PayrollRuleFormModal";

type PayrollRuleManagerProps = {
    rules: PayrollRule[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    filters: any;
    loading: boolean;
    error: string | null;
    updateFilters: (filters: any) => void;
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
    resetFilters: () => void;
    refresh: () => void;
    onChangeStatus?: (id: number, active: boolean) => Promise<PayrollRule>;
};

export default function PayrollRuleManager({
    rules, pagination, filters, loading, error,
    updateFilters, setPage, setLimit, resetFilters, 
    refresh, onChangeStatus
}: PayrollRuleManagerProps) {
    const {
        modalOpen, modalMode, selectedRule, loading: mutationLoading, error: mutationError,
        handleCreate, handleCreateVersion, handleCloseModal, createRule, createVersion,
    } = useCreatePayrollRule(refresh);
    return (
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-b from-slate-50/50 to-white p-6 shadow-sm md:p-5">
            <div className="pointer-events-none absolute -left-40 -top-40 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-indigo-100/60 blur-3xl" />
            <div className="relative z-10 space-y-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-slate-900">

                            <div className="rounded-2xl bg-blue-600 p-2.5 text-white shadow-md shadow-blue-500/20">
                                <Calculator className="h-6 w-6" />
                            </div>
                            Reglas de nómina
                        </h1>

                        <p className="mt-1 max-w-2xl text-sm text-slate-500">
                            Administra las reglas utilizadas para calcular
                            ingresos, deducciones y costos patronales.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleCreate}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-colors hover:bg-blue-700"
                    >
                        <Plus className="h-5 w-5" />

                        Nueva regla
                    </button>
                </div>
                {error && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
                        {error}
                    </div>
                )}
                <PayrollRuleFilters
                    filters={filters}
                    onFiltersChange={updateFilters}
                    onReset={resetFilters}
                />
                <PayrollRuleList
                    rules={rules}
                    loading={loading}
                    error={error}
                    onCreateVersion={handleCreateVersion}
                    onChangeStatus={onChangeStatus}
                />
                {!loading && pagination.totalPages > 0 && (
                    <PayrollRulePagination
                        pagination={pagination}
                        onPageChange={setPage}
                        onLimitChange={setLimit}
                    />
                )}
            </div>
            <PayrollRuleFormModal
                open={modalOpen}
                mode={modalMode}
                rule={selectedRule}
                loading={mutationLoading}
                error={mutationError}
                onClose={handleCloseModal}
                onCreate={createRule}
                onCreateVersion={createVersion}
            />
        </section>
    );
}