"use client";

import { useState } from "react";

interface PaginationProps {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    loading?: boolean;
    itemLabel?: string;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
}

export default function Pagination({
    total,
    page,
    limit,
    totalPages,
    loading = false,
    itemLabel = "registros",
    onPageChange,
    onLimitChange,
}: PaginationProps) {
    const [showLimitOptions, setShowLimitOptions] = useState(false);

    if (total === 0) return null;

    const goToPage = (nextPage: number) => {
        if (
            loading ||
            nextPage === page ||
            nextPage < 1 ||
            nextPage > totalPages
        ) {
            return;
        }

        onPageChange(nextPage);
    };

    const getPages = (): (number | "...")[] => {
        if (totalPages <= 7) {
            return Array.from(
                { length: totalPages },
                (_, index) => index + 1
            );
        }

        const pages: (number | "...")[] = [1];

        if (page > 4) {
            pages.push("...");
        }

        const start = Math.max(2, page - 1);
        const end = Math.min(totalPages - 1, page + 1);

        for (let current = start; current <= end; current++) {
            pages.push(current);
        }

        if (page < totalPages - 3) {
            pages.push("...");
        }

        pages.push(totalPages);

        return pages;
    };

    const firstItem = (page - 1) * limit + 1;
    const lastItem = Math.min(page * limit, total);

    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white px-6 py-4 shadow-sm shrink-0 md:flex-row md:items-center md:justify-between">
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
                {itemLabel}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                    type="button"
                    disabled={page <= 1 || loading}
                    onClick={() => goToPage(page - 1)}
                    className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 shadow transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Anterior
                </button>

                {getPages().map((currentPage, index) =>
                    currentPage === "..." ? (
                        <span
                            key={`ellipsis-${index}`}
                            className="px-2 py-2 text-gray-500"
                        >
                            ...
                        </span>
                    ) : (
                        <button
                            key={currentPage}
                            type="button"
                            disabled={loading}
                            onClick={() => goToPage(currentPage)}
                            aria-current={
                                currentPage === page ? "page" : undefined
                            }
                            className={`rounded-lg px-4 py-2 font-semibold shadow transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                currentPage === page
                                    ? "scale-105 bg-indigo-600 text-white shadow-lg"
                                    : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            {currentPage}
                        </button>
                    )
                )}

                <button
                    type="button"
                    disabled={page >= totalPages || loading}
                    onClick={() => goToPage(page + 1)}
                    className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 shadow transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Siguiente
                </button>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <span className="whitespace-nowrap font-medium text-gray-500">
                    Mostrar
                </span>

                <div className="relative">
                    <button
                        type="button"
                        aria-haspopup="listbox"
                        aria-expanded={showLimitOptions}
                        disabled={loading}
                        onClick={() =>
                            setShowLimitOptions((previous) => !previous)
                        }
                        className={`flex h-9 min-w-[82px] items-center justify-between gap-2 rounded-lg border bg-white px-3 text-sm font-semibold text-gray-700 shadow-sm outline-none transition ${
                            showLimitOptions
                                ? "border-indigo-500 ring-4 ring-indigo-100"
                                : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30"
                        } disabled:opacity-50`}
                    >
                        <span>{limit}</span>

                        <svg
                            className={`h-4 w-4 text-gray-400 transition-transform ${
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
                        <>
                            <button
                                type="button"
                                aria-label="Cerrar opciones"
                                className="fixed inset-0 z-40 cursor-default"
                                onClick={() => setShowLimitOptions(false)}
                            />

                            <div
                                role="listbox"
                                aria-label="Registros por página"
                                className="absolute bottom-full left-0 z-50 mb-2 w-full min-w-[82px] overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl shadow-gray-200/60 ring-1 ring-black/5"
                            >
                                {[10, 25, 50].map((option) => {
                                    const selected = limit === option;

                                    return (
                                        <button
                                            key={option}
                                            type="button"
                                            role="option"
                                            aria-selected={selected}
                                            onClick={() => {
                                                setShowLimitOptions(false);

                                                if (option !== limit) {
                                                    onLimitChange(option);
                                                }
                                            }}
                                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                                selected
                                                    ? "bg-indigo-50 text-indigo-600"
                                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                            }`}
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
                        </>
                    )}
                </div>

                <span className="whitespace-nowrap font-medium text-gray-500">
                    por página
                </span>
            </div>
        </div>
    );
}