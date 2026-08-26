import { Box, CalendarClock } from "lucide-react";

interface Unidad {
    id: number | string;
    unidad: string;
    stock: number;
    fechaVencimiento: string;
}

interface ExpirationStatus {
    label: string;
    className: string;
}

interface ProductUnitsDetailProps {
    expanded: boolean;
    unidades: Unidad[];
    getDaysUntilExpiration: (date: string) => number;
    getExpirationStatus: (days: number) => ExpirationStatus;
    formatDate: (date: string) => string;
}

export function ProductUnitsDetail({
    expanded,
    unidades,
    getDaysUntilExpiration,
    getExpirationStatus,
    formatDate,
}: ProductUnitsDetailProps) {
    return (
        <tr className="bg-gray-50/70">
            <td
                colSpan={4}
                className="px-2 sm:px-4"
            >
                <div
                    className={`units-detail-wrapper ${
                        expanded
                            ? "units-detail-wrapper--open"
                            : ""
                    }`}
                >
                    <div className="units-detail-content">
                        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-3 py-2.5 sm:px-5 sm:py-3">
                            <div className="flex min-w-0 items-center gap-2">
                                <Box className="h-4 w-4 shrink-0 text-indigo-500" />

                                <span className="truncate text-[10px] font-bold uppercase tracking-wide text-gray-500 sm:text-xs">
                                    Detalle de presentaciones
                                </span>
                            </div>

                            <span className="ml-3 shrink-0 text-[9px] text-gray-400 sm:text-xs">
                                {unidades.length}{" "}
                                {unidades.length === 1
                                    ? "registro"
                                    : "registros"}
                            </span>
                        </div>
                        <div className="hidden md:block">
                            <div className="grid grid-cols-[minmax(220px,1fr)_120px_200px] items-center gap-6 border-b border-gray-100 bg-gray-50/60 px-6 py-3.5">
                                <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                                    Presentación
                                </span>

                                <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                                    Stock
                                </span>

                                <span className="text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                                    Vencimiento
                                </span>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {unidades.map((unidad) => {
                                    const unitDays =
                                        getDaysUntilExpiration(
                                            unidad.fechaVencimiento
                                        );

                                    const unitExpiration =
                                        getExpirationStatus(unitDays);

                                    return (
                                        <div
                                            key={unidad.id}
                                            className="grid grid-cols-[minmax(220px,1fr)_120px_200px] items-center gap-6 px-6 py-4 transition-colors hover:bg-indigo-50/30"
                                        >
                                            <div className="flex min-w-0 items-center gap-3.5">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
                                                    <Box className="h-5 w-5" />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate text-[15px] font-semibold text-gray-800">
                                                        {unidad.unidad}
                                                    </p>

                                                    <p className="mt-0.5 text-xs text-gray-400">
                                                        Presentación
                                                    </p>
                                                </div>
                                            </div>

                                            <div>
                                                <span className="inline-flex min-w-[52px] items-center justify-center rounded-lg bg-indigo-50 px-3 py-1.5 text-base font-bold text-indigo-600">
                                                    {unidad.stock}
                                                </span>
                                            </div>

                                            <div className="flex flex-col items-end gap-1">
                                                <span
                                                    className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-bold ${unitExpiration.className}`}
                                                >
                                                    {unitExpiration.label}
                                                </span>

                                                <div className="flex items-center gap-1.5">
                                                    <CalendarClock className="h-3.5 w-3.5 text-gray-400" />

                                                    <p className="text-xs font-medium text-gray-500">
                                                        {formatDate(
                                                            unidad.fechaVencimiento
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="space-y-2.5 bg-gray-50/40 p-2.5 md:hidden">
                            {unidades.map((unidad) => {
                                const unitDays =
                                    getDaysUntilExpiration(
                                        unidad.fechaVencimiento
                                    );

                                const unitExpiration =
                                    getExpirationStatus(unitDays);

                                return (
                                    <div
                                        key={unidad.id}
                                        className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex min-w-0 items-center gap-2.5">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
                                                    <Box className="h-4 w-4" />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate text-xs font-semibold text-gray-800">
                                                        {unidad.unidad}
                                                    </p>

                                                    <p className="mt-0.5 text-[9px] text-gray-400">
                                                        Presentación
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="shrink-0 text-right">
                                                <p className="text-[8px] font-bold uppercase tracking-wide text-gray-400">
                                                    Stock
                                                </p>

                                                <p className="text-sm font-bold leading-4 text-indigo-600">
                                                    {unidad.stock}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-gray-100 pt-2.5">
                                            <div className="flex min-w-0 items-center gap-1.5">
                                                <CalendarClock className="h-3.5 w-3.5 shrink-0 text-gray-400" />

                                                <div className="min-w-0">
                                                    <p className="text-[8px] font-medium uppercase tracking-wide text-gray-400">
                                                        Vencimiento
                                                    </p>

                                                    <p className="truncate text-[10px] font-medium text-gray-600">
                                                        {formatDate(
                                                            unidad.fechaVencimiento
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <span
                                                className={`inline-flex shrink-0 rounded-md border px-2 py-1 text-[9px] font-bold ${unitExpiration.className}`}
                                            >
                                                {unitExpiration.label}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    );
}
