"use client";

import { useState } from "react";
import { PayrollRulePaginationData } from "@/types/worksheet/payroll/PayrollRule";
interface PayrollRulePaginationProps {
    pagination: PayrollRulePaginationData;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
}

export default function PayrollRulePagination({ pagination, onPageChange, onLimitChange }: PayrollRulePaginationProps) {
    const { total, page, limit, totalPages, } = pagination;
    const [showLimitOptions, setShowLimitOptions] = useState(false);

    const handleLimitChange = (newLimit: number) => {
        setShowLimitOptions(false);
        onLimitChange(newLimit);
    };
    if (total === 0) {
        return null;
    }

    const goToPage = (p: number) => {
        if (p === page || p < 1 || p > totalPages) {
            return;
        }
        onPageChange(p);
    };

    const getPages = () => {
        if (totalPages <= 7) {
            return Array.from(
                { length: totalPages },
                (_, i) => i + 1
            );
        }

        const pages: (number | "...")[] = [];
        pages.push(1);
        if (page > 4) {
            pages.push("...");
        }

        const start = Math.max(2, page - 1);
        const end = Math.min(totalPages - 1, page + 1);
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        if (page < totalPages - 3) {
            pages.push("...");
        }
        pages.push(totalPages);
        return pages;
    };

    const pages = getPages();
    const firstItem = (page - 1) * limit + 1;
    const lastItem = Math.min(page * limit, total);

    return (
        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-gray-500">
                Mostrando{" "}
                <span className="font-semibold text-gray-700">
                    {firstItem}
                </span>{" "}
                a{" "}
                <span className="font-semibold text-gray-700">
                    {lastItem}
                </span>{" "}
                de{" "}
                <span className="font-semibold text-gray-700">
                    {total}
                </span>{" "}
                reglas
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => goToPage(page - 1)}
                    className="rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-700 shadow transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Anterior
                </button>
                {pages.map((p, index) =>
                    p === "..." ? (
                        <span
                            key={`ellipsis-${index}`}
                            className="px-2 py-2 text-gray-500"
                        >
                            ...
                        </span>
                    ) : (
                        <button
                            key={p}
                            type="button"
                            onClick={() => goToPage(p)}
                            className={`rounded-lg px-4 py-2 font-semibold shadow transition ${
                                p === page
                                    ? "scale-105 bg-indigo-600 text-white shadow-lg"
                                    : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            {p}
                        </button>
                    )
                )}
                <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => goToPage(page + 1)}
                    className="rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-700 shadow transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Siguiente
                </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="whitespace-nowrap font-medium text-gray-500">
                    Mostrar
                </span>

                <div className="relative">
                    <button
                        type="button"
                        aria-haspopup="listbox"
                        aria-expanded={showLimitOptions}
                        onClick={() =>
                            setShowLimitOptions((prev) => !prev)
                        }
                        className={`
                            flex h-9 min-w-[82px] items-center
                            justify-between gap-2 rounded-lg
                            border bg-white px-3
                            text-sm font-semibold text-gray-700
                            shadow-sm outline-none
                            transition-all duration-200
                            ${
                                showLimitOptions
                                    ? "border-indigo-500 ring-4 ring-indigo-100"
                                    : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30"
                            }
                        `}
                    >
                        <span>{limit}</span>

                        <svg
                            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                                showLimitOptions ? "rotate-180" : ""
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m6 9 6 6 6-6"
                            />
                        </svg>
                    </button>

                    {showLimitOptions && (
                        <div
                            role="listbox"
                            className="
                                absolute bottom-full left-0 z-50 mb-2
                                w-full min-w-[82px]
                                overflow-hidden rounded-xl
                                border border-gray-200
                                bg-white p-1.5
                                shadow-xl shadow-gray-200/60
                                ring-1 ring-black/5
                            "
                        >
                            {[10, 25, 50].map((option) => {
                                const selected = limit === option;

                                return (
                                    <button
                                        key={option}
                                        type="button"
                                        role="option"
                                        aria-selected={selected}
                                        onClick={() =>
                                            handleLimitChange(option)
                                        }
                                        className={`
                                            flex w-full items-center
                                            justify-between rounded-lg
                                            px-3 py-2
                                            text-sm font-medium
                                            transition-colors duration-150
                                            ${
                                                selected
                                                    ? "bg-indigo-50 text-indigo-600"
                                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                            }
                                        `}
                                    >
                                        <span>{option}</span>

                                        {selected && (
                                            <svg
                                                className="h-4 w-4 text-indigo-600"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2.5}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="m5 12 4 4L19 7"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <span className="whitespace-nowrap font-medium text-gray-500">
                    por página
                </span>
            </div>
        </div>
    );
}