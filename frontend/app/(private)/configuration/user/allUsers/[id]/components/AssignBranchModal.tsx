"use client";

import { useEffect, useState } from "react";
import { Search, X, Loader2, Check, MapPin } from "lucide-react";
import { Branch } from "@/types/Branch";
import { getBranchesByName } from "@/services/branchService";
import { updateUserBranch } from "@/services/userService";

interface Props {
    open: boolean;
    onClose: () => void;
    userId: number;
    businessId: number;
    onSuccess?: () => void;
}

export default function AssignBranchModal({
    open, onClose, userId, businessId, onSuccess
}: Props) {
    const [search, setSearch] = useState("");
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;

        const timeout = setTimeout(async () => {
            if (!search.trim()) {
                setBranches([]);
                return;
            }

            try {
                setLoading(true);

                const response = await getBranchesByName(
                    businessId,
                    {
                        name: search,
                        page: 1,
                    }
                );
                setBranches(response.branches);
            } catch (err) {
                console.error("Error buscando sucursales:", err);
                setBranches([]);
            } finally {
                setLoading(false);
            }
        }, 400);

        return () => clearTimeout(timeout);
    }, [search, open, businessId]);

    const handleAssign = async () => {
        if (!selectedBranch) return;

        try {
            setSaving(true);

            await updateUserBranch(
                userId,
                businessId,
                selectedBranch.id
            );

            onSuccess?.();
            onClose();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        if (saving) return;

        setSearch("");
        setBranches([]);
        setSelectedBranch(null);
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md transition-opacity">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl transition-all">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50/80 text-emerald-600 shadow-sm">
                            <MapPin className="h-6 w-6" />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                                Asignar sucursal
                            </h2>

                            <p className="text-xs text-slate-500">
                                Busca una sucursal para asociarla al usuario.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleClose}
                        disabled={saving}
                        className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
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
                                setSelectedBranch(null);
                            }}
                            placeholder="Buscar sucursal por nombre"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200/80 bg-white shadow-inner">
                        {loading && (
                            <div className="flex items-center justify-center gap-2.5 py-8 text-sm text-slate-500">
                                <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                                <span>Buscando sucursales...</span>
                            </div>
                        )}
                        {!loading && branches.length > 0 && (
                            <div className="divide-y divide-slate-100">
                                {branches.map((branch) => {
                                    const isSelected =
                                        selectedBranch?.id === branch.id;

                                    return (
                                        <button
                                            key={branch.id}
                                            type="button"
                                            onClick={() =>
                                                setSelectedBranch(branch)
                                            }
                                            className={`flex w-full items-center justify-between px-4 py-3 text-left transition-all ${
                                                isSelected
                                                    ? "bg-emerald-50/70 text-emerald-900"
                                                    : "hover:bg-slate-50/80"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">

                                                <div
                                                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                                                        isSelected
                                                            ? "bg-emerald-600/10 text-emerald-600"
                                                            : "bg-slate-100 text-slate-500"
                                                    }`}
                                                >
                                                    <MapPin className="h-4 w-4" />
                                                </div>

                                                <div className="space-y-0.5">
                                                    <p
                                                        className={`text-sm ${
                                                            isSelected
                                                                ? "font-semibold text-emerald-950"
                                                                : "font-medium text-slate-700"
                                                        }`}
                                                    >
                                                        {branch.name}
                                                    </p>

                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                                                            ID #{branch.id}
                                                        </span>

                                                        {branch.city && (
                                                            <span className="text-xs text-slate-400">
                                                                {branch.city}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {isSelected && (
                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
                                                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                        {!loading &&
                            search &&
                            branches.length === 0 && (
                                <div className="py-8 text-center text-sm text-slate-500">
                                    <p className="font-medium text-slate-600">
                                        Sin resultados
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        No encontramos sucursales para "{search}"
                                    </p>
                                </div>
                            )}
                        {!loading && !search && (
                            <div className="py-8 text-center text-sm text-slate-400">
                                <MapPin className="mx-auto mb-2 h-5 w-5 text-slate-300" />

                                <p>
                                    Escribe el nombre de una sucursal para buscar.
                                </p>
                            </div>
                        )}
                    </div>
                    {selectedBranch && (
                        <div className="flex items-center justify-between rounded-xl border border-emerald-200/60 bg-gradient-to-r from-emerald-50/80 to-teal-50/30 p-3.5">
                            <div className="flex items-center gap-3">

                                <div className="rounded-lg bg-emerald-600/10 p-2 text-emerald-600">
                                    <MapPin className="h-4 w-4" />
                                </div>

                                <div>
                                    <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-600">
                                        Seleccionada
                                    </p>

                                    <p className="text-sm font-semibold text-slate-900">
                                        {selectedBranch.name}
                                    </p>

                                    {selectedBranch.city && (
                                        <p className="text-xs text-slate-500">
                                            {selectedBranch.city}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                    <button
                        onClick={handleClose}
                        disabled={saving}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        disabled={!selectedBranch || saving}
                        onClick={handleAssign}
                        className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2 text-sm font-medium text-white shadow-sm shadow-emerald-500/20 transition-all hover:bg-emerald-700 hover:shadow-emerald-500/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:active:scale-100"
                    >
                        {saving ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Asignando...
                            </span>
                        ) : (
                            "Asignar sucursal"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}