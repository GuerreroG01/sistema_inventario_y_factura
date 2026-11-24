
"use client";

import { Gift, Plus } from "lucide-react";

import BenefitRuleFilters from "./BenefitRuleFilters";
import BenefitRuleList from "./BenefitRuleList";
import BenefitRulePagination from "./BenefitRulePagination";
import BenefitRuleFormModal from "./BenefitRuleFormModal";
import type { BenefitRule, BenefitRuleFilters as BenefitRuleFiltersType,
    BenefitRulePaginationData, CreateBenefitRuleData, UpdateBenefitRuleData,
} from "@/types/worksheet/benefit/BenefitRule";

type BenefitRuleManagerProps = {
    rules: BenefitRule[];
    pagination: BenefitRulePaginationData;
    filters: BenefitRuleFiltersType;
    loading: boolean;
    error: string | null;
    updateFilters: (
        filters: Partial<BenefitRuleFiltersType>
    ) => void;
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
    resetFilters: () => void;
    refresh: () => void;
    modalOpen: boolean;
    modalMode: "create" | "edit";
    selectedRule: BenefitRule | null;
    mutationLoading: boolean;
    mutationError: string | null;
    handleCreate: () => void;
    handleEdit: (rule: BenefitRule) => void;
    handleCloseModal: () => void;
    createRule: (
        data: CreateBenefitRuleData
    ) => Promise<BenefitRule | null>;
    updateRule: (
        id: number,
        data: UpdateBenefitRuleData
    ) => Promise<BenefitRule | null>;
    onChangeStatus?: (
        id: number,
        active: boolean
    ) => Promise<BenefitRule>;
};

export default function BenefitRuleManager({
    rules, pagination, filters, loading, error, updateFilters, setPage, setLimit,
    resetFilters, modalOpen, modalMode, selectedRule, mutationLoading, mutationError,
    handleCreate, handleEdit, handleCloseModal, createRule, updateRule, onChangeStatus,
}: BenefitRuleManagerProps) {
    return (
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-b from-slate-50/50 to-white p-6 shadow-sm md:p-5">
            <div className="pointer-events-none absolute -left-40 -top-40 h-80 w-80 rounded-full bg-emerald-100/60 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-teal-100/60 blur-3xl" />

            <div className="relative z-10 space-y-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-slate-900">
                            <div className="rounded-2xl bg-emerald-600 p-2.5 text-white shadow-md shadow-emerald-500/20">
                                <Gift className="h-6 w-6" />
                            </div>

                            Beneficios Generales
                        </h1>

                        <p className="mt-1 max-w-2xl text-sm text-slate-500">
                            Gestiona los beneficios y las reglas generales que se aplican
                            por igual a todos los empleados.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleCreate}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-colors hover:bg-emerald-700"
                    >
                        <Plus className="h-5 w-5" />
                        Nueva regla
                    </button>
                </div>
                {error && (
                    <div
                        role="alert"
                        className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700"
                    >
                        {error}
                    </div>
                )}
                <BenefitRuleFilters
                    filters={filters}
                    onFiltersChange={updateFilters}
                    onReset={resetFilters}
                />
                <BenefitRuleList
                    rules={rules}
                    loading={loading}
                    error={error}
                    onEdit={handleEdit}
                    onChangeStatus={onChangeStatus}
                />
                {!loading && pagination.totalPages > 0 && (
                    <BenefitRulePagination
                        pagination={pagination}
                        onPageChange={setPage}
                        onLimitChange={setLimit}
                    />
                )}
            </div>
            <BenefitRuleFormModal
                open={modalOpen}
                mode={modalMode}
                rule={selectedRule}
                loading={mutationLoading}
                error={mutationError}
                onClose={handleCloseModal}
                onCreate={createRule}
                onUpdate={updateRule}
            />
        </section>
    );
}
