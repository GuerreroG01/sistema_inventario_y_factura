"use client";

import MobileHeader from "./MobileHeader";
import { Layers } from "lucide-react";

type NavItem = {
    label: string;
    href: string;
};

export default function Header() {
    const navItems: NavItem[] = [
        { label: "Productos", href: "/products" },
        { label: "Ventas", href: "/sales" },
        { label: "Gastos", href: "/expense" },
        //{ label: "Reportes", href: "#" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/40 bg-white/70 backdrop-blur-xl transition-all duration-500 hover:bg-white/80">
            <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                
                <a 
                    href="/" 
                    className="flex items-center gap-3 group cursor-pointer select-none"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/10 transition-all duration-300 group-hover:scale-[1.04] group-hover:shadow-lg group-hover:shadow-blue-500/20 active:scale-95">
                        <Layers className="h-5 w-5 stroke-[2.2] transition-transform duration-500 group-hover:rotate-[6deg]" />
                    </div>
                    
                    <div className="flex flex-col">
                        <h1 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg transition-colors duration-300 group-hover:text-blue-600">
                            Inventarium<span className="text-blue-600 font-black"> System</span>
                        </h1>
                        <p className="hidden text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:block leading-none mt-0.5 transition-colors duration-300 group-hover:text-slate-600">
                            Inventario y Facturación
                        </p>
                    </div>
                </a>

                <nav className="hidden items-center gap-1 bg-slate-200/40 p-1 rounded-full border border-slate-200/20 md:flex shadow-inner">
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className="
                                group
                                relative
                                px-4
                                py-1.5
                                text-sm
                                font-semibold
                                text-slate-600 
                                rounded-full
                                transition-all 
                                duration-300
                                hover:text-blue-600
                                active:scale-95
                                overflow-hidden
                            "
                        >
                            <span className="relative z-10 block transition-transform duration-300 group-hover:-translate-y-[2px]">
                                {item.label}
                            </span>
                            <span className="absolute inset-x-1 bottom-1 top-1 z-0 rounded-full bg-white opacity-0 shadow-sm transition-all duration-300 cubic-bezier(0.25, 1, 0.5, 1) translate-y-full group-hover:translate-y-0 group-hover:opacity-100" />
                            <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 scale-0 rounded-full bg-blue-600 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />
                        </a>
                    ))}
                </nav>

                <div className="flex items-center md:hidden">
                    <MobileHeader navItems={navItems} />
                </div>

            </div>
        </header>
    );
}