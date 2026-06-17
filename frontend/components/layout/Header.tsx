"use client";

import { useState } from "react";

type NavItem = {
    label: string;
    href: string;
};

type ActionItem = {
    label: string;
    onClick?: () => void;
    href?: string;
    variant?: "primary" | "secondary";
};

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

    const navItems: NavItem[] = [
        { label: "Productos", href: "/products" },
        { label: "Ventas", href: "/sales" },
        { label: "Reportes", href: "#" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-lg shadow-md border-b border-slate-200 transition-all">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl transform transition-all hover:scale-105">
                        📦
                    </div>

                    <div>
                        <h1 className="text-lg font-extrabold text-slate-900 sm:text-xl tracking-wide">
                            InventarioPro
                        </h1>
                        <p className="hidden text-xs text-slate-500 sm:block">
                            Gestión inteligente de inventario
                        </p>
                    </div>
                </div>

                {/* Desktop nav */}
                <nav className="hidden items-center gap-8 md:flex">
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className="relative font-medium text-slate-600 transition-all hover:text-blue-600 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:scale-x-0 after:bg-blue-500 after:transition-transform hover:after:scale-x-100"
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>

                {/* Mobile menu button */}
                <button
                    className="rounded-xl p-2 text-slate-700 md:hidden transition hover:bg-slate-100"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    {menuOpen ? "✕" : "☰"}
                </button>
            </div>

            {/* Mobile menu */}
            <div
                className={`md:hidden overflow-hidden border-t border-slate-200 bg-white transition-all duration-300 ${
                    menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <nav className="flex flex-col gap-4 px-6 py-5">
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className="font-medium text-slate-600 hover:text-blue-600 transition-colors"
                            onClick={() => setMenuOpen(false)}
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>
            </div>
        </header>
    );
}