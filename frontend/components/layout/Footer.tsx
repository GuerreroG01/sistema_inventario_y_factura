import { Layers } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t border-slate-200/40 bg-white/70 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3 group">
                    <div
                        className="
                            flex h-9 w-9 items-center justify-center
                            rounded-xl
                            bg-gradient-to-br from-indigo-500 via-blue-600 to-blue-700
                            text-white
                            shadow-md shadow-blue-500/10
                            transition-all duration-300
                            group-hover:scale-[1.04]
                        "
                    >
                        <Layers className="h-5 w-5 stroke-[2.2]" />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-sm font-extrabold tracking-tight text-slate-900">
                            Inventarium
                            <span className="font-black text-blue-600">
                                {" "}System
                            </span>
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Inventario y Facturación
                        </p>
                    </div>
                </div>

                <p className="text-xs font-medium text-slate-400">
                    © {new Date().getFullYear()}{" "}
                    <span className="text-slate-600">
                        Inventarium System
                    </span>
                </p>
            </div>
        </footer>
    );
}