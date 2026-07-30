"use client";

import { useCustomerDetail } from "../hooks/useCustomerDetail";
import { Phone, Mail, MapPin, CreditCard, User, CalendarDays, ShoppingCart, Clock, DollarSign } from "lucide-react";
import { InfoCard } from "./InfoCard";
import { CreditBox } from "./CreditBox";
import CustomerSaleHistory from "./CustomerSaleHistory";
import CustomerPreferences from "./CustomerPreferences";

export default function CustomerDetail({ id }: { id:number }) {
    const {
        customer, indicators, summary, salesHistory, loading, preferences, reloadSales
    } = useCustomerDetail(id);

    if (loading) {
        return (
            <section className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
                <div className="animate-pulse space-y-5">
                    <div className="h-10 w-48 rounded-xl bg-slate-200" />
                    <div className="h-32 rounded-2xl bg-slate-100" />
                    <div className="grid grid-cols-3 gap-5">
                        <div className="h-28 rounded-2xl bg-slate-100" />
                        <div className="h-28 rounded-2xl bg-slate-100" />
                        <div className="h-28 rounded-2xl bg-slate-100" />
                    </div>
                </div>
            </section>
        );
    }

    if (!customer) {
        return (
            <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <User className="mx-auto mb-3 h-10 w-10 text-slate-400" />
                <h2 className="font-bold text-slate-800">
                    Cliente no encontrado
                </h2>
            </section>
        );
    }

    return (
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-b from-slate-50/50 to-white p-6 md:p-10 shadow-sm">
            <div className="relative z-10 space-y-8">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-5">
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl font-extrabold text-white shadow-lg shadow-blue-500/20">
                                {customer.name
                                    ? customer.name.substring(0,2).toUpperCase()
                                    : "CN"
                                }
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                                    {customer.name}
                                </h1>
                                <p className="mt-1 text-sm text-slate-500">
                                    Cliente #{customer.id}
                                </p>
                                <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                                    <User className="h-4 w-4" />
                                    <span>Identificación:{customer.identification}</span>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                                            customer.status === "ACTIVE"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-slate-100 text-slate-600"
                                        }`}
                                    >
                                        {customer.status === "ACTIVE"
                                            ? "Activo"
                                            : "Inactivo"
                                        }
                                    </span>
                                    {customer.balance > 0 && (

                                        <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">
                                            Cliente con deuda
                                        </span>

                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="rounded-2xl bg-slate-50 px-5 py-4 text-center">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Saldo actual
                            </p>
                            <p
                                className={`mt-1 text-xl font-extrabold ${
                                    customer.balance > 0
                                    ? "text-rose-600"
                                    : "text-emerald-600"
                                }`}
                            >
                                {customer.balance.toLocaleString(
                                    "es-ES",
                                    {
                                        style:"currency",
                                        currency:"NIO"
                                    }
                                )}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-900">
                        Información del cliente
                    </h2>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        <InfoCard
                            icon={<Phone />}
                            title="Teléfono"
                            value={customer.phone ?? "No registrado"}
                        />
                        <InfoCard
                            icon={<Mail />}
                            title="Correo electrónico"
                            value={customer.email ?? "No registrado"}
                        />
                        <InfoCard
                            icon={<MapPin />}
                            title="Dirección"
                            value={customer.address ?? "No registrada"}
                        />
                    </div>
                </div>
                {indicators && (
                    <div className="space-y-4">

                        <h2 className="text-lg font-bold text-slate-900">
                            Indicadores del cliente
                        </h2>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

                            <InfoCard
                                icon={<CalendarDays />}
                                title="Cliente desde"
                                value={
                                    new Date(
                                        indicators.customerSince
                                    ).toLocaleDateString("es-ES")
                                }
                            />

                            <InfoCard
                                icon={<Clock />}
                                title="Última compra"
                                value={
                                    indicators.lastPurchase
                                    ? new Date(
                                        indicators.lastPurchase
                                    ).toLocaleDateString("es-ES")
                                    : "Sin compras"
                                }
                            />

                            <InfoCard
                                icon={<ShoppingCart />}
                                title="Ventas pendientes"
                                value={String(indicators.pendingSales)}
                            />
                        </div>
                    </div>
                )}
                {summary && (
                    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

                        <h2 className="mb-6 text-lg font-bold text-slate-900">
                            Resumen de compras
                        </h2>


                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

                            <CreditBox
                                title="Cantidad de Compras"
                                value={String(summary.totalSales)}
                            />

                            <CreditBox
                                title="Total comprado"
                                value={summary.totalPurchased.toLocaleString(
                                    "es-ES",
                                    {
                                        style:"currency",
                                        currency:"NIO"
                                    }
                                )}
                            />

                            <CreditBox
                                title="Compras crédito"
                                value={summary.creditPurchases.toLocaleString(
                                    "es-ES",
                                    {
                                        style:"currency",
                                        currency:"NIO"
                                    }
                                )}
                            />

                            <CreditBox
                                title="Compras contado"
                                value={summary.cashPurchases.toLocaleString(
                                    "es-ES",
                                    {
                                        style:"currency",
                                        currency:"NIO"
                                    }
                                )}
                            />

                        </div>

                    </section>
                )}
                
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                                <CreditCard className="h-5 w-5"/>
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-900">
                                    Información crediticia
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Control de límite y consumo
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
                        <CreditBox
                            title="Límite asignado"
                            value={customer.credit_limit.toLocaleString(
                                "es-ES",
                                {
                                    style:"currency",
                                    currency:"NIO"
                                }
                            )}
                        />
                        <CreditBox
                            title="Saldo pendiente"
                            danger
                            value={customer.balance.toLocaleString(
                                "es-ES",
                                {
                                    style:"currency",
                                    currency:"NIO"
                                }
                            )}
                        />
                        <CreditBox
                            title="Estado"
                            value={customer.status}
                        />
                    </div>
                    <div className="mt-6">
                        <div className="mb-2 flex justify-between text-xs font-semibold text-slate-500">
                            <span>
                                Uso del crédito
                            </span>
                            <span>
                                {customer.credit_limit > 0
                                    ? Math.round(
                                        (customer.balance /
                                        customer.credit_limit) * 100
                                    )
                                    : 0
                                }%
                            </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                            <div
                                className="h-full rounded-full bg-blue-600 transition-all"
                                style={{
                                    width:`${
                                        customer.credit_limit > 0
                                        ? Math.min(
                                            (customer.balance /
                                            customer.credit_limit) * 100,
                                            100
                                        )
                                        : 0
                                    }%`
                                }}
                            />
                        </div>
                    </div>
                </div>
                {preferences && (
                    <CustomerPreferences
                        data={preferences}
                    />
                )}
                {salesHistory && (
                    <CustomerSaleHistory
                        data={salesHistory}
                        onPageChange={reloadSales}
                    />
                )}
            </div>
        </section>
    );
}