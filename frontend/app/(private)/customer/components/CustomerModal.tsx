"use client";

import { Customer } from "@/types/Customer";
import { CustomerForm } from "./CustomerForm";

interface CustomerModalProps {
    open: boolean;
    customer: Customer | null;
    onClose: () => void;
    onSave: (values: any) => Promise<void>;
}

export function CustomerModal({ open, customer, onClose, onSave }: CustomerModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm transition-all">
            <div className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                {/* Cabecera de la Modal */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">
                            {customer ? "Editar cliente" : "Nuevo cliente"}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {customer ? "Modifica los datos del cliente existente." : "Completa la información para registrar un nuevo cliente."}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                        aria-label="Cerrar modal"
                    >
                        ✕
                    </button>
                </div>

                {/* Contenido / Formulario */}
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    <CustomerForm
                        customer={customer}
                        onSubmit={onSave}
                        onCancel={onClose}
                    />
                </div>
            </div>
        </div>
    );
}