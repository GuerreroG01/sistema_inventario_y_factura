"use client";
import { useCreateSale } from "../hooks/useCretateSale";
import ModalSuccess from "./ModalSuccess";
import { BanknoteArrowUp as Transference, Receipt as Cash, Wallet as Credit, CreditCard as Card } from "lucide-react";


export default function CreateSaleForm() {
    const { category,  setCategory, setClientId,  items,
        searchProduct, productResults, searchLoading, setSearchProduct, addProductDirect,
        removeItem, updateItemQuantity, now, total, loading, submit, successOpen, setSuccessOpen,
        searchCustomer, setSearchCustomer, customerResults, setCustomerResults, searchLoadingCus,
        selectCustomer, selectedCustomer, setSelectedCustomer, payment_type, setPaymentType, isPromotionActive
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
                        C${total.toFixed(2)}
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
                                placeholder="Categoría. Ej: Normal, crédito, etc."
                                className="input-premium"
                            />

                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchCustomer}
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        setSearchCustomer(value);

                                        if (
                                            selectedCustomer &&
                                            value !== selectedCustomer.name
                                        ) {
                                            setClientId(null);
                                            setSelectedCustomer(null);
                                        }
                                    }}
                                    placeholder="Buscar cliente..."
                                    className="input-premium"
                                />

                                {selectedCustomer && (
                                    <p className="mt-1 text-xs text-emerald-600">
                                        Cliente seleccionado: {selectedCustomer.name}
                                    </p>
                                )}

                                {searchLoadingCus && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <div className="
                                            h-4 w-4 animate-spin
                                            rounded-full border-2
                                            border-slate-300
                                            border-t-indigo-600
                                        " />
                                    </div>
                                )}

                                {customerResults.length > 0 && (
                                    <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg">
                                        {customerResults.map((customer) => (
                                            <button
                                                key={customer.id}
                                                type="button"
                                                onClick={() => selectCustomer(customer)}
                                                className="flex w-full flex-col px-4 py-3 text-left hover:bg-slate-100"
                                            >
                                                <span className="font-medium text-slate-800">
                                                    {customer.name}
                                                </span>

                                                <span className="text-xs text-slate-500">
                                                    {customer.identification || "Sin identificación"}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Tipo de pago
                                </label>

                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                        {payment_type === "CASH" && <Cash className="w-4 h-4" />}
                                        {payment_type === "CREDIT" && <Credit className="w-4 h-4" />}
                                        {payment_type === "CARD" && <Card className="w-4 h-4" />}
                                        {payment_type === "TRANSFER" && <Transference className="w-4 h-4" />}
                                    </div>
                                    
                                    <select
                                        value={payment_type}
                                        onChange={(e) =>
                                            setPaymentType(
                                                e.target.value as "CASH" | "CREDIT" | "CARD" | "TRANSFER"
                                            )
                                        }
                                        className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm font-medium shadow-sm transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 appearance-none cursor-pointer"
                                    >
                                        <option value="CASH">Efectivo</option>
                                        <option value="CREDIT">Crédito</option>
                                        <option value="CARD">Tarjeta</option>
                                        <option value="TRANSFER">Transferencia</option>
                                    </select>

                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-sm font-semibold text-slate-700">
                            Agregar productos
                        </h2>

                        <div className="relative">
                            <input
                                value={searchProduct}
                                onChange={e => setSearchProduct(e.target.value)}
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
                                        h-4 
                                        w-4 
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
                                                px-4 py-2
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
                                                {isPromotionActive(p) ? (
                                                    <>
                                                        <span className="font-bold text-emerald-600">
                                                            C${Number(p.promotionPrice).toFixed(2)}
                                                        </span>

                                                        <span className="ml-1 text-slate-400 line-through">
                                                            C${Number(p.price).toFixed(2)}
                                                        </span>

                                                        <span className="ml-2 font-semibold text-emerald-600">
                                                            Promoción
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>
                                                            C${Number(p.price).toFixed(2)}
                                                        </span>
                                                    </>
                                                )}

                                                {" · Stock "}
                                                {p.stock}
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
                                            × C${i.precio_unitario}
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