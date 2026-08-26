"use client";

import { Product, ProductUnit } from "@/types/product";
import { X } from "lucide-react";

type UnitSelectorModalProps = {
    product: Product;
    isPromotionActive: (unit: ProductUnit) => boolean;
    onSelect: (unit: ProductUnit) => void;
    onClose: () => void;
};

export default function UnitSelectorModal({
    product, isPromotionActive, onSelect, onClose
}: UnitSelectorModalProps) {

    const activeUnits = product.units.filter(
        unit => unit.active
    );

    return (
        <div className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/50
            p-4
        ">
            <div className="
                w-full
                max-w-lg
                max-h-[80vh]
                overflow-hidden
                rounded-3xl
                bg-white
                shadow-2xl
            ">
                <div className="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-slate-200
                    px-6
                    py-4
                ">
                    <div>
                        <h2 className="
                            text-lg
                            font-bold
                            text-slate-900
                        ">
                            Seleccionar presentación
                        </h2>

                        <p className="
                            mt-1
                            text-sm
                            text-slate-500
                        ">
                            {product.name}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            rounded-xl
                            p-2
                            text-slate-400
                            hover:bg-slate-100
                            hover:text-slate-700
                        "
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="
                    max-h-[60vh]
                    overflow-y-auto
                    p-3
                ">
                    {activeUnits.length === 0 ? (
                        <div className="
                            py-10
                            text-center
                            text-sm
                            text-slate-500
                        ">
                            Este producto no tiene presentaciones activas.
                        </div>
                    ) : (
                        <div className="space-y-2">

                            {activeUnits.map(unit => {
                                const promotionActive = isPromotionActive(unit);
                                const promotionStock =
                                    Number(
                                        unit.promotionQuantity || 0
                                    );
                                const normalStock = Number(unit.stock || 0);

                                const promotionAvailable = promotionActive && promotionStock > 0;
                                const totalStock =
                                    normalStock +
                                    (
                                        promotionAvailable
                                            ? promotionStock
                                            : 0
                                    );
                                const normalPrice = Number(unit.price);

                                const promotionPrice = Number( unit.promotionPrice || 0 );

                                const price =
                                    promotionAvailable
                                        ? promotionPrice
                                        : normalPrice;

                                return (
                                    <button
                                        key={unit.id}
                                        type="button"
                                        onClick={() =>
                                            onSelect(unit)
                                        }
                                        className="
                                            w-full
                                            rounded-2xl
                                            border
                                            border-slate-200
                                            bg-white
                                            px-4
                                            py-4
                                            text-left
                                            transition
                                            hover:border-indigo-300
                                            hover:bg-indigo-50
                                            hover:shadow-sm
                                        "
                                    >

                                        <div className="
                                            flex
                                            items-center
                                            justify-between
                                            gap-4
                                        ">
                                            <div className="min-w-0">

                                                <p className="
                                                    text-sm
                                                    font-bold
                                                    text-slate-900
                                                ">
                                                    {unit.unit}
                                                </p>

                                                {unit.barcode && (
                                                    <p className="
                                                        mt-1
                                                        text-xs
                                                        text-slate-400
                                                    ">
                                                        Código:{" "}
                                                        {unit.barcode}
                                                    </p>
                                                )}

                                                {product.type_item === "Producto" && (
                                                    <div className="
                                                        mt-2
                                                        flex
                                                        flex-wrap
                                                        items-center
                                                        gap-2
                                                    ">
                                                        {promotionAvailable && (
                                                            <span className="
                                                                rounded-full
                                                                bg-emerald-100
                                                                px-2
                                                                py-1
                                                                text-[10px]
                                                                font-semibold
                                                                text-emerald-700
                                                            ">
                                                                Promo:{" "}
                                                                {promotionStock}
                                                            </span>
                                                        )}
                                                        <span className="
                                                            rounded-full
                                                            bg-slate-100
                                                            px-2
                                                            py-1
                                                            text-[10px]
                                                            font-semibold
                                                            text-slate-600
                                                        ">
                                                            Normal:{" "}
                                                            {normalStock}
                                                        </span>
                                                        <span className="
                                                            text-[10px]
                                                            font-medium
                                                            text-slate-400
                                                        ">
                                                            Total:{" "}
                                                            {totalStock}
                                                        </span>

                                                    </div>
                                                )}

                                            </div>
                                            <div className="
                                                shrink-0
                                                text-right
                                            ">

                                                {promotionAvailable && (
                                                    <p className="
                                                        text-xs
                                                        text-slate-400
                                                        line-through
                                                    ">
                                                        C$
                                                        {normalPrice.toFixed(2)}
                                                    </p>
                                                )}

                                                <p className={`
                                                    text-base
                                                    font-bold
                                                    ${
                                                        promotionAvailable
                                                            ? "text-emerald-600"
                                                            : "text-slate-900"
                                                    }
                                                `}>
                                                    C$
                                                    {price.toFixed(2)}
                                                </p>

                                                {promotionAvailable && (
                                                    <p className="
                                                        text-[10px]
                                                        font-semibold
                                                        text-emerald-600
                                                    ">
                                                        Promoción
                                                    </p>
                                                )}

                                            </div>

                                        </div>
                                    </button>
                                );
                            })}

                        </div>
                    )}
                </div>
                <div className="
                    border-t
                    border-slate-200
                    px-6
                    py-4
                    flex
                    justify-end
                ">
                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            rounded-xl
                            border
                            border-slate-200
                            px-4
                            py-2
                            text-sm
                            font-medium
                            text-slate-600
                            hover:bg-slate-100
                        "
                    >
                        Cancelar
                    </button>
                </div>

            </div>
        </div>
    );
}