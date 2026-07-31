"use client";

import { useState } from "react";
import { Users, CreditCard, UserCheck, AlertCircle, Eye, Edit, MoreVertical, Plus, Phone, UserX } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { useCustomer } from "../hooks/useCustomer";
import { CustomerModal } from "./CustomerModal";
import CustomerFilters from "./CustomerFilters";
import { useRouter } from "next/navigation";

type CustomerManagerProps = ReturnType<typeof useCustomer>;

export default function CustomerManager({
    customers, loading, pagination, filters, stats, page,
    setPage, isModalOpen, selectedCustomer, openCreateModal, openEditModal, closeModal,
    handleSubmit, handleChangeStatus, updateFilter, applyFilters
}: CustomerManagerProps) {
    const [openMenuId, setOpenMenuId] = useState<number | null>(null)
    const [openFilters, setOpenFilters] = useState(false);
    const router = useRouter();
    const pages = Array.from(
        { length: pagination.totalPages },
        (_, i) => i + 1
    );
    return (
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-b from-slate-50/50 to-white p-6 md:p-10 shadow-sm">
            <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-indigo-100/60 blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-slate-900">
                            <div className="rounded-2xl bg-blue-600 p-2.5 text-white shadow-md shadow-blue-500/20">
                                <Users className="h-6 w-6" />
                            </div>
                            Clientes
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Administra clientes, créditos y comportamiento de
                            compra del negocio.
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700"
                    >
                        <Plus className="h-5 w-5" />
                        Nuevo cliente
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                    <MetricCard
                        icon={Users}
                        title="Clientes registrados"
                        value={stats.totalCustomers}
                        color="blue"
                    />

                    <MetricCard
                        icon={UserCheck}
                        title="Clientes activos"
                        value={stats.activeCustomers}
                        color="emerald"
                    />

                    <MetricCard
                        icon={AlertCircle}
                        title="Clientes con deuda"
                        value={stats.customersWithDebt}
                        color="rose"
                    />

                    <MetricCard
                        icon={CreditCard}
                        title="Saldo pendiente"
                        value={stats.totalDebt.toLocaleString("es-NI", {
                            style: "currency",
                            currency: "NIO",
                        })}
                        color="violet"
                    />
                </div>
                <CustomerFilters
                    filters={filters}
                    updateFilter={updateFilter}
                    applyFilters={applyFilters}
                    open={openFilters}
                    setOpen={setOpenFilters}
                />

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[1, 2, 3].map((n) => (
                            <div
                                key={n}
                                className="h-64 rounded-2xl border border-slate-200 bg-slate-100/60 animate-pulse p-6"
                            />
                        ))}
                    </div>
                ) : customers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/50 p-12 text-center">
                        <div className="rounded-full bg-slate-100 p-4 text-slate-400 mb-3">
                            <Users className="h-8 w-8" />
                        </div>

                        <h3 className="text-base font-semibold text-slate-800">
                            No se encontraron clientes
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                            Intenta ajustar los filtros de búsqueda.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {customers.map((customer) => {
                            const balance = Number(customer.balance) || 0;
                            const creditLimit = Number(customer.credit_limit) || 0;
                            const hasBalance = balance > 0;
                            const effectiveLimit = creditLimit > 0 ? creditLimit : 1;

                            const creditUsagePercentage = Math.min(
                                Math.round(
                                    (balance / effectiveLimit) * 100
                                ),
                                100
                            );
                            const isNearLimit = creditUsagePercentage > 80;
                            const isMenuOpen = openMenuId === customer.id;

                            return (
                                <div
                                    key={customer.id}
                                    className={`group relative flex flex-col justify-between rounded-2xl border p-6 shadow-sm transition-all duration-300 ${
                                        customer.status === "ACTIVE"
                                            ? "border-slate-200 bg-white hover:shadow-xl hover:border-blue-200"
                                            : "border-slate-200 bg-slate-50 opacity-70"
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-start justify-between relative">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm shadow-md shadow-blue-500/20">
                                                    {customer.name
                                                        ? customer.name.substring(0, 2).toUpperCase()
                                                        : "CN"}
                                                </div>

                                                <div>
                                                    <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                                        {customer.name || "Sin nombre"}
                                                    </h2>

                                                    <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                                                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                                                        {customer.phone && customer.phone.trim() !== ""
                                                            ? customer.phone
                                                            : "Sin teléfono registrado"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="relative">
                                                <button 
                                                    onClick={() => setOpenMenuId(isMenuOpen ? null : customer.id)}
                                                    className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </button>

                                                {isMenuOpen && (
                                                    <div className="absolute right-0 top-full mt-1 w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg z-20 animate-in fade-in zoom-in-95 duration-150">
                                                        <button 
                                                            onClick={() => {
                                                                setOpenMenuId(null);
                                                                router.push(`/customer/${customer.id}`);
                                                            }}
                                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                                                        >
                                                            <Eye className="h-3.5 w-3.5 text-slate-400" />
                                                            Ver detalles
                                                        </button>

                                                        <button 
                                                            onClick={() => {
                                                                setOpenMenuId(null);
                                                                openEditModal(customer);
                                                            }}
                                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                                                        >
                                                            <Edit className="h-3.5 w-3.5 text-slate-400" />
                                                            Editar
                                                        </button>
                                                        
                                                        <button
                                                            onClick={() => {
                                                                setOpenMenuId(null);
                                                                handleChangeStatus(customer);
                                                            }}
                                                            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                                                                customer.status === "ACTIVE"
                                                                    ? "text-amber-600 hover:bg-amber-50"
                                                                    : "text-emerald-600 hover:bg-emerald-50"
                                                            }`}
                                                        >
                                                            {customer.status === "ACTIVE" ? (
                                                                <>
                                                                    <UserX className="h-3.5 w-3.5" />
                                                                    Desactivar
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <UserCheck className="h-3.5 w-3.5" />
                                                                    Activar
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-6 rounded-2xl bg-slate-50/80 p-4 border border-slate-100 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                    Saldo pendiente
                                                </span>

                                                <span
                                                    className={`text-sm font-extrabold ${
                                                        hasBalance
                                                            ? "text-rose-600"
                                                            : "text-emerald-600"
                                                    }`}
                                                >
                                                    {balance.toLocaleString(
                                                        "es-ES",
                                                        {
                                                            style: "currency",
                                                            currency: "NIO",
                                                        }
                                                    )}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 text-xs">
                                                <span className="text-slate-500 font-medium">
                                                    Límite de crédito
                                                </span>

                                                <span className="font-semibold text-slate-700">
                                                    {creditLimit > 0 ? (
                                                        creditLimit.toLocaleString("es-ES", {
                                                            style: "currency",
                                                            currency: "NIO",
                                                        })
                                                    ) : (
                                                        <span className="text-slate-400 italic">No asignado</span>
                                                    )}
                                                </span>
                                            </div>

                                            <div className="space-y-1 pt-1">
                                                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                                                    <span>Uso de crédito</span>
                                                    <span
                                                        className={
                                                            isNearLimit
                                                                ? "text-rose-500 font-bold"
                                                                : ""
                                                        }
                                                    >
                                                        {creditLimit > 0 ? `${creditUsagePercentage}%` : "N/D"}
                                                    </span>
                                                </div>

                                                <div className="h-1.5 w-full bg-slate-200/70 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${
                                                            isNearLimit
                                                                ? "bg-rose-500"
                                                                : "bg-blue-600"
                                                        }`}
                                                        style={{
                                                            width: `${creditLimit > 0 ? creditUsagePercentage : 0}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                {pagination.totalPages > 1 && (
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                        <button
                            type="button"
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="
                                px-4
                                py-2
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                text-slate-700
                                font-semibold
                                shadow-sm
                                hover:bg-slate-100
                                disabled:opacity-50
                                disabled:cursor-not-allowed
                                transition-all
                            "
                        >
                            Anterior
                        </button>

                        {pages.map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setPage(p)}
                                className={`min-w-11 px-4 py-2 rounded-xl font-semibold transition-all shadow-sm ${
                                    p === page
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-105"
                                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                                }`}
                            >
                                {p}
                            </button>
                        ))}

                        <button
                            type="button"
                            disabled={page === pagination.totalPages}
                            onClick={() => setPage(page + 1)}
                            className="
                                px-4
                                py-2
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                text-slate-700
                                font-semibold
                                shadow-sm
                                hover:bg-slate-100
                                disabled:opacity-50
                                disabled:cursor-not-allowed
                                transition-all
                            "
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>
            <CustomerModal
                open={isModalOpen}
                customer={selectedCustomer}
                onClose={closeModal}
                onSave={handleSubmit}
            />
        </section>
    );
}