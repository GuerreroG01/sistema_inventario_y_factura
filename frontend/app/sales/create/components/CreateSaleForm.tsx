"use client";
import { useCreateSale } from "../hooks/useCretateSale";
import ModalSuccess from "./ModalSuccess";
export default function CreateSaleForm() {
    const { category,  setCategory, setClientId,  items,
        searchProduct, productResults, searchLoading, searchProducts, addProductDirect,
        removeItem, updateItemQuantity, now, total, loading, submit, successOpen, setSuccessOpen,
} = useCreateSale();

    return (
    <div className="min-h-screen bg-slate-100 p-6 flex justify-center">
        <div className="
            w-full max-w-6xl
            bg-white
            rounded-3xl
            shadow-2xl
            border border-slate-200
            overflow-hidden
        ">

            <div className="
                bg-gradient-to-r from-slate-900 via-indigo-900 to-indigo-700
                text-white
                px-8 py-3
                flex items-center justify-between
            ">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Registro de ventas
                    </h1>
                </div>

                <div className="text-right">
                    <p className="text-xs text-indigo-200">
                        {now}
                    </p>

                    <p className="text-xs text-slate-300 mt-1">
                        Total actual
                    </p>

                    <p className="text-3xl font-bold tracking-tight">
                        ${total.toFixed(2)}
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 p-8 bg-slate-50">

                <div className="space-y-6">

                    <div>
                        <h2 className="text-sm font-semibold text-slate-700 mb-3">
                            Datos de la venta
                        </h2>

                        <div className="space-y-3">
                            <input
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                placeholder="Categoría. Ej: ordinario, crédito, etc."
                                className="input-premium"
                            />

                            <input
                                type="number"
                                onChange={e =>
                                    setClientId(
                                        e.target.value ? Number(e.target.value) : null
                                    )
                                }
                                placeholder="ID cliente (opcional)"
                                className="input-premium"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-sm font-semibold text-slate-700">
                            Agregar productos
                        </h2>

                        <div className="relative">
                            <input
                                value={searchProduct}
                                onChange={e => searchProducts(e.target.value)}
                                placeholder="Buscar producto..."
                                className="input-premium w-full"
                            />

                            {searchLoading && (
                                <p className="text-xs text-slate-400 mt-2">
                                    Buscando productos...
                                </p>
                            )}

                            {productResults.length > 0 && (
                                <div className="
                                    absolute z-30 w-full mt-2
                                    bg-white border border-slate-200
                                    rounded-2xl shadow-xl
                                    overflow-hidden
                                ">
                                    {productResults.map(p => (
                                        <div
                                            key={p.id}
                                            onClick={() => addProductDirect(p)}
                                            className="
                                                px-4 py-1
                                                cursor-pointer
                                                hover:bg-indigo-50
                                                transition
                                                border-b last:border-none
                                            "
                                        >
                                            <p className="text-sm font-semibold text-slate-900">
                                                {p.name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                ${p.price} · Stock {p.stock}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 space-y-6">

                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                            {items.length} productos
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

                        {items.map((i, index) => (
                            <div
                                key={index}
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
                                        {i.descripcion}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <input
                                            type="number"
                                            min="1"
                                            value={i.cantidad}
                                            onChange={(e) =>
                                                updateItemQuantity(
                                                    i.product_id,
                                                    Number(e.target.value)
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
                                            × ${i.precio_unitario}
                                        </span>
                                    </div>
                                </div>

                                <button
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
            </div>
        </div>
    </div>
);
}