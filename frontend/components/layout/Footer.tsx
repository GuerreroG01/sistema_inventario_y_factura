export default function Footer() {
    return (
        <footer className="mt-20 border-t border-slate-200 bg-white">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-center sm:flex-row sm:px-6 lg:px-8">
                <div>
                <p className="font-semibold text-slate-800">
                    📦 InventarioPro
                </p>

                <p className="text-sm text-slate-500">
                    Sistema moderno de gestión de inventario
                </p>
                </div>

                <p className="text-sm text-slate-400">
                © {new Date().getFullYear()} Todos los derechos reservados.
                </p>
            </div>
        </footer>
    );
}