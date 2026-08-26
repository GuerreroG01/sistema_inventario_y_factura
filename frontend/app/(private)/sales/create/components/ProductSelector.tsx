"use client";

import { Product, ProductUnit } from "@/types/product";
import { useState } from "react"; 
import UnitSelectorModal from "./UnitSelectorModal";

type ProductSelectorProps = {
    searchProduct: string;
    setSearchProduct: (value: string) => void;
    productResults: Product[];
    searchLoading: boolean;
    isPromotionActive: (unit: ProductUnit) => boolean;
    onSelectUnit: (
        product: Product,
        unit: ProductUnit
    ) => void;
};

export default function ProductSelector({
    searchProduct, setSearchProduct, productResults, searchLoading, isPromotionActive, onSelectUnit
}: ProductSelectorProps) {

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const handleSelectUnit = ( product: Product, unit: ProductUnit ) => {
        onSelectUnit(product, unit);
        setSelectedProduct(null);
        setSearchProduct("");
    };

    return (
        <>
            <div className="space-y-3">
                <h2 className="text-sm font-semibold text-slate-700">
                    Agregar productos
                </h2>

                <div className="relative">
                    <input
                        value={searchProduct}
                        onChange={(e) => setSearchProduct(e.target.value)}
                        placeholder="Buscar producto..."
                        className="input-premium w-full pr-10"
                    />
                    {searchLoading && (
                        <div className="
                            absolute
                            right-3
                            top-1/2
                            -translate-y-1/2
                        ">
                            <div className="
                                h-4 w-4
                                animate-spin
                                rounded-full
                                border-2
                                border-slate-300
                                border-t-indigo-600
                            " />
                        </div>
                    )}
                    {productResults.length > 0 && (
                        <div className="
                            absolute
                            z-30
                            mt-2
                            w-full
                            bg-white
                            border border-slate-200
                            rounded-2xl
                            shadow-xl
                            overflow-hidden
                        ">
                            {productResults.map((product) => {

                                const activeUnits =
                                    product.units.filter(
                                        unit => unit.active
                                    );
                                return (
                                    <button
                                        key={product.id}
                                        type="button"
                                        onClick={() =>
                                            setSelectedProduct(product)
                                        }
                                        className="
                                            w-full
                                            px-4 py-3
                                            text-left
                                            hover:bg-indigo-50
                                            transition
                                            border-b
                                            border-slate-100
                                            last:border-none
                                        "
                                    >
                                        <div className="
                                            flex
                                            items-center
                                            justify-between
                                            gap-4
                                        ">
                                            <div>
                                                <p className="
                                                    text-sm
                                                    font-semibold
                                                    text-slate-900
                                                ">
                                                    {product.name}
                                                </p>

                                                <p className="
                                                    text-xs
                                                    text-slate-500
                                                ">
                                                    {product.category ||
                                                        "Sin categoría"}
                                                    {" · "}
                                                    {product.type_item}
                                                </p>
                                            </div>

                                            <span className="
                                                shrink-0
                                                text-xs
                                                text-slate-400
                                            ">
                                                {activeUnits.length}{" "}
                                                {activeUnits.length === 1
                                                    ? "presentación"
                                                    : "presentaciones"}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            {selectedProduct && (
                <UnitSelectorModal
                    product={selectedProduct}
                    isPromotionActive={isPromotionActive}
                    onSelect={(unit) =>
                        handleSelectUnit(selectedProduct, unit)
                    }
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </>
    );
}