"use client";

import { useState } from "react";
import { Tag, QrCode, Layers, DollarSign, TrendingUp, Package, Scale, Calendar, CalendarClock, Loader2, X } from "lucide-react";
import type { ProductForm } from "../hooks/useProductForm";
import PromotionPopover from "./PromotionPopover";
type Props = {
    formData: ProductForm;
    updateField: <K extends keyof ProductForm>(
        field: K,
        value: ProductForm[K]
    ) => void;
    onSubmit: (
        e: React.FormEvent<HTMLFormElement>
    ) => void;
    onCancel?: () => void;
    isSubmitting: boolean;
    isEditMode: boolean;
};

export default function ProductForm({ formData, updateField, onSubmit, onCancel, isSubmitting, isEditMode, }: Props) {
    const [showPromotionPopover, setShowPromotionPopover] = useState(false);
    const inputClass =
        "w-full pl-9 pr-3 py-2 text-sm bg-slate-50/60 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 placeholder:text-slate-400/80 disabled:opacity-60 disabled:cursor-not-allowed";
    
    const handleOpenPromotion = ( event: React.MouseEvent<HTMLButtonElement> ) => {
        setShowPromotionPopover(true);
    };
    const getPromotionStatus = () => {
        if (!formData.hasPromotion) {
            return "none";
        }

        if (
            formData.promotionEnd &&
            new Date(formData.promotionEnd) < new Date()
        ) {
            return "expired";
        }

        return "active";
    };
    const promotionStatus = getPromotionStatus();
    return (
        <form
            onSubmit={onSubmit}
            className="max-w-7xl mx-auto space-y-8"
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">
                        {isEditMode
                            ? "Editar producto"
                            : "Nuevo producto"}
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        {isEditMode
                            ? "Actualiza la información y configuración del producto."
                            : "Registra un nuevo producto o servicio en tu inventario."}
                    </p>
                </div>

                {isEditMode && (
                    <div
                        className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            formData.active
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
                        }`}
                    >
                        <span
                            className={`h-2 w-2 rounded-full ${
                                formData.active
                                    ? "bg-emerald-500"
                                    : "bg-slate-400"
                            }`}
                        />
                        {formData.active ? "Activo" : "Inactivo"}
                    </div>
                )}
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_40px_-15px_rgba(15,23,42,0.15)]">
                <section className="border-b border-slate-100">
                    <div className="px-5 py-5 sm:px-8">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <Tag className="h-5 w-5" />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-900">
                                    Información general
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Datos básicos para identificar el producto.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            <div className="lg:col-span-2">
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Nombre del producto
                                    <span className="ml-1 text-red-500">*</span>
                                </label>

                                <div className="relative">
                                    <Tag className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                    <input
                                        required
                                        disabled={isSubmitting}
                                        className={`${inputClass} pl-11 h-12 text-base`}
                                        placeholder="Ej. Laptop Dell Inspiron 15"
                                        value={formData.name}
                                        onChange={(e) =>
                                            updateField(
                                                "name",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Tipo
                                </label>

                                <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                                    <button
                                        type="button"
                                        disabled={isSubmitting}
                                        onClick={() => {
                                            updateField(
                                                "type_item",
                                                "Producto"
                                            );
                                        }}
                                        className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                                            formData.type_item === "Producto"
                                                ? "bg-white text-indigo-600 shadow-sm"
                                                : "text-slate-500 hover:text-slate-700"
                                        }`}
                                    >
                                        Producto
                                    </button>

                                    <button
                                        type="button"
                                        disabled={isSubmitting}
                                        onClick={() => {
                                            updateField(
                                                "type_item",
                                                "Servicio"
                                            );
                                            updateField("stock", 0);
                                        }}
                                        className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                                            formData.type_item === "Servicio"
                                                ? "bg-white text-indigo-600 shadow-sm"
                                                : "text-slate-500 hover:text-slate-700"
                                        }`}
                                    >
                                        Servicio
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Código de barras
                                </label>

                                <div className="relative">
                                    <QrCode className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                    <input
                                        className={`${inputClass} pl-11 h-11`}
                                        value={formData.barcode}
                                        disabled={isSubmitting}
                                        placeholder="750103210123"
                                        onChange={(e) =>
                                            updateField(
                                                "barcode",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Categoría
                                </label>

                                <div className="relative">
                                    <Layers className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                    <input
                                        className={`${inputClass} pl-11 h-11`}
                                        value={formData.category}
                                        disabled={isSubmitting}
                                        placeholder="Electrónica"
                                        onChange={(e) =>
                                            updateField(
                                                "category",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Unidad de medida
                                </label>

                                <div className="relative">
                                    <Scale className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                    <input
                                        className={`${inputClass} pl-11 h-11`}
                                        value={formData.unit}
                                        disabled={isSubmitting}
                                        placeholder="pz, kg, caja..."
                                        onChange={(e) =>
                                            updateField(
                                                "unit",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="border-b border-slate-100 bg-slate-50/40">
                    <div className="px-5 py-5 sm:px-8">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <DollarSign className="h-5 w-5" />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-900">
                                    Precios e inventario
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Configura precios, costos y existencias.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Precio de venta
                                    <span className="ml-1 text-red-500">*</span>
                                </label>

                                <div className="relative">
                                    <DollarSign className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-500" />

                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        disabled={isSubmitting}
                                        className={`${inputClass} h-12 pl-11 text-lg font-bold`}
                                        placeholder="0.00"
                                        value={formData.price}
                                        onChange={(e) =>
                                            updateField(
                                                "price",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <p className="mt-1.5 text-xs text-slate-400">
                                    Precio final al cliente.
                                </p>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Costo base
                                </label>

                                <div className="relative">
                                    <TrendingUp className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className={`${inputClass} h-12 pl-11`}
                                        value={formData.cost}
                                        disabled={isSubmitting}
                                        placeholder="0.00"
                                        onChange={(e) =>
                                            updateField(
                                                "cost",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <div className="lg:col-span-2">
                                <div
                                    className={`overflow-hidden rounded-2xl border transition ${
                                        formData.hasPromotion
                                            ? "border-indigo-200 bg-indigo-50/50"
                                            : "border-slate-200 bg-white"
                                    }`}
                                >
                                    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-start gap-4">
                                            <div
                                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                                                    formData.hasPromotion
                                                        ? "bg-indigo-100 text-indigo-600"
                                                        : "bg-slate-100 text-slate-400"
                                                }`}
                                            >
                                                <DollarSign className="h-5 w-5" />
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-slate-800">
                                                        Promoción
                                                    </p>

                                                    {promotionStatus === "active" && (
                                                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                                                            Activa
                                                        </span>
                                                    )}

                                                    {promotionStatus === "expired" && (
                                                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-red-700">
                                                            Vencida
                                                        </span>
                                                    )}
                                                </div>

                                                {formData.hasPromotion ? (
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        C${formData.promotionPrice || "--"}
                                                        <span className="mx-2 text-slate-300">
                                                            •
                                                        </span>
                                                        {formData.promotionStart || "--"}
                                                        <span className="mx-1">
                                                            →
                                                        </span>
                                                        {formData.promotionEnd || "--"}
                                                    </p>
                                                ) : (
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        No hay una promoción configurada.
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={isSubmitting}
                                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600 hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
                                            onClick={handleOpenPromotion}
                                        >
                                            {formData.hasPromotion
                                                ? "Editar promoción"
                                                : "Configurar"}
                                        </button>
                                    </div>

                                    {showPromotionPopover && (
                                        <div className="border-t border-indigo-100">
                                            <PromotionPopover
                                                formData={formData}
                                                updateField={updateField}
                                                onClose={() =>
                                                    setShowPromotionPopover(false)
                                                }
                                                inputClass={inputClass}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            {formData.type_item === "Producto" && (
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Stock disponible
                                    </label>

                                    <div className="relative">
                                        <Package className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                        <input
                                            type="number"
                                            min={0}
                                            className={`${inputClass} h-11 pl-11`}
                                            value={formData.stock}
                                            disabled={isSubmitting}
                                            onChange={(e) =>
                                                updateField(
                                                    "stock",
                                                    Number(e.target.value) || 0
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
                <section>
                    <div className="px-5 py-5 sm:px-8">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                <Calendar className="h-5 w-5" />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-900">
                                    Configuración
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Fechas y estado del producto.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Fecha de ingreso
                                </label>

                                <div className="relative">
                                    <Calendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                    <input
                                        type="date"
                                        disabled={isSubmitting}
                                        className={`${inputClass} h-11 pl-11`}
                                        value={formData.entryDate}
                                        onChange={(e) =>
                                            updateField(
                                                "entryDate",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            {formData.type_item === "Producto" && (
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Fecha de vencimiento
                                    </label>

                                    <div className="relative">
                                        <CalendarClock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                        <input
                                            type="date"
                                            disabled={isSubmitting}
                                            className={`${inputClass} h-11 pl-11`}
                                            value={formData.expirationDate}
                                            onChange={(e) =>
                                                updateField(
                                                    "expirationDate",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Estado
                                </label>

                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() =>
                                        updateField(
                                            "active",
                                            !formData.active
                                        )
                                    }
                                    className={`flex h-11 w-full items-center justify-between rounded-xl border px-4 transition ${
                                        formData.active
                                            ? "border-emerald-200 bg-emerald-50"
                                            : "border-slate-200 bg-slate-50"
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <span
                                            className={`h-2.5 w-2.5 rounded-full ${
                                                formData.active
                                                    ? "bg-emerald-500"
                                                    : "bg-slate-400"
                                            }`}
                                        />

                                        <span
                                            className={`text-sm font-semibold ${
                                                formData.active
                                                    ? "text-emerald-700"
                                                    : "text-slate-500"
                                            }`}
                                        >
                                            {formData.active
                                                ? "Producto activo"
                                                : "Producto inactivo"}
                                        </span>
                                    </div>

                                    <div
                                        className={`relative h-6 w-11 rounded-full transition ${
                                            formData.active
                                                ? "bg-emerald-500"
                                                : "bg-slate-300"
                                        }`}
                                    >
                                        <span
                                            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                                                formData.active
                                                    ? "left-6"
                                                    : "left-1"
                                            }`}
                                        />
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                    <div className="text-xs text-slate-400">
                        <span className="text-red-400">*</span>{" "}
                        Campos obligatorios
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        {onCancel && (
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={onCancel}
                                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Cancelar
                            </button>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex min-w-[180px] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 hover:shadow-indigo-600/30 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    {isEditMode
                                        ? "Actualizar producto"
                                        : "Guardar producto"}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}