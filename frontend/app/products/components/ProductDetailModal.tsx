"use client";

import React from "react";
import { Product } from "@/types/product";
import { 
    X, Package, DollarSign, Layers, Tag, 
    Barcode as BarCodeIcon, Calendar, Clock, CheckCircle2, AlertTriangle, TrendingUp 
} from "lucide-react";
import Barcode from "react-barcode";

interface ProductDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
    isOpen,
    onClose,
    product,
}) => {
    if (!isOpen || !product) return null;

    const formatDate = (dateString?: string) => {
        if (!dateString) return "No registrado";
        try {
        return dateString.split("T")[0];
        } catch {
        return dateString;
        }
    };

    const profitMargin = product.cost && product.price 
        ? ((product.price - product.cost) / product.price) * 100 
        : null;

    const isStockAvailable = product.stock > 0;
    const isActive = product.active !== false;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto">
            <div
                className="fixed inset-0 bg-slate-900/70 backdrop-blur-md transition-opacity duration-300"
                onClick={onClose}
            />

            <div className="relative w-full max-w-xl transform overflow-hidden rounded-[2.5rem] bg-white text-left align-middle shadow-2xl transition-all border border-slate-100 max-h-[92vh] flex flex-col">
                
                <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-slate-50 via-white to-indigo-50/10 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
                    <Package className="h-6 w-6" />
                    </div>
                    <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        Ficha Técnica
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        isActive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                        }`}>
                        {isActive ? "Activo" : "Inactivo"}
                        </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight line-clamp-1">
                        {product.name}
                    </h3>
                    </div>
                </div>
                
                <button
                    type="button"
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-600 rounded-xl p-2 hover:bg-slate-100 transition-all active:scale-90"
                    aria-label="Cerrar detalles"
                >
                    <X className="h-5 w-5" />
                </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-white">
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-indigo-50/40 to-indigo-50/10 border border-indigo-100/60 p-4 rounded-3xl shadow-sm">
                    <span className="text-xs font-semibold text-indigo-600/80 block mb-1 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" /> Precio al Público
                    </span>
                    <span className="text-2xl font-black text-indigo-950 tracking-tight">
                        C${Number(product.price).toFixed(2)}
                    </span>
                    </div>

                    <div className={`p-4 rounded-3xl border shadow-sm transition-colors ${
                    isStockAvailable 
                        ? "bg-gradient-to-br from-emerald-50/40 to-emerald-50/10 border-emerald-100/60" 
                        : "bg-gradient-to-br from-rose-50/40 to-rose-50/10 border-rose-100/60"
                    }`}>
                    <span className={`text-xs font-semibold block mb-1 flex items-center gap-1 ${
                        isStockAvailable ? "text-emerald-600" : "text-rose-600"
                    }`}>
                        <Layers className="w-3.5 h-3.5" /> Inventario Real
                    </span>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-2xl font-black tracking-tight ${isStockAvailable ? "text-emerald-950" : "text-rose-950"}`}>
                        {product.stock}
                        </span>
                        <span className="text-xs font-medium text-slate-500 lowercase">
                        {product.unit || "uds"}
                        </span>
                    </div>
                    </div>
                </div>

                <div className="space-y-2.5">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Información de Clasificación
                    </h4>
                    <div className="bg-slate-50/60 rounded-2xl border border-slate-100 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                            <BarCodeIcon className="w-3.5 h-3.5" /> Código de Barras
                        </span>

                        {product.barcode ? (
                            <div className="bg-white p-2 rounded">
                                <Barcode
                                    value={product.barcode}
                                    format="CODE128"
                                    width={1.5}
                                    height={50}
                                    displayValue={true}
                                    fontSize={12}
                                />
                            </div>
                        ) : (
                            <span className="text-slate-400 font-sans font-normal">
                                No asignado
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" /> Categoría Estructurada
                        </span>
                        <span className="text-sm font-bold text-slate-800">
                        {product.category || "General / Otros"}
                        </span>
                    </div>
                    </div>
                </div>

                <div className="space-y-2.5">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Márgenes e Inversión
                    </h4>
                    <div className="bg-slate-50/60 rounded-2xl border border-slate-100 p-4 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-xs font-medium text-slate-500">Costo Base de Compra</span>
                        <span className="text-sm font-semibold text-slate-700">
                        {product.cost ? `C$${Number(product.cost).toFixed(2)}` : "—"}
                        </span>
                    </div>
                    
                    {profitMargin !== null ? (
                        <div className="flex items-center justify-between bg-emerald-500 text-white p-3 rounded-xl shadow-sm shadow-emerald-100">
                        <span className="text-xs font-bold flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4" /> Margen de Ganancia Estimado
                        </span>
                        <span className="text-sm font-black bg-white/20 px-2 py-0.5 rounded-md">
                            +{profitMargin.toFixed(1)}%
                        </span>
                        </div>
                    ) : (
                        <div className="text-xs text-slate-400 italic bg-amber-50/50 border border-amber-100 text-amber-800 p-2.5 rounded-xl flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                        Define un costo de compra para calcular el margen de utilidad.
                        </div>
                    )}
                    </div>
                </div>

                <div className="space-y-2.5">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Fechas de Control Operativo
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50/40 border border-slate-100 p-3 rounded-xl">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Ingreso</span>
                        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" /> {formatDate(product.entryDate)}
                        </span>
                    </div>
                    <div className={`p-3 rounded-xl border ${product.expirationDate ? 'bg-amber-50/20 border-amber-100' : 'bg-slate-50/40 border-slate-100'}`}>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Vencimiento</span>
                        <span className={`text-xs font-bold flex items-center gap-1.5 ${product.expirationDate ? "text-amber-700" : "text-slate-600"}`}>
                        <Calendar className={`w-3.5 h-3.5 ${product.expirationDate ? "text-amber-500" : "text-slate-400"}`} /> 
                        {formatDate(product.expirationDate)}
                        </span>
                    </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 w-fit">
                        <span className="text-slate-400 font-medium">ID único:</span>
                        <span className="font-mono font-bold text-slate-700">#{product.id}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        {product.createdAt && (
                        <div className="flex items-center gap-1.5 text-slate-600">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Alta: <strong className="font-semibold text-slate-800">{formatDate(product.createdAt)}</strong></span>
                        </div>
                        )}
                        {product.updatedAt && (
                        <div className="flex items-center gap-1.5 text-slate-600">
                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Cambios: <strong className="font-semibold text-slate-800">{formatDate(product.updatedAt)}</strong></span>
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