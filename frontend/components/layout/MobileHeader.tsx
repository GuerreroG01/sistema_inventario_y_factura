"use client";

import { useState } from "react";
import { Menu, X, ChevronRight, UserRoundPlus, LogOut } from "lucide-react";
import { User } from "@/types/Auth";

type NavItem = {
    label: string;
    href: string;
};

type Props = {
    navItems: NavItem[];
    user: User | null;
    logout: () => void;
};

export default function MobileHeader({ navItems, user, logout }: Props) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <>
            <button
                className="
                    relative
                    z-50
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl 
                    text-slate-700 
                    transition-all
                    duration-300
                    hover:bg-slate-100
                    active:scale-90
                "
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
            >
                <div className="relative h-6 w-6">
                    <span
                        className={`absolute inset-0 transform transition-transform duration-300 ${
                            menuOpen ? "rotate-0 scale-100" : "rotate-90 scale-0"
                        }`}
                    >
                        <X className="h-6 w-6 stroke-[2]" />
                    </span>
                    <span
                        className={`absolute inset-0 transform transition-transform duration-300 ${
                            menuOpen ? "-rotate-90 scale-0" : "rotate-0 scale-100"
                        }`}
                    >
                        <Menu className="h-6 w-6 stroke-[2]" />
                    </span>
                </div>
            </button>

            <div
                className={`
                    absolute
                    left-0
                    top-full
                    z-40
                    w-full
                    overflow-hidden
                    border-b
                    border-slate-200/60
                    bg-white/95
                    backdrop-blur-lg
                    shadow-xl
                    shadow-slate-200/30
                    transition-all
                    duration-300
                    ease-in-out
                    md:hidden
                    ${
                        menuOpen
                            ? "max-h-80 opacity-100 translate-y-0"
                            : "max-h-0 opacity-0 -translate-y-2 pointer-events-none"
                    }
                `}
            >
                <nav className="flex flex-col gap-1.5 px-4 py-4">
                    {navItems.map((item, index) => (
                        <a
                            key={item.label}
                            href={item.href}
                            style={{ transitionDelay: menuOpen ? `${index * 40}ms` : "0ms" }}
                            className={`
                                group
                                relative
                                flex
                                items-center
                                justify-between
                                w-full
                                px-4
                                py-3.5
                                text-sm
                                font-semibold
                                text-slate-700
                                rounded-xl
                                transition-all
                                duration-300
                                hover:text-blue-600
                                active:scale-[0.99]
                                transform
                                overflow-hidden
                                ${menuOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}
                            `}
                            onClick={() => setMenuOpen(false)}
                        >
                            <span className="absolute inset-0 z-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            <span className="relative z-10 transform transition-transform duration-300 group-hover:translate-x-1.5">
                                {item.label}
                            </span>
                            <ChevronRight className="relative z-10 h-4 w-4 text-slate-400 transform transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1) group-hover:translate-x-1 group-hover:text-blue-500" />
                        </a>
                    ))}
                    {user?.Rol?.toLowerCase() === "admin" && (
                    <a
                        href="/auth/register"
                        onClick={() => setMenuOpen(false)}
                        className={`
                            group
                            relative
                            flex
                            items-center
                            justify-between
                            w-full
                            px-4
                            py-3.5
                            text-sm
                            font-semibold
                            text-slate-700
                            rounded-xl
                            transition-all
                            duration-300
                            hover:text-blue-600
                            active:scale-[0.99]
                            overflow-hidden
                            ${menuOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}
                        `}
                    >
                        <span className="absolute inset-0 z-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                        <div className="relative z-10 flex items-center gap-3 transition-transform duration-300 group-hover:translate-x-1.5">
                            <UserRoundPlus className="h-4 w-4" />
                            <span>Registrar usuario</span>
                        </div>

                        <ChevronRight className="relative z-10 h-4 w-4 text-slate-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-blue-500" />
                    </a>
                )}

                <button
                    onClick={() => {
                        setMenuOpen(false);
                        logout();
                    }}
                    className={`
                        group
                        relative
                        flex
                        items-center
                        justify-between
                        w-full
                        px-4
                        py-3.5
                        text-sm
                        font-semibold
                        text-slate-700
                        rounded-xl
                        transition-all
                        duration-300
                        hover:text-red-600
                        active:scale-[0.99]
                        overflow-hidden
                        ${menuOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}
                    `}
                >
                    <span className="absolute inset-0 z-0 bg-gradient-to-r from-red-50/60 to-rose-50/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <div className="relative z-10 flex items-center gap-3 transition-transform duration-300 group-hover:translate-x-1.5">
                        <LogOut className="h-4 w-4" />
                        <span>Cerrar sesión</span>
                    </div>

                    <ChevronRight className="relative z-10 h-4 w-4 text-slate-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-red-500" />
                </button>
                </nav>
            </div>
        </>
    );
}