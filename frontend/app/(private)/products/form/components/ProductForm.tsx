"use client";

import { useState } from "react";
import { Tag, QrCode, Layers, DollarSign, TrendingUp, Package, Scale, Calendar, CalendarClock,
    Loader2, Plus, Trash2, RotateCcw, ChevronDown
} from "lucide-react";
import type { ProductForm as ProductFormType, ProductUnitForm } from "../hooks/useProductForm";
import PromotionPopover from "./PromotionPopover";
import { useAuth } from "@/app/(public)/auth/login/hooks/useAuth";

type Props = {
    formData: ProductFormType;

    updateField: <K extends keyof ProductFormType>(
        field: K,
        value: ProductFormType[K]
    ) => void;

    updateUnitField: <K extends keyof ProductUnitForm>(
        index: number,
        field: K,
        value: ProductUnitForm[K]
    ) => void;

    addUnit: () => void;
    removeUnit: (index: number) => void;
    restoreUnit: (index: number) => void;

    onSubmit: (
        e: React.FormEvent<HTMLFormElement>
    ) => void;

    onCancel?: () => void;

    isSubmitting: boolean;
    isEditMode: boolean;
};

export default function ProductForm({
    formData, updateField, updateUnitField, addUnit, removeUnit, restoreUnit, onSubmit, onCancel, isSubmitting, isEditMode,
}: Props) {
    const { user } = useAuth();
    const showBranchName = isEditMode && (user?.Rol === "superAdmin" || user?.Rol === "admin");
    const [showPromotionPopover, setShowPromotionPopover] = useState<number | null>(null);
    const [expandedUnits, setExpandedUnits] = useState<number[]>([]);
    const isProduct = () => formData.type_item === "Producto";
    const inputClass =
        "w-full pl-9 pr-3 py-2 text-sm bg-slate-50/60 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 placeholder:text-slate-400/80 disabled:opacity-60 disabled:cursor-not-allowed";

    const getPromotionStatus = (
        unit: ProductUnitForm
    ) => {
        if (!unit.hasPromotion) {
            return "none";
        }

        if (unit.promotionEnd) {
            const promotionEnd = new Date(
                `${unit.promotionEnd}T23:59:59`
            );

            if (new Date() > promotionEnd) {
                return "expired";
            }
        }

        return "active";
    };

    const activeUnits = formData.units.filter(
        (unit) => unit.active
    );

    const inactiveUnits = formData.units.filter(
        (unit) => !unit.active
    );

    const toggleUnit = (index: number) => {
        setExpandedUnits((current) =>
            current.includes(index)
                ? current.filter((item) => item !== index)
                : [...current, index]
        );
    };

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

                        {formData.active
                            ? "Activo"
                            : "Inactivo"}
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
                                    <span className="ml-1 text-red-500">
                                        *
                                    </span>
                                </label>

                                <div className="relative">
                                    <Tag className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                    <input
                                        required
                                        disabled={isSubmitting}
                                        className={`${inputClass} h-12 pl-11 text-base`}
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
                                        onClick={() =>
                                            updateField(
                                                "type_item",
                                                "Producto"
                                            )
                                        }
                                        className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                                            formData.type_item ===
                                            "Producto"
                                                ? "bg-white text-indigo-600 shadow-sm"
                                                : "text-slate-500 hover:text-slate-700"
                                        }`}
                                    >
                                        Producto
                                    </button>

                                    <button
                                        type="button"
                                        disabled={isSubmitting || isEditMode}
                                        onClick={() =>
                                            updateField(
                                                "type_item",
                                                "Servicio"
                                            )
                                        }
                                        className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                                            formData.type_item === "Servicio"
                                                ? "bg-white text-indigo-600 shadow-sm"
                                                : "text-slate-500 hover:text-slate-700"
                                        } ${
                                            isEditMode
                                                ? "cursor-not-allowed opacity-60"
                                                : ""
                                        }`}
                                    >
                                        Servicio
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Categoría
                                </label>

                                <div className="relative">
                                    <Layers className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                    <input
                                        className={`${inputClass} h-11 pl-11`}
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
                        </div>
                    </div>
                </section>

                <section className="border-b border-slate-100 bg-slate-50/40">
                    <div className="px-5 py-5 sm:px-8">
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                    <Scale className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className="font-bold text-slate-900">
                                        {isProduct() ? "Unidades" : "Opciones"}
                                    </h2>

                                    <p className="text-xs text-slate-500">
                                        {isProduct()
                                            ? "Configura las presentaciones, precios e inventario."
                                            : "Configura las opciones y precios del servicio."}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={addUnit}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Plus className="h-4 w-4" />
                                {isProduct() ? "Agregar unidad" : "Agregar opción"}
                            </button>
                        </div>

                        <div className="space-y-6">
                            {activeUnits.map(
                                (unit) => {
                                    const originalIndex =
                                        formData.units.findIndex(
                                            (item) =>
                                                item === unit
                                        );

                                    const promotionStatus =
                                        getPromotionStatus(
                                            unit
                                        );

                                    return (
                                        <div
                                            key={
                                                unit.id ??
                                                `new-${originalIndex}`
                                            }
                                            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                                        >
                                            <div className="border-b border-slate-100 bg-white">
                                                <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                                    <button
                                                        type="button"
                                                        disabled={isSubmitting}
                                                        onClick={() => toggleUnit(originalIndex)}
                                                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                                                    >
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                                            <Scale className="h-4 w-4" />
                                                        </div>

                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-bold text-slate-800">
                                                                    {isProduct()
                                                                        ? `Unidad ${originalIndex + 1}`
                                                                        : `Opción ${originalIndex + 1}`}
                                                                </p>

                                                                {showBranchName && unit.branch && (
                                                                    <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-100">
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            viewBox="0 0 24 24"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            strokeWidth="1.8"
                                                                            className="h-3 w-3"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                d="M3 21h18M5 21V6a1 1 0 0 1 1-1h5v16M13 21V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v18M8 9h1M8 12h1M8 15h1M15 6h2M15 9h2M15 12h2M15 15h2"
                                                                            />
                                                                        </svg>

                                                                        {unit.branch.name}
                                                                    </span>
                                                                )}

                                                                <ChevronDown
                                                                    className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                                                                        expandedUnits.includes(originalIndex)
                                                                            ? "rotate-180"
                                                                            : ""
                                                                    }`}
                                                                />
                                                            </div>

                                                            <p className="truncate text-xs text-slate-400">
                                                                {unit.unit || "Sin unidad configurada"}
                                                                {unit.price && (
                                                                    <>
                                                                        <span className="mx-2">•</span>
                                                                        C${unit.price}
                                                                    </>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </button>

                                                    {activeUnits.length > 1 && (
                                                        <button
                                                            type="button"
                                                            disabled={isSubmitting}
                                                            onClick={() => removeUnit(originalIndex)}
                                                            className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            Eliminar
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            {expandedUnits.includes(originalIndex) && (
                                                <div className="space-y-6 p-5">
                                                    <div>
                                                        <div className="mb-4 flex items-center gap-2">
                                                            <QrCode className="h-4 w-4 text-indigo-500" />

                                                            <h3 className="text-sm font-bold text-slate-800">
                                                                Identificación
                                                            </h3>
                                                        </div>

                                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                                            <div>
                                                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                                    {isProduct() ? "Unidad de medida" : "Descripción"}
                                                                    <span className="ml-1 text-red-500">
                                                                        *
                                                                    </span>
                                                                </label>

                                                                <div className="relative">
                                                                    <Scale className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                                                    <input
                                                                        required
                                                                        disabled={
                                                                            isSubmitting
                                                                        }
                                                                        className={`${inputClass} h-11 pl-11`}
                                                                        value={
                                                                            unit.unit
                                                                        }
                                                                        placeholder={
                                                                            isProduct()
                                                                                ? "pz, kg, caja..."
                                                                                : "Ej. Mantenimiento, instalación, consulta..."
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            updateUnitField(
                                                                                originalIndex,
                                                                                "unit",
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                                    Código de barras
                                                                </label>

                                                                <div className="relative">
                                                                    <QrCode className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                                                    <input
                                                                        disabled={
                                                                            isSubmitting
                                                                        }
                                                                        className={`${inputClass} h-11 pl-11`}
                                                                        value={
                                                                            unit.barcode
                                                                        }
                                                                        placeholder="750103210123"
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            updateUnitField(
                                                                                originalIndex,
                                                                                "barcode",
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="mb-4 flex items-center gap-2">
                                                            <DollarSign className="h-4 w-4 text-emerald-500" />

                                                            <h3 className="text-sm font-bold text-slate-800">
                                                                Precios e inventario
                                                            </h3>
                                                        </div>

                                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                                            <div>
                                                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                                    Precio de venta
                                                                    <span className="ml-1 text-red-500">
                                                                        *
                                                                    </span>
                                                                </label>

                                                                <div className="relative">
                                                                    <DollarSign className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-500" />

                                                                    <input
                                                                        required
                                                                        type="number"
                                                                        step="0.01"
                                                                        min="0"
                                                                        disabled={
                                                                            isSubmitting
                                                                        }
                                                                        className={`${inputClass} h-12 pl-11 text-lg font-bold`}
                                                                        value={
                                                                            unit.price
                                                                        }
                                                                        placeholder="0.00"
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            updateUnitField(
                                                                                originalIndex,
                                                                                "price",
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
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
                                                                        disabled={
                                                                            isSubmitting
                                                                        }
                                                                        className={`${inputClass} h-12 pl-11`}
                                                                        value={
                                                                            unit.cost
                                                                        }
                                                                        placeholder="0.00"
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            updateUnitField(
                                                                                originalIndex,
                                                                                "cost",
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>

                                                            {formData.type_item ===
                                                                "Producto" && (
                                                                <div>
                                                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                                        Stock disponible
                                                                    </label>

                                                                    <div className="relative">
                                                                        <Package className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                                                        <input
                                                                            type="number"
                                                                            min={0}
                                                                            disabled={
                                                                                isSubmitting
                                                                            }
                                                                            className={`${inputClass} h-11 pl-11`}
                                                                            value={
                                                                                unit.stock
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                updateUnitField(
                                                                                    originalIndex,
                                                                                    "stock",
                                                                                    Number(
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                    ) ||
                                                                                        0
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div
                                                            className={`overflow-hidden rounded-2xl border transition ${
                                                                unit.hasPromotion
                                                                    ? "border-indigo-200 bg-indigo-50/50"
                                                                    : "border-slate-200 bg-white"
                                                            }`}
                                                        >
                                                            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                                                                <div className="flex items-start gap-4">
                                                                    <div
                                                                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                                                                            unit.hasPromotion
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

                                                                            {promotionStatus ===
                                                                                "active" && (
                                                                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                                                                                    Activa
                                                                                </span>
                                                                            )}

                                                                            {promotionStatus ===
                                                                                "expired" && (
                                                                                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-red-700">
                                                                                    Vencida
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        {unit.hasPromotion ? (
                                                                            <p className="mt-1 text-sm text-slate-500">
                                                                                C$
                                                                                {unit.promotionPrice ||
                                                                                    "--"}

                                                                                <span className="mx-2 text-slate-300">
                                                                                    •
                                                                                </span>

                                                                                {unit.promotionStart ||
                                                                                    "--"}

                                                                                <span className="mx-1">
                                                                                    →
                                                                                </span>

                                                                                {unit.promotionEnd ||
                                                                                    "--"}
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
                                                                    disabled={
                                                                        isSubmitting
                                                                    }
                                                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600 hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
                                                                    onClick={() =>
                                                                        setShowPromotionPopover(
                                                                            showPromotionPopover ===
                                                                                originalIndex
                                                                                ? null
                                                                                : originalIndex
                                                                        )
                                                                    }
                                                                >
                                                                    {unit.hasPromotion
                                                                        ? "Editar promoción"
                                                                        : "Configurar"}
                                                                </button>
                                                            </div>

                                                            {showPromotionPopover ===
                                                                originalIndex && (
                                                                <div className="border-t border-indigo-100">
                                                                    <PromotionPopover
                                                                        unit={unit}
                                                                        index={originalIndex}
                                                                        typeItem={formData.type_item}
                                                                        updateUnitField={updateUnitField}
                                                                        onClose={() =>
                                                                            setShowPromotionPopover(null)
                                                                        }
                                                                        inputClass={inputClass}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="mb-4 flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-amber-500" />

                                                            <h3 className="text-sm font-bold text-slate-800">
                                                                Fechas
                                                            </h3>
                                                        </div>

                                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                                            <div>
                                                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                                    Fecha de ingreso
                                                                </label>

                                                                <div className="relative">
                                                                    <Calendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                                                    <input
                                                                        type="date"
                                                                        disabled={
                                                                            isSubmitting
                                                                        }
                                                                        className={`${inputClass} h-11 pl-11`}
                                                                        value={
                                                                            unit.entryDate
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            updateUnitField(
                                                                                originalIndex,
                                                                                "entryDate",
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>

                                                            {formData.type_item ===
                                                                "Producto" && (
                                                                <div>
                                                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                                        Fecha de vencimiento
                                                                    </label>

                                                                    <div className="relative">
                                                                        <CalendarClock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                                                        <input
                                                                            type="date"
                                                                            disabled={
                                                                                isSubmitting
                                                                            }
                                                                            className={`${inputClass} h-11 pl-11`}
                                                                            value={
                                                                                unit.expirationDate
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                updateUnitField(
                                                                                    originalIndex,
                                                                                    "expirationDate",
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )} 
                                        </div>
                                    );
                                }
                            )}

                            {activeUnits.length === 0 && (
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                                    <Scale className="mx-auto h-8 w-8 text-slate-300" />

                                    <p className="mt-3 text-sm font-semibold text-slate-600">
                                        No hay unidades activas.
                                    </p>

                                    <button
                                        type="button"
                                        disabled={isSubmitting}
                                        onClick={addUnit}
                                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Agregar unidad
                                    </button>
                                </div>
                            )}
                        </div>

                        {isEditMode &&
                            inactiveUnits.length > 0 && (
                                <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Unidades desactivadas
                                    </p>

                                    <div className="space-y-2">
                                        {inactiveUnits.map(
                                            (unit) => {
                                                const index =
                                                    formData.units.findIndex(
                                                        (
                                                            item
                                                        ) =>
                                                            item ===
                                                            unit
                                                    );

                                                return (
                                                    <div
                                                        key={
                                                            unit.id ??
                                                            index
                                                        }
                                                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
                                                    >
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-700">
                                                                {unit.unit ||
                                                                    "Sin unidad"}
                                                            </p>

                                                            {unit.barcode && (
                                                                <p className="text-xs text-slate-400">
                                                                    {
                                                                        unit.barcode
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                isSubmitting
                                                            }
                                                            onClick={() =>
                                                                restoreUnit(
                                                                    index
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50 disabled:opacity-50"
                                                        >
                                                            <RotateCcw className="h-4 w-4" />
                                                            Restaurar
                                                        </button>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                </div>
                            )}
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
                                    Estado general del producto.
                                </p>
                            </div>
                        </div>

                        <div className="max-w-md">
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