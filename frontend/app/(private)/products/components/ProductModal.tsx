"use client";

import { useState, useEffect } from "react";
import { X, Tag, QrCode, Layers, DollarSign, TrendingUp, Package, Scale, Calendar, CalendarClock,
    Loader2 } from "lucide-react";
import { createProduct, updateProduct } from "@/services/productService";
import ModalError from "@/components/ModalError";
import StockReasonModal from "@/components/StockReasonModal";

type ProductModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmitSuccess?: () => void;
    productToEdit?: any | null;
};
type ProductForm = {
    name: string;
    barcode: string;
    category: string;
    type_item: "Producto" | "Servicio";
    unit: string;
    price: string;
    hasPromotion: boolean;
    promotionPrice: string;
    promotionStart: string;
    promotionEnd: string;
    cost: string;
    stock: number;
    entryDate: string;
    expirationDate: string;
    active: boolean;
};

const initialFormState = (todayDate: string): ProductForm => ({
    name: "",
    barcode: "",
    category: "",
    type_item: "Producto",
    unit: "",
    price: "",
    hasPromotion: false,
    promotionPrice: "",
    promotionStart: todayDate,
    promotionEnd: "",
    cost: "",
    stock: 0,
    entryDate: todayDate,
    expirationDate: "",
    active: true,
});

export default function ProductModal({
    isOpen,
    onClose,
    onSubmitSuccess,
    productToEdit = null,
}: ProductModalProps) {
    const today = new Date().toISOString().split("T")[0];
    const [formData, setFormData] = useState<ProductForm>(initialFormState(today));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = Boolean(productToEdit && productToEdit.id);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showStockReasonModal, setShowStockReasonModal] = useState(false);
    const [pendingPayload, setPendingPayload] = useState<any>(null);
    const [showPromotionPopover, setShowPromotionPopover] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && productToEdit) {
                setFormData({
                    name: productToEdit.name || "",
                    barcode: productToEdit.barcode || "",
                    category: productToEdit.category || "",
                    type_item: productToEdit.type_item || "Producto",
                    unit: productToEdit.unit || "",
                    price: productToEdit.price !== undefined ? String(productToEdit.price) : "",
                    hasPromotion: productToEdit.hasPromotion ?? false,
                    promotionPrice:
                        productToEdit.promotionPrice !== undefined &&
                        productToEdit.promotionPrice !== null
                            ? String(productToEdit.promotionPrice)
                            : "",
                    promotionStart:
                        productToEdit.promotionStart
                            ? productToEdit.promotionStart.split("T")[0]
                            : "",
                    promotionEnd:
                        productToEdit.promotionEnd
                            ? productToEdit.promotionEnd.split("T")[0]
                            : "",
                    cost: productToEdit.cost !== undefined ? String(productToEdit.cost) : "",
                    stock: productToEdit.stock || 0,
                    entryDate: productToEdit.entryDate ? productToEdit.entryDate.split("T")[0] : today,
                    expirationDate: productToEdit.expirationDate ? productToEdit.expirationDate.split("T")[0] : "",
                    active: productToEdit.active !== false,
                });
            } else {
                setFormData(initialFormState(today));
            }
        }
    }, [isOpen, isEditMode, productToEdit, today]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const oldStock = productToEdit?.stock ?? 0;
            const newStock = Number(formData.stock);

            const diff = newStock - oldStock;
            
            const payload = {
                ...formData,
                price: Number(formData.price),
                hasPromotion: formData.hasPromotion,
                promotionPrice:
                    formData.hasPromotion && formData.promotionPrice
                        ? Number(formData.promotionPrice)
                        : undefined,
                promotionStart:
                    formData.hasPromotion
                        ? formData.promotionStart
                        : undefined,
                promotionEnd:
                    formData.hasPromotion
                        ? formData.promotionEnd
                        : undefined,
                cost: formData.cost ? Number(formData.cost) : undefined,
                stock: formData.type_item === "Servicio" ? 0 : newStock,
            };

            if (isEditMode && productToEdit) {
                const isReducingProductStock =
                    productToEdit.type_item === "Producto" &&
                    formData.type_item === "Producto" &&
                    diff < 0;
                if (isReducingProductStock) {
                    setPendingPayload(payload);
                    setShowStockReasonModal(true);
                    setIsSubmitting(false);
                    return;
                }
                const res = await updateProduct(productToEdit.id, payload);

                if (res && typeof res === "object" && "ok" in res) {
                    if (!res.ok) {
                        setErrorMessage(res.message);
                        setShowError(true);
                        return;
                    }
                }
            } else {
                await createProduct(payload);
                window.location.reload();
            }

            onSubmitSuccess?.();
            onClose();

        } catch (error: any) {
            console.error("ERROR REAL:", error);

            setErrorMessage(
                error?.message ||
                "No se pudo procesar la solicitud"
            );

            setShowError(true);

        } finally {
            setIsSubmitting(false);
        }
    };
    const handleStockReasonConfirm = async (reason: string) => {
        if (!pendingPayload || !productToEdit) return;

        const res = await updateProduct(productToEdit.id, {
            ...pendingPayload,
            stockObservation: reason,
        });

        if (!res.ok) {
            setErrorMessage(res.message);
            setShowError(true);
            return;
        }

        setShowStockReasonModal(false);
        setPendingPayload(null);

        onSubmitSuccess?.();
        onClose();
    };

    const inputClass =
        "w-full pl-9 pr-3 py-2 text-sm bg-slate-50/60 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 placeholder:text-slate-400/80 disabled:opacity-60 disabled:cursor-not-allowed";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
            <div className="absolute inset-0" onClick={!isSubmitting ? onClose : undefined} />

            <div className="relative bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 transform transition-all duration-300 scale-100 max-h-[92vh] flex flex-col">
                
                <div className="px-6 py-5 border-b flex items-center justify-between bg-slate-50/70 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">
                            {isEditMode ? "Editar Producto" : "Nuevo Producto"}
                        </h2>
                        <p className="text-xs font-medium text-slate-400 mt-0.5">
                            {isEditMode ? "Modifica los campos técnicos del inventario" : "Registra un nuevo elemento en el almacén global"}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="p-2 rounded-xl hover:bg-slate-200/70 text-slate-400 hover:text-slate-600 transition disabled:opacity-40"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5 overflow-y-auto flex-1 bg-white"
                >
                    <div className="space-y-4">
                        <div className="relative">
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                                Nombre
                            </label>
                            <Tag className="w-4 h-4 absolute left-3 top-8 text-slate-400" />
                            <input
                                className={inputClass}
                                value={formData.name}
                                disabled={isSubmitting}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ej. Computadora Portátil Intel i7"
                                required
                            />
                        </div>

                        <div className="relative">
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                                Tipo
                            </label>

                            <select
                                className={inputClass}
                                value={formData.type_item}
                                disabled={isSubmitting}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        type_item: e.target.value as "Producto" | "Servicio",
                                        stock: e.target.value === "Servicio" ? 0 : formData.stock
                                    })
                                }
                            >
                                <option value="Producto">Producto</option>
                                <option value="Servicio">Servicio</option>
                            </select>
                        </div>

                        <div className="relative">
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                                Código de barras
                            </label>
                            <QrCode className="w-4 h-4 absolute left-3 top-8 text-slate-400" />
                            <input
                                className={inputClass}
                                value={formData.barcode}
                                disabled={isSubmitting}
                                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                placeholder="Ej. 750103210123"
                            />
                        </div>

                        <div className="relative">
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                                Categoría
                            </label>
                            <Layers className="w-4 h-4 absolute left-3 top-8 text-slate-400" />
                            <input
                                className={inputClass}
                                value={formData.category}
                                disabled={isSubmitting}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                placeholder="Ej. Electrónica / Tecnología"
                            />
                        </div>

                        <div className="relative">
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                                Unidad de Medida
                            </label>
                            <Scale className="w-4 h-4 absolute left-3 top-8 text-slate-400" />
                            <input
                                className={inputClass}
                                value={formData.unit}
                                disabled={isSubmitting}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                placeholder="Ej. pza, kg, lts, caja"
                            />
                        </div>

                        <div className="pt-2">
                            <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Estado Operativo</span>
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => setFormData({ ...formData, active: !formData.active })}
                                className={`w-full py-2.5 rounded-xl text-sm font-bold border transition-all active:scale-[0.99] ${
                                    formData.active
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-100"
                                        : "bg-slate-50 text-slate-500 border-slate-200"
                                }`}
                            >
                                {formData.active ? "● Producto Activo / Visible" : "○ Inactivo / Oculto"}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                                Precio de Venta
                            </label>
                            <DollarSign className="w-4 h-4 absolute left-3 top-8 text-slate-400" />
                            <input
                                type="number"
                                step="0.01"
                                className={inputClass}
                                value={formData.price}
                                disabled={isSubmitting}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 relative">
    <div className="flex items-center justify-between">
        <div>
            <p className="text-xs font-bold uppercase text-slate-500">
                Promoción
            </p>

            {formData.hasPromotion ? (
                <>
                    <p className="mt-1 font-semibold text-emerald-600">
                        ● Promoción activa
                    </p>

                    <p className="text-sm text-slate-500">
                        ${formData.promotionPrice || "--"} ·
                        {" "}
                        {formData.promotionStart || "--"}
                        {" "}
                        al
                        {" "}
                        {formData.promotionEnd || "--"}
                    </p>
                </>
            ) : (
                <p className="mt-1 text-sm text-slate-500">
                    Sin promoción configurada
                </p>
            )}
        </div>

        <button
            type="button"
            onClick={() =>
                setShowPromotionPopover(!showPromotionPopover)
            }
            className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-white"
        >
            {formData.hasPromotion ? "Editar" : "Configurar"}
        </button>
    </div>

    {showPromotionPopover && (
        <div className="absolute right-0 top-full z-20 mt-3 w-80 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">

            <div className="flex items-center justify-between mb-5">

                <span className="font-bold text-slate-700">
                    Configurar promoción
                </span>

                <button
                    type="button"
                    onClick={() =>
                        setShowPromotionPopover(false)
                    }
                >
                    <X size={18}/>
                </button>

            </div>

            <div className="space-y-4">

                <button
                    type="button"
                    onClick={() =>
                        setFormData({
                            ...formData,
                            hasPromotion:
                                !formData.hasPromotion
                        })
                    }
                    className={`w-full rounded-xl py-2 font-semibold border ${
                        formData.hasPromotion
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-slate-100"
                    }`}
                >
                    {formData.hasPromotion
                        ? "Promoción activada"
                        : "Activar promoción"}
                </button>

                {formData.hasPromotion && (
                    <>
                        <div>
                            <label className="text-xs font-bold uppercase text-slate-500">
                                Precio promocional
                            </label>

                            <input
                                type="number"
                                step="0.01"
                                className={inputClass}
                                value={formData.promotionPrice}
                                onChange={(e)=>
                                    setFormData({
                                        ...formData,
                                        promotionPrice:e.target.value
                                    })
                                }
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase text-slate-500">
                                Inicio
                            </label>

                            <input
                                type="date"
                                className={inputClass}
                                value={formData.promotionStart}
                                onChange={(e)=>
                                    setFormData({
                                        ...formData,
                                        promotionStart:e.target.value
                                    })
                                }
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase text-slate-500">
                                Fin
                            </label>

                            <input
                                type="date"
                                className={inputClass}
                                value={formData.promotionEnd}
                                onChange={(e)=>
                                    setFormData({
                                        ...formData,
                                        promotionEnd:e.target.value
                                    })
                                }
                            />
                        </div>
                    </>
                )}

                <button
                    type="button"
                    className="w-full rounded-xl bg-indigo-600 py-2 font-bold text-white"
                    onClick={() =>
                        setShowPromotionPopover(false)
                    }
                >
                    Aplicar
                </button>

            </div>

        </div>
    )}
</div>

                        <div className="relative">
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                                Costo Base (Compra)
                            </label>
                            <TrendingUp className="w-4 h-4 absolute left-3 top-8 text-slate-400" />
                            <input
                                type="number"
                                step="0.01"
                                className={inputClass}
                                value={formData.cost}
                                disabled={isSubmitting}
                                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                placeholder="0.00"
                            />
                        </div>

                        {formData.type_item === "Producto" && (
                            <div className="relative">
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                                    Stock Inicial / Disponible
                                </label>
                                <Package className="w-4 h-4 absolute left-3 top-8 text-slate-400" />
                                <input
                                    type="number"
                                    min="0"
                                    className={inputClass}
                                    value={formData.stock}
                                    disabled={isSubmitting}
                                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) || 0 })}
                                    placeholder="0"
                                />
                            </div>
                        )}

                        <div className="relative">
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                                Fecha de Ingreso
                            </label>
                            <Calendar className="w-4 h-4 absolute left-3 top-8 text-slate-400" />
                            <input
                                type="date"
                                className={inputClass}
                                value={formData.entryDate}
                                disabled={isSubmitting}
                                onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                            />
                        </div>

                        {formData.type_item === "Producto" && (
                            <div className="relative">
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                                    Fecha de Vencimiento / Caducidad
                                </label>
                                <CalendarClock className="w-4 h-4 absolute left-3 top-8 text-slate-400" />
                                <input
                                    type="date"
                                    className={inputClass}
                                    value={formData.expirationDate}
                                    disabled={isSubmitting}
                                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                                />
                            </div>
                        )}
                    </div>

                    <div className="sm:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100 flex-shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition active:scale-95 disabled:opacity-40"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/10 transition flex items-center gap-2 active:scale-95 disabled:opacity-80 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Procesando...
                                </>
                            ) : isEditMode ? (
                                "Actualizar Producto"
                            ) : (
                                "Guardar Registro"
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <ModalError
                open={showError}
                title="Error al actualizar producto"
                message={errorMessage}
                onClose={() => setShowError(false)}
            />
            <StockReasonModal
                open={showStockReasonModal}
                onClose={() => setShowStockReasonModal(false)}
                onConfirm={handleStockReasonConfirm}
            />
        </div>
    );
}