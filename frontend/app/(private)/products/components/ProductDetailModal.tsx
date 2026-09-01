"use client";

import React from "react";
import { Product, ProductUnit } from "@/types/product";
import { X, Package, DollarSign, Layers, Tag, BadgePercent,  Barcode as BarCodeIcon, Calendar,
    Clock, CheckCircle2, AlertTriangle, TrendingUp, Boxes, Scale
} from "lucide-react";
import Barcode from "react-barcode";
import { useAuth } from "@/app/(public)/auth/login/hooks/useAuth";

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen, onClose, product,
}) => {
    if (!isOpen || !product) return null;

    const units = product.units ?? [];
    const formatDate = (dateString?: string) => {
        if (!dateString) return "No registrado";

        try {
            return dateString.split("T")[0];
        } catch {
            return dateString;
        }
    };
    const { user } = useAuth();
    const showBranchName = user?.Rol === "superAdmin" || user?.Rol === "admin";
    const isService = product.type_item === "Servicio";
    const activeUnits = units.filter((unit) => unit.active);
    const totalStock = activeUnits.reduce(
        (total, unit) => total + Number(unit.stock || 0),
        0
    );

    const isActive = product.active !== false;
    const getPromotionStatus = (unit: ProductUnit) => {
        const now = new Date();

        const promotionStart = unit.promotionStart
            ? new Date(unit.promotionStart)
            : null;

        const promotionEnd = unit.promotionEnd
            ? new Date(unit.promotionEnd)
            : null;

        const promotionEndExclusive = promotionEnd
            ? new Date(promotionEnd.getTime() + 24 * 60 * 60 * 1000)
            : null;

        const isActivePromotion =
            unit.hasPromotion === true &&
            unit.promotionPrice != null &&
            (!promotionStart || promotionStart <= now) &&
            (!promotionEndExclusive || now < promotionEndExclusive);

        const isExpired =
            unit.hasPromotion === true &&
            promotionEndExclusive !== null &&
            now >= promotionEndExclusive;

        return { isActivePromotion, isExpired };
    };

    const getProfitMargin = (unit: ProductUnit) => {
        const price = Number(unit.price);
        const cost = Number(unit.cost);

        if (
        unit.cost == null ||
        unit.price == null ||
        price <= 0 ||
        Number.isNaN(price) ||
        Number.isNaN(cost)
        ) {
        return null;
        }

        return ((price - cost) / price) * 100;
    };

    const getStockStatus = (unit: ProductUnit) => {
        const stock = Number(unit.stock || 0);

        if (stock <= 0) {
        return {
            label: "Agotado",
            color: "rose",
        };
        }

        if (stock <= 5) {
        return {
            label: "Stock bajo",
            color: "amber",
        };
        }

        return {
        label: "Disponible",
        color: "emerald",
        };
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto">
        <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-md transition-opacity duration-300"
            onClick={onClose}
        />

        <div className="relative w-full max-w-4xl transform overflow-hidden rounded-[2.5rem] bg-white text-left shadow-2xl border border-slate-100 max-h-[94vh] flex flex-col">

            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-slate-50 via-white to-indigo-50/20 flex-shrink-0">
            <div className="flex items-center gap-4 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
                <Package className="h-6 w-6" />
                </div>

                <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    Ficha del producto
                    </span>

                    <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                    >
                    {isActive ? "Activo" : "Inactivo"}
                    </span>

                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                    {product.type_item}
                    </span>
                </div>

                <h3 className="text-xl font-black text-slate-900 tracking-tight truncate">
                    {product.name}
                </h3>

                <p className="text-sm text-slate-500 mt-0.5">
                    {product.category || "General / Otros"}
                </p>
                </div>
            </div>

            <button
                type="button"
                onClick={onClose}
                className="shrink-0 text-slate-400 hover:text-slate-600 rounded-xl p-2 hover:bg-slate-100 transition-all active:scale-90"
                aria-label="Cerrar detalles"
            >
                <X className="h-5 w-5" />
            </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-white">

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
                    <Tag className="w-3.5 h-3.5" />
                    Categoría
                </div>

                <p className="text-sm font-bold text-slate-800">
                    {product.category || "General / Otros"}
                </p>
                </div>

                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-500 mb-1">
                    <Boxes className="w-3.5 h-3.5" />
                    Presentaciones
                </div>

                <p className="text-2xl font-black text-indigo-900">
                    {activeUnits.length}
                </p>

                <p className="text-[11px] text-indigo-600/70">
                    {activeUnits.length === 1
                    ? "unidad configurada"
                    : "unidades configuradas"}
                </p>
                </div>

                <div
                className={`rounded-2xl border p-4 ${
                    isService
                    ? "border-indigo-100 bg-indigo-50/40"
                    : totalStock > 0
                    ? "border-emerald-100 bg-emerald-50/40"
                    : "border-rose-100 bg-rose-50/40"
                }`}
                >
                <div
                    className={`flex items-center gap-2 text-xs font-semibold mb-1 ${
                    isService
                        ? "text-indigo-500"
                        : totalStock > 0
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                >
                    <Layers className="w-3.5 h-3.5" />

                    {isService ? "Inventario" : "Stock total"}
                </div>

                {isService ? (
                    <p className="text-sm font-bold text-indigo-700">
                    No aplica
                    </p>
                ) : (
                    <>
                    <p className="text-2xl font-black text-slate-900">
                        {totalStock}
                    </p>

                    <p className="text-[11px] text-slate-500">
                        suma de existencias
                    </p>
                    </>
                )}
                </div>
            </div>

            <div className="space-y-2.5">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Información general
                </h4>

                <div className="bg-slate-50/60 rounded-2xl border border-slate-100 p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <span className="text-[11px] font-medium text-slate-400">
                    ID del producto
                    </span>

                    <p className="text-sm font-bold text-slate-800 font-mono">
                    #{product.id}
                    </p>
                </div>

                <div>
                    <span className="text-[11px] font-medium text-slate-400">
                    Tipo
                    </span>

                    <p className="text-sm font-bold text-slate-800">
                    {product.type_item}
                    </p>
                </div>

                <div>
                    <span className="text-[11px] font-medium text-slate-400">
                    Estado
                    </span>

                    <p
                    className={`text-sm font-bold ${
                        isActive ? "text-emerald-700" : "text-rose-700"
                    }`}
                    >
                    {isActive ? "Activo" : "Inactivo"}
                    </p>
                </div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Unidades y presentaciones
                    </h4>

                    <p className="text-xs text-slate-400 mt-1">
                    Cada presentación tiene su propio precio, stock y
                    configuración.
                    </p>
                </div>

                <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold text-indigo-600">
                    {activeUnits.length}{" "}
                    {activeUnits.length === 1 ? "presentación" : "presentaciones"}
                </span>
                </div>

                {activeUnits.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
                    <Boxes className="mx-auto h-8 w-8 text-slate-300 mb-2" />

                    <p className="text-sm font-semibold text-slate-500">
                    No hay unidades activas configuradas.
                    </p>
                </div>
                ) : (
                <div className="space-y-4">
                    {activeUnits.map((unit, index) => {
                    const { isActivePromotion, isExpired } =
                        getPromotionStatus(unit);

                    const profitMargin = getProfitMargin(unit);
                    const stockStatus = getStockStatus(unit);

                    return (
                        <div
                        key={unit.id}
                        className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                        >
                        <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                                <Scale className="h-5 w-5" />
                            </div>

                            <div>
                                <div className="flex items-center gap-2">
                                    <h5 className="text-base font-black text-slate-900">
                                        {unit.unit}
                                    </h5>

                                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                                        #{index + 1}
                                    </span>
                                </div>

                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                    <p className="text-[11px] text-slate-400">
                                        Unidad ID: #{unit.id}
                                    </p>

                                    {showBranchName && unit.branch && (
                                        <>
                                            <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                                                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-50 text-indigo-500">
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
                                                </span>

                                                <span className="text-slate-400">
                                                    Sucursal
                                                </span>

                                                <span className="font-semibold text-slate-600">
                                                    {unit.branch.name}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            </div>

                            {!isService && (
                            <span
                                className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold ${
                                stockStatus.color === "rose"
                                    ? "bg-rose-100 text-rose-700"
                                    : stockStatus.color === "amber"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-emerald-100 text-emerald-700"
                                }`}
                            >
                                <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                    stockStatus.color === "rose"
                                    ? "bg-rose-500"
                                    : stockStatus.color === "amber"
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                }`}
                                />

                                {stockStatus.label}
                            </span>
                            )}
                        </div>

                        <div className="p-5 space-y-5">

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div
                                    className={`rounded-2xl border p-4 ${
                                        isActivePromotion
                                            ? "border-emerald-100 bg-emerald-50/40"
                                            : "border-indigo-100 bg-indigo-50/30"
                                    }`}
                                >
                                    <span
                                        className={`text-xs font-semibold block mb-1 flex items-center gap-1 ${
                                            isActivePromotion
                                                ? "text-emerald-600"
                                                : "text-indigo-600"
                                        }`}
                                    >
                                        <DollarSign className="w-3.5 h-3.5" />

                                        {isActivePromotion
                                            ? "Precio en promoción"
                                            : "Precio al público"}
                                    </span>

                                    {isActivePromotion ? (
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-black text-emerald-700">
                                                C$
                                                {Number(unit.promotionPrice).toFixed(2)}
                                            </span>

                                            <span className="text-sm font-semibold text-slate-400 line-through">
                                                C${Number(unit.price).toFixed(2)}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-2xl font-black text-indigo-950">
                                            C${Number(unit.price).toFixed(2)}
                                        </span>
                                    )}
                                </div>

                                <div
                                    className={`rounded-2xl border p-4 ${
                                        isService
                                            ? "border-indigo-100 bg-indigo-50/30"
                                            : Number(unit.stock) > 0 || Number(unit.promotionQuantity) > 0
                                            ? "border-emerald-100 bg-emerald-50/30"
                                            : "border-rose-100 bg-rose-50/30"
                                    }`}
                                >
                                    <span className="text-xs font-semibold text-slate-500 block mb-1 flex items-center gap-1">
                                        <Layers className="w-3.5 h-3.5" />
                                        Existencias
                                    </span>

                                    {isService ? (
                                        <span className="text-sm font-bold text-indigo-700">
                                            No maneja inventario
                                        </span>
                                    ) : (
                                        <div>
                                            {/* Stock general */}
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-black text-slate-900">
                                                    {Number(unit.stock || 0)}
                                                </span>
                                            </div>

                                            {/* Stock en promoción */}
                                            {isActivePromotion &&
                                                Number(unit.promotionQuantity || 0) > 0 && (
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                            {Number(unit.promotionQuantity)}
                                                            {" "}
                                                            {unit.unit}
                                                            {" "}
                                                            en promoción
                                                        </span>
                                                    </div>
                                                )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mb-2">
                                <BarCodeIcon className="w-3.5 h-3.5" />
                                Código de barras
                                </span>

                                {unit.barcode ? (
                                <div className="flex justify-center overflow-hidden rounded-xl bg-white p-3 border border-slate-100">
                                    <Barcode
                                    value={unit.barcode}
                                    format="CODE128"
                                    width={1.5}
                                    height={45}
                                    displayValue={true}
                                    fontSize={11}
                                    />
                                </div>
                                ) : (
                                <div className="rounded-xl bg-white border border-dashed border-slate-200 p-4 text-center">
                                    <span className="text-xs text-slate-400">
                                    No asignado
                                    </span>
                                </div>
                                )}
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                <span className="text-[11px] font-medium text-slate-400 block mb-3">
                                Costo y rentabilidad
                                </span>

                                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                <span className="text-xs text-slate-500">
                                    Costo
                                </span>

                                <span className="text-sm font-bold text-slate-700">
                                    {unit.cost != null
                                    ? `C$${Number(unit.cost).toFixed(2)}`
                                    : "—"}
                                </span>
                                </div>

                                {profitMargin !== null ? (
                                <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-500 text-white p-2.5">
                                    <span className="text-[11px] font-bold flex items-center gap-1">
                                    <TrendingUp className="w-3.5 h-3.5" />
                                    Margen
                                    </span>

                                    <span className="text-xs font-black bg-white/20 px-2 py-0.5 rounded-md">
                                    +{profitMargin.toFixed(1)}%
                                    </span>
                                </div>
                                ) : (
                                <div className="mt-3 text-[11px] text-amber-800 bg-amber-50 border border-amber-100 p-2 rounded-lg">
                                    No hay costo suficiente para calcular el
                                    margen.
                                </div>
                                )}
                            </div>
                            </div>

                            <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                                <h6 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                Promoción
                                </h6>

                                {isActivePromotion && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    Activa
                                </span>
                                )}

                                {isExpired && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-rose-700">
                                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                    Vencida
                                </span>
                                )}

                                {!unit.hasPromotion && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                                    Sin promoción
                                </span>
                                )}
                            </div>

                            <div
                                className={`rounded-2xl border p-4 ${
                                isActivePromotion
                                    ? "border-emerald-100 bg-emerald-50/30"
                                    : isExpired
                                    ? "border-rose-100 bg-rose-50/30"
                                    : "border-slate-100 bg-slate-50/60"
                                }`}
                            >
                                {!unit.hasPromotion ? (
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                                    <BadgePercent className="h-5 w-5 text-slate-400" />
                                    </div>

                                    <div>
                                    <p className="text-sm font-semibold text-slate-700">
                                        Sin promoción configurada
                                    </p>

                                    <p className="text-xs text-slate-400">
                                        Esta presentación utiliza su precio normal.
                                    </p>
                                    </div>
                                </div>
                                ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[11px] font-medium text-slate-400 block mb-1">
                                        Precio normal
                                        </span>

                                        <span className="text-sm font-bold text-slate-600">
                                        C${Number(unit.price).toFixed(2)}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-[11px] font-medium text-slate-400 block mb-1">
                                        Precio promocional
                                        </span>

                                        <span
                                        className={`text-xl font-black ${
                                            isActivePromotion
                                            ? "text-emerald-600"
                                            : "text-slate-500"
                                        }`}
                                        >
                                        {unit.promotionPrice != null
                                            ? `C$${Number(
                                                unit.promotionPrice
                                            ).toFixed(2)}`
                                            : "—"}
                                        </span>
                                    </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-xl border border-slate-100 bg-white p-3">
                                        <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Inicio
                                        </span>

                                        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                        <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                                        {formatDate(unit.promotionStart)}
                                        </span>
                                    </div>

                                    <div className="rounded-xl border border-slate-100 bg-white p-3">
                                        <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Finalización
                                        </span>

                                        <span
                                        className={`flex items-center gap-1.5 text-xs font-semibold ${
                                            isExpired
                                            ? "text-rose-700"
                                            : "text-slate-700"
                                        }`}
                                        >
                                        <Calendar
                                            className={`h-3.5 w-3.5 ${
                                            isExpired
                                                ? "text-rose-500"
                                                : "text-indigo-500"
                                            }`}
                                        />

                                        {formatDate(unit.promotionEnd)}
                                        </span>
                                    </div>
                                    </div>

                                    {isActivePromotion && (
                                    <div className="flex items-center gap-2 rounded-xl bg-emerald-100/60 px-3 py-2.5 text-xs font-medium text-emerald-700">
                                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                                        Esta promoción está vigente actualmente.
                                    </div>
                                    )}

                                    {isExpired && (
                                    <div className="flex items-center gap-2 rounded-xl bg-rose-100/60 px-3 py-2.5 text-xs font-medium text-rose-700">
                                        <AlertTriangle className="h-4 w-4 shrink-0" />
                                        Esta promoción ya finalizó.
                                    </div>
                                    )}
                                </div>
                                )}
                            </div>
                            </div>

                            <div className="space-y-2.5">
                            <h6 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                Fechas de control
                            </h6>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="bg-slate-50/40 border border-slate-100 p-3 rounded-xl">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                    Ingreso
                                </span>

                                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                                    {formatDate(unit.entryDate)}
                                </span>
                                </div>

                                {isService ? (
                                <div className="bg-indigo-50/30 border border-indigo-100 p-3 rounded-xl">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                                    Control
                                    </span>

                                    <span className="text-xs font-bold flex items-center gap-1.5 text-indigo-700">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Servicio sin vencimiento
                                    </span>
                                </div>
                                ) : (
                                <div
                                    className={`p-3 rounded-xl border ${
                                    unit.expirationDate
                                        ? "bg-amber-50/20 border-amber-100"
                                        : "bg-slate-50/40 border-slate-100"
                                    }`}
                                >
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                    Vencimiento
                                    </span>

                                    <span
                                    className={`text-xs font-bold flex items-center gap-1.5 ${
                                        unit.expirationDate
                                        ? "text-amber-700"
                                        : "text-slate-600"
                                    }`}
                                    >
                                    <Calendar
                                        className={`w-3.5 h-3.5 ${
                                        unit.expirationDate
                                            ? "text-amber-500"
                                            : "text-slate-400"
                                        }`}
                                    />

                                    {formatDate(unit.expirationDate)}
                                    </span>
                                </div>
                                )}
                            </div>
                            </div>
                        </div>
                        </div>
                    );
                    })}
                </div>
                )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 w-fit">
                <span className="text-slate-400 font-medium">
                    ID único:
                </span>

                <span className="font-mono font-bold text-slate-700">
                    #{product.id}
                </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {product.createdAt && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />

                    <span>
                        Alta:{" "}
                        <strong className="font-semibold text-slate-800">
                        {formatDate(product.createdAt)}
                        </strong>
                    </span>
                    </div>
                )}

                {product.updatedAt && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />

                    <span>
                        Cambios:{" "}
                        <strong className="font-semibold text-slate-800">
                        {formatDate(product.updatedAt)}
                        </strong>
                    </span>
                    </div>
                )}
                </div>
            </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50/60 flex justify-end flex-shrink-0">
            <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto inline-flex justify-center items-center rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 text-xs font-bold shadow-md shadow-slate-900/10 transition-all active:scale-95 hover:shadow-lg"
            >
                Cerrar Ficha
            </button>
            </div>
        </div>
        </div>
    );
};