import type { StockAlertProduct } from "@/types/dashboard/inventoryAlertsProducts";
import Barcode from "react-barcode";

interface StockAlertItemProps {
    product: StockAlertProduct;
    type: "critical" | "empty";
}

export default function StockAlertItem({
    product, type
}: StockAlertItemProps) {
    const isPromotionActive =
        product.hasPromotion &&
        product.promotionPrice !== null &&
        (!product.promotionStart ||
            new Date() >= new Date(product.promotionStart)) &&
        (!product.promotionEnd ||
            new Date() <= new Date(product.promotionEnd));
    return (
        <div
            className={`
                flex justify-between items-center
                rounded-2xl
                border
                p-4
                transition-colors
                ${
                    type === "critical"
                        ? "border-orange-100 bg-orange-50/40"
                        : "border-red-100 bg-red-50/40"
                }
            `}
        >
            <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="min-w-0 truncate font-semibold text-gray-900">
                        {product.product.name}
                    </h3>
                    <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                        {product.unit}
                    </span>
                </div>
                <p className="text-sm text-gray-500">
                    {product.product.category ?? "Sin categoría"}
                </p>
                {product.barcode && (
                    <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50/70 px-3 py-2">
                        <div className="flex justify-center overflow-hidden">
                            <Barcode
                                value={product.barcode}
                                format="CODE128"
                                width={1.2}
                                height={28}
                                margin={0}
                                displayValue={false}
                                background="transparent"
                            />
                        </div>

                        <p className="mt-1 text-center font-mono text-[10px] tracking-[0.2em] text-gray-500">
                            {product.barcode}
                        </p>
                    </div>
                )}
            </div>

            <div className="text-right">
                {isPromotionActive ? (
                    <div>
                        <p className="text-sm text-gray-400 line-through">
                            C${product.price}
                        </p>

                        <p className="font-semibold text-red-600">
                            C${product.promotionPrice}
                        </p>

                        <span className="mt-1 inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                            En promoción
                        </span>
                    </div>
                ) : (
                    <p className="font-semibold text-gray-900">
                        C${product.price}
                    </p>
                )}

                <span
                    className={`
                        inline-flex mt-2 rounded-full px-3 py-1 text-xs font-semibold
                        ${
                            type === "critical"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-red-100 text-red-700"
                        }
                    `}
                >
                    Stock: {product.stock}
                </span>
            </div>
        </div>
    );
}