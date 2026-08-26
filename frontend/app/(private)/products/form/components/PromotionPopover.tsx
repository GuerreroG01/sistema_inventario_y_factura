import { X, Tag } from "lucide-react";
import type { ProductUnitForm } from "../hooks/useProductForm";

interface PromotionPopoverProps {
    unit: ProductUnitForm;
    index: number;
    typeItem: "Producto" | "Servicio";
    updateUnitField: <K extends keyof ProductUnitForm>(
        index: number,
        field: K,
        value: ProductUnitForm[K]
    ) => void;
    onClose: () => void;
    inputClass: string;
}

export default function PromotionPopover({
    unit, index, typeItem, updateUnitField, onClose, inputClass
}: PromotionPopoverProps) {
    const promotionInputClass =
        inputClass.replace("pl-9", "pl-3");

    return (
        <div
            className="
                fixed
                z-50
                top-[120px]
                left-[950px]
                w-[400px]
                max-w-[calc(100vw-2rem)]
                max-h-[calc(100vh-2rem)]
                overflow-y-auto
                overflow-x-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-xl
                shadow-slate-900/10
                max-md:left-1/2
                max-md:-translate-x-1/2
                max-md:top-1/2
                max-md:-translate-y-1/2
                max-md:w-[calc(100vw-2rem)]
            "
        >
            <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                                <Tag size={18} />
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                    Configurar promoción
                                </h3>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    Define el precio, cantidad y vigencia de tu oferta
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                        aria-label="Cerrar"
                    >
                        <X size={17} />
                    </button>
                </div>
            </div>

            <div className="space-y-5 p-5">

                <button
                    type="button"
                    onClick={() =>
                        updateUnitField(
                            index,
                            "hasPromotion",
                            !unit.hasPromotion
                        )
                    }
                    className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                        unit.hasPromotion
                            ? "border-indigo-200 bg-indigo-50/70"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                unit.hasPromotion
                                    ? "bg-indigo-600 text-white"
                                    : "bg-slate-100 text-slate-500"
                            }`}
                        >
                            <Tag size={18} />
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-slate-800">
                                Promoción
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                                {unit.hasPromotion
                                    ? "La promoción está activa"
                                    : "Activa una oferta para este producto"}
                            </p>
                        </div>
                    </div>

                    <div
                        className={`relative h-6 w-11 rounded-full transition ${
                            unit.hasPromotion
                                ? "bg-indigo-600"
                                : "bg-slate-300"
                        }`}
                    >
                        <div
                            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                                unit.hasPromotion
                                    ? "left-6"
                                    : "left-1"
                            }`}
                        />
                    </div>
                </button>

                {unit.hasPromotion && (
                    <div className="space-y-4">

                        <div
                            className={
                                typeItem === "Servicio"
                                    ? "grid grid-cols-1 gap-3"
                                    : "grid grid-cols-2 gap-3"
                            }
                        >

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                                    Precio promocional
                                </label>

                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                                        C$
                                    </span>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        className={`${promotionInputClass} pl-8`}
                                        value={unit.promotionPrice}
                                        onChange={(e) =>
                                            updateUnitField(
                                                index,
                                                "promotionPrice",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <p className="mt-1.5 text-[11px] text-slate-400">
                                    Precio por la promoción.
                                </p>
                            </div>

                            {typeItem !== "Servicio" && (
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                                        Cantidad promocional
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        placeholder="Ej. 3"
                                        className={promotionInputClass}
                                        value={unit.promotionQuantity}
                                        onChange={(e) =>
                                            updateUnitField(
                                                index,
                                                "promotionQuantity",
                                                e.target.value
                                            )
                                        }
                                    />

                                    <p className="mt-1.5 text-[11px] text-slate-400">
                                        Ej. lleva 3 unidades por el precio promocional.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="mb-1.5 flex items-center justify-between">
                                <label className="text-xs font-semibold text-slate-600">
                                    Vigencia de la promoción
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-3">

                                <div>
                                    <label className="mb-1 block text-[11px] font-medium text-slate-500">
                                        Fecha de inicio
                                    </label>

                                    <input
                                        type="date"
                                        className={promotionInputClass}
                                        value={unit.promotionStart}
                                        onChange={(e) =>
                                            updateUnitField(
                                                index,
                                                "promotionStart",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-[11px] font-medium text-slate-500">
                                        Fecha de finalización
                                    </label>

                                    <input
                                        type="date"
                                        className={promotionInputClass}
                                        value={unit.promotionEnd}
                                        onChange={(e) =>
                                            updateUnitField(
                                                index,
                                                "promotionEnd",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4">
                <div className="flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-800"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700 active:scale-[0.98]"
                    >
                        Aplicar cambios
                    </button>
                </div>
            </div>
        </div>
    );
}