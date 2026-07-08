"use client";

interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({
    page,
    totalPages,
    onPageChange,
}: PaginationProps) {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    const goToPage = (p: number) => {
        if (p === page) return;
        onPageChange(p);
    };

    return (
        <div className="flex justify-center mt-6 gap-2 flex-wrap">
        <button
            type="button"
            disabled={page === 1}
            onClick={() => goToPage(page - 1)}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold shadow hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
            Anterior
        </button>

        {pages.map((p) => (
            <button
            key={p}
            type="button"
            onClick={() => goToPage(p)}
            className={`px-4 py-2 rounded-lg font-semibold shadow transition ${
                p === page
                ? "bg-indigo-600 text-white shadow-lg scale-105"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
            >
            {p}
            </button>
        ))}

        <button
            type="button"
            disabled={page === totalPages}
            onClick={() => goToPage(page + 1)}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold shadow hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
            Siguiente
        </button>
        </div>
    );
}