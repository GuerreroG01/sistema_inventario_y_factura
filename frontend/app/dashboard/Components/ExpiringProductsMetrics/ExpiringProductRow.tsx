import { ExpiringProduct } from "@/types/dashboard/expiringProductsMetrics";
import Barcode from "react-barcode";

interface Props{
    product:ExpiringProduct;
}
export function ExpiringProductRow({product}:Props){
    const days = Math.ceil(
        (new Date(product.fechaVencimiento).getTime()-Date.now())
        /86400000
    );

    return(
        <tr className="border-t border-gray-100 hover:bg-gray-50 transition">
            <td className="px-6 py-4">
                <div>
                    <p className="font-semibold text-gray-900">
                        {product.nombre}
                    </p>
                    {
                        product.codigo ? (
                            <div className="mt-2 rounded-lg border border-gray-200 bg-white p-2 inline-block">
                                <Barcode
                                    value={product.codigo}
                                    format="CODE128"
                                    width={1.2}
                                    height={28}
                                    margin={0}
                                    displayValue={false}
                                    background="transparent"
                                />
                                <p className="mt-1 text-center font-mono text-[10px] tracking-widest text-gray-500">
                                    {product.codigo}
                                </p>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400">
                                Sin código
                            </p>
                        )
                    }
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-600">
                {product.categoria ?? "-"}
            </td>

            <td className="px-6 py-4 text-center">
                <span className="rounded-lg bg-blue-50 text-blue-700 px-3 py-1 text-xs font-bold">
                    {product.stock}
                </span>
            </td>
            <td className="px-6 py-4 text-right">
                <div>
                    <p className="font-semibold text-red-600">
                        {days === 0 ? "Expirado" : `${days} días`}
                    </p>
                    <p className="text-xs text-gray-400">
                        {new Date(product.fechaVencimiento)
                            .toLocaleDateString()}
                    </p>
                </div>
            </td>
        </tr>
    );
}