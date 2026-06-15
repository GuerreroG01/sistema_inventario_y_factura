import React from "react";

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting?: boolean;
    title?: string;
    description?: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    isDeleting = false,
    title = "¿Confirmar eliminación?",
    description = "Esta acción no se puede deshacer. Este elemento será eliminado permanentemente de la base de datos.",
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto">

            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={!isDeleting ? onClose : undefined}
            />

            <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-2xl transition-all border border-slate-100">
                
                <button
                    type="button"
                    disabled={isDeleting}
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1.5 hover:bg-slate-50 transition-colors disabled:opacity-30"
                    aria-label="Cerrar modal"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="sm:flex sm:items-start gap-4">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-50 sm:mx-0 sm:h-11 sm:w-11 ring-4 ring-red-50/50">
                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    </div>

                    <div className="mt-4 text-center sm:mt-0 sm:text-left">
                        <h3 className="text-xl font-bold leading-6 text-slate-900 tracking-tight">
                            {title}
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-slate-500 leading-relaxed">
                                {description}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end border-t border-slate-100 pt-4">
                    <button
                        type="button"
                        disabled={isDeleting}
                        onClick={onClose}
                        className="w-full inline-flex justify-center items-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 transition-all sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancelar
                    </button>
                    
                    <button
                        type="button"
                        disabled={isDeleting}
                        onClick={onConfirm}
                        className="w-full inline-flex justify-center items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 active:bg-red-800 transition-all shadow-sm shadow-red-600/10 sm:w-auto disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                        {isDeleting ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Eliminando...
                            </>
                        ) : (
                            "Sí, eliminar"
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};