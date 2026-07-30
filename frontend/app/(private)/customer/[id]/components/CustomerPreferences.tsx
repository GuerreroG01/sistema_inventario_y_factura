"use client";

import { CustomerPreferences as CustomerPreferencesType } from "@/types/Customer";
import { CreditCard } from "lucide-react";
import { CreditBox } from "./CreditBox";
import { paymentTypeLabels } from "@/app/constants/paymentTypes";

interface CustomerPreferencesProps {
    data: CustomerPreferencesType;
}

export default function CustomerPreferences({data}: CustomerPreferencesProps) {
    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-bold text-slate-900">
                Hábitos de compra
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <CreditBox
                    title="Categoría más comprada"
                    value={
                        data.mostPurchasedCategory ??
                        "Sin compras registradas"
                    }
                />
                <CreditBox
                    title="Compra normalmente"
                    value={
                        data.mostRepeatedQuantity
                            ? `${data.mostRepeatedQuantity} unidad${data.mostRepeatedQuantity > 1 ? "es" : ""}`
                            : "Sin datos"
                    }
                />
                <CreditBox
                    title="Forma de pago habitual"
                    value={
                        data.favoritePaymentType
                            ? paymentTypeLabels[data.favoritePaymentType]
                            : "Sin datos"
                    }
                />
                <CreditBox
                    title="Cantidad promedio por producto"
                    value={
                        `${data.averageQuantity} unidades`
                    }
                />
            </div>

            {data.creditBehavior && (
                <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                            <CreditCard className="h-5 w-5"/>
                        </div>

                        <div>
                            <h3 className="font-bold text-slate-900">
                                Comportamiento de pago
                            </h3>
                            <p className="text-sm text-slate-500">
                                Evaluación del cliente al pagar sus compras a crédito
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <CreditBox
                            title="Compras a crédito"
                            value={
                                `${data.creditBehavior.creditPurchases} compras`
                            }
                        />
                        <CreditBox
                            title="Tiempo promedio de pago"
                            value={
                                data.creditBehavior.averagePaymentDays === 0
                                    ? "El mismo día"
                                    : `${data.creditBehavior.averagePaymentDays} días`
                            }
                        />
                        <CreditBox
                            title="Evaluación"
                            value={
                                data.creditBehavior.description
                            }
                        />
                    </div>
                </div>
            )}
        </section>
    );
}