import ModalSuccess from "./ModalSuccess";

interface SaleItem {
    product_unit_id: number;
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    stock_disponible: number;
    es_promocion: boolean;
}

interface SaleItemsProps {
    items: SaleItem[];
    updateItemQuantity: (
        productUnitId: number,
        quantity: number,
        esPromocion: boolean
    ) => void;
    removeItem: (index: number) => void;
    submit: () => void;
    loading: boolean;
    successOpen: boolean;
    setSuccessOpen: (open: boolean) => void;
}

export default function SaleItems({ items, updateItemQuantity, removeItem, submit, loading, successOpen, setSuccessOpen,
}: SaleItemsProps) {
    return (
        <div className="md:col-span-2 space-y-6">

            <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                    {items.length}{" "}
                    {items.length === 1 ? "artículo" : "artículos"}
                </span>
            </div>

            <div className="
                space-y-3
                max-h-[420px]
                overflow-y-auto
                pr-2
            ">
                {items.length === 0 && (
                    <div className="
                        border border-dashed
                        rounded-2xl
                        bg-white
                        py-5
                        text-center
                        text-slate-400
                        text-sm
                    ">
                        Aún no hay productos en la venta
                    </div>
                )}

                {items.map((item, index) => (
                    <div
                        key={`${item.product_unit_id}-${item.es_promocion ? "promo" : "normal"}`}
                        className="
                            flex items-center justify-between
                            bg-white
                            border border-slate-200
                            rounded-2xl
                            px-4 py-3
                            shadow-sm
                            hover:shadow-md
                            transition
                        "
                    >
                        <div>
                            <p className="text-sm font-semibold text-slate-900">
                                {item.descripcion}
                            </p>

                            <div className="flex items-center gap-2 mt-1">

                                <input
                                    type="number"
                                    min="1"
                                    max={item.stock_disponible}
                                    value={item.cantidad}
                                    onChange={(e) =>
                                        updateItemQuantity(
                                            item.product_unit_id,
                                            Number(e.target.value),
                                            item.es_promocion
                                        )
                                    }
                                    className="
                                        w-16
                                        border
                                        border-slate-300
                                        rounded-lg
                                        px-2
                                        py-1
                                        text-xs
                                    "
                                />

                                <span className="text-xs text-slate-500">
                                    × C${item.precio_unitario}
                                </span>

                                {item.es_promocion && (
                                    <span className="
                                        rounded-full
                                        bg-emerald-100
                                        px-2 py-1
                                        text-[10px]
                                        font-semibold
                                        text-emerald-700
                                    ">
                                        PROMO
                                    </span>
                                )}

                                <span className="text-xs text-slate-400">
                                    Stock: {item.stock_disponible}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="
                                text-xs font-medium
                                text-red-500 hover:text-red-600
                            "
                        >
                            Eliminar
                        </button>
                    </div>
                ))}
            </div>

            <div className="
                flex items-center justify-end
                pt-6 border-t border-slate-200
            ">
                <button
                    type="button"
                    onClick={submit}
                    disabled={loading}
                    className="
                        bg-gradient-to-r from-indigo-600 to-indigo-700
                        hover:from-indigo-700 hover:to-indigo-800
                        text-white
                        px-6 py-3
                        rounded-2xl
                        font-semibold
                        shadow-lg
                        transition
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                    "
                >
                    {loading ? "Procesando..." : "Vender"}
                </button>
            </div>

            <ModalSuccess
                open={successOpen}
                onClose={() => setSuccessOpen(false)}
            />

        </div>
    );
}