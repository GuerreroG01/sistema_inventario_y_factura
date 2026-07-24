"use client";

import { useEffect, useState } from "react";
import { Building2, Search, X, Loader2, Check } from "lucide-react";
import { getBusinessByName } from "@/services/businessService";
import { updateUserBusiness } from "@/services/userService";

interface Business {
    id: number;
    name: string;
}
interface Props {
    open: boolean;
    onClose: () => void;
    userId: number;
    onSuccess?: () => void;
}

export default function AssignBusinessModal({ open, onClose, userId, onSuccess }: Props) {
    const [search, setSearch] = useState("");
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [selectedBusiness, setSelectedBusiness] =
        useState<Business | null>(null);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;

        const timeout = setTimeout(async () => {
        if (!search.trim()) {
            setBusinesses([]);
            return;
        }

        try {
            setLoading(true);

            const response = await getBusinessByName(1, search);

            setBusinesses(response.businesses);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
        }, 400);

        return () => clearTimeout(timeout);
    }, [search, open]);

    const handleAssign = async () => {
        if (!selectedBusiness) return;

        try {
        setSaving(true);

        await updateUserBusiness(userId, selectedBusiness.id);

        onSuccess?.();
        onClose();
        } catch (err: any) {
        alert(err.message);
        } finally {
        setSaving(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md transition-opacity">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl transition-all">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-100 bg-blue-50/80 text-blue-600 shadow-sm">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                                Asignar negocio
                            </h2>
                            <p className="text-xs text-slate-500">
                                Busca un negocio para asociarlo al usuario.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                        aria-label="Cerrar modal"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="space-y-4 p-6">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            value={search}
                            onChange={(e) => {
                            setSearch(e.target.value);
                            setSelectedBusiness(null);
                            }}
                            placeholder="Buscar por nombre"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200/80 bg-white shadow-inner">
                    {loading && (
                        <div className="flex items-center justify-center gap-2.5 py-8 text-sm text-slate-500">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                            <span>Buscando negocios...</span>
                        </div>
                    )}

                    {!loading && businesses.length > 0 && (
                        <div className="divide-y divide-slate-100">
                            {businesses.map((business) => {
                                const isSelected = selectedBusiness?.id === business.id;
                                return (
                                <button
                                    key={business.id}
                                    type="button"
                                    onClick={() => setSelectedBusiness(business)}
                                    className={`flex w-full items-center justify-between px-4 py-3 text-left transition-all ${
                                    isSelected
                                        ? "bg-blue-50/70 text-blue-900"
                                        : "hover:bg-slate-50/80"
                                    }`}
                                >
                                    <div className="space-y-0.5">
                                    <p className={`text-sm font-medium ${isSelected ? "text-blue-950 font-semibold" : "text-slate-700"}`}>
                                        {business.name}
                                    </p>
                                    <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                                        ID #{business.id}
                                    </span>
                                    </div>

                                    {isSelected && (
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
                                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                                    </div>
                                    )}
                                </button>
                                );
                            })}
                        </div>
                    )}

                    {!loading && search && businesses.length === 0 && (
                        <div className="py-8 text-center text-sm text-slate-500">
                            <p className="font-medium text-slate-600">Sin resultados</p>
                            <p className="text-xs text-slate-400 mt-1">No encontramos negocios para "{search}"</p>
                        </div>
                    )}
                    </div>
                    {selectedBusiness && (
                        <div className="flex items-center justify-between rounded-xl border border-blue-200/60 bg-gradient-to-r from-blue-50/80 to-indigo-50/30 p-3.5">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-600/10 p-2 text-blue-600">
                                    <Building2 className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-medium uppercase tracking-wider text-blue-600">
                                        Seleccionado
                                    </p>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {selectedBusiness.name}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95"
                    >
                        Cancelar
                    </button>

                    <button
                        disabled={!selectedBusiness || saving}
                        onClick={handleAssign}
                        className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm shadow-blue-500/20 transition-all hover:bg-blue-700 hover:shadow-blue-500/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:active:scale-100"
                    >
                        {saving ? (
                            <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Asignando...
                            </span>
                        ) : (
                            "Asignar negocio"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}