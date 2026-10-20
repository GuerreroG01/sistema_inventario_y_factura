"use client";

import { useEffect, useState } from "react";
import { Calendar, Plus, RefreshCw } from "lucide-react";
import Pagination from "./Pagination";
import PayrollPeriodList from "./PayrollPeriodsList";
import PayrollPeriodForm from "./PayrollPeriodForm";
import ModalError from "@/components/ModalError";
import { 
    PayrollPeriod, PayrollPeriodStatus, CreatePayrollPeriodData, CalculatePayrollResult, PayrollPeriodFilters as PayrollPeriodFiltersType
 } from "@/types/worksheet/payroll/PayrollPeriod";
import Filters from "./Filters";

type PayrollPeriodManagerProps = {
    periods: PayrollPeriod[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    filters: any;
    loading: boolean;
    error: string | null;
    formError: string | null;
    actionError: string | null;
    updateFilters: (filters: any) => void;
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
    resetFilters: () => void;
    refresh: () => void;
    createNewPeriod: (data: CreatePayrollPeriodData) => Promise<any>;
    editPeriod: (id: number, data: any) => Promise<any>;
    handleUpdateStatus: (id: number, newStatus: PayrollPeriodStatus) => Promise<any>;
    calculatePeriod: (id: number) => Promise<CalculatePayrollResult | null>;
};

export default function PayrollPeriodManager({
    periods, pagination, filters, loading, error, formError, actionError,
    updateFilters, setPage, setLimit, resetFilters, refresh, createNewPeriod,
    editPeriod, handleUpdateStatus, calculatePeriod
}: PayrollPeriodManagerProps) {
    const [modalErrorOpen, setModalErrorOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod | null>(null);

    useEffect(() => {
        if (actionError) {
            setModalErrorOpen(true);
        }
    }, [actionError]);

    const handleFormSubmit = async (data: CreatePayrollPeriodData) => {
        if (selectedPeriod) {
            await editPeriod(selectedPeriod.id, data);
        } else {
            await createNewPeriod(data);
        }
    };

    return (
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-b from-slate-50/50 to-white p-6 shadow-sm md:p-5 h-full flex flex-col">
            <div className="pointer-events-none absolute -left-40 -top-40 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-indigo-100/60 blur-3xl" />
            
            <div className="relative z-10 flex flex-col h-full space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between shrink-0">
                    <div>
                        <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-slate-900">
                            <div className="rounded-2xl bg-blue-600 p-2.5 text-white shadow-md shadow-blue-500/20">
                                <Calendar className="h-6 w-6" />
                            </div>
                            Períodos de Nómina
                        </h1>

                        <p className="mt-1 max-w-2xl text-sm text-slate-500">
                            Administra los ciclos de pago, genera cálculos y supervisa los estados.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={refresh}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
                            <span>Actualizar</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setSelectedPeriod(null); // Modo Crear
                                setIsFormOpen(true);
                            }}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-colors hover:bg-blue-700 active:scale-95"
                        >
                            <Plus className="h-5 w-5" />
                            Nuevo Período
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700 shadow-sm shrink-0">
                        {error}
                    </div>
                )}

                <Filters
                    filters={filters}
                    onFiltersChange={updateFilters}
                    onReset={resetFilters}
                />

                <div className="flex-1 min-h-0 flex flex-col">
                    <PayrollPeriodList
                        periods={periods}
                        loading={loading}
                        error={error}
                        onEditMode={(period) => {
                            setSelectedPeriod(period);
                            setIsFormOpen(true);
                        }}
                        handleUpdateStatus={handleUpdateStatus}
                        calculatePeriod={calculatePeriod}
                    />
                </div>
                <Pagination
                    total={pagination.total}
                    page={pagination.page}
                    limit={pagination.limit}
                    totalPages={pagination.totalPages}
                    loading={loading}
                    itemLabel="períodos"
                    onPageChange={setPage}
                    onLimitChange={setLimit}
                />
            </div>
            <PayrollPeriodForm
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setSelectedPeriod(null);
                }}
                formError={formError}
                onSubmit={handleFormSubmit}
                initialData={selectedPeriod}
            />
            <ModalError
                open={modalErrorOpen}
                message={actionError || ""}
                title="Acción no permitida"
                onClose={() => setModalErrorOpen(false)}
            />
        </section>
    );
}