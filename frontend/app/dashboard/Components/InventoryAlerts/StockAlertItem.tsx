import type { StockAlertProduct } from "@/types/dashboard/inventoryAlertsProducts";
import Barcode from "react-barcode";

interface StockAlertItemProps {
    product: StockAlertProduct;
    type: "critical" | "empty";
}

export default function StockAlertItem({
    product, type
}: StockAlertItemProps) {

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
            <div>
                <h3 className="font-semibold text-gray-900">
                    {product.name}
                </h3>
                <p className="text-sm text-gray-500">
                    {product.category}
                </p>
                {product.barcode && (
                    <>
                        <Barcode
                            value={product.barcode}
                            format="CODE128"
                            width={1.2}
                            height={28}
                            margin={0}
                            displayValue={false}
                            background="transparent"
                        />

                        <p className="mt-1 text-center font-mono text-[10px] tracking-widest text-gray-500">
                            {product.barcode}
                        </p>
                    </>
                )}
            </div>

            <div className="text-right">
                <p className="font-semibold text-gray-900">
                    C${product.price}
                </p>
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