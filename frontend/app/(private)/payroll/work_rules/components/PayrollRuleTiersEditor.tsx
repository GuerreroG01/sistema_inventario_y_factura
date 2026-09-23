"use client";

import { useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { PayrollRuleTierData } from "@/types/worksheet/payroll/PayrollRule";

type Props = {
    tiers: PayrollRuleTierData[];
    onChange: (tiers: PayrollRuleTierData[]) => void;
};

const createEmptyTier = (): PayrollRuleTierData => ({
    min_amount: 0,
    max_amount: null,
    fixed_amount: 0,
    percentage: 0,
});

export default function PayrollRuleTiersEditor({ tiers = [], onChange }: Props) {
    const [expandedTiers, setExpandedTiers] = useState<number[]>(
        tiers.length > 0 ? [0] : []
    );

    const handleChange = (
        index: number,
        field: keyof PayrollRuleTierData,
        value: number | null
    ) => {
        const nextTiers = [...tiers];

        nextTiers[index] = {
            ...nextTiers[index],
            [field]: value,
        };

        onChange(nextTiers);
    };

    const handleAdd = () => {
        const newIndex = tiers.length;

        onChange([
            ...tiers,
            createEmptyTier(),
        ]);

        setExpandedTiers((prev) => [
            ...prev,
            newIndex,
        ]);
    };

    const handleRemove = (index: number) => {
        onChange(
            tiers.filter(
                (_, tierIndex) =>
                    tierIndex !== index
            )
        );

        setExpandedTiers((prev) =>
            prev
                .filter((tierIndex) => tierIndex !== index)
                .map((tierIndex) =>
                    tierIndex > index
                        ? tierIndex - 1
                        : tierIndex
                )
        );
    };

    const toggleTier = (index: number) => {
        setExpandedTiers((prev) =>
            prev.includes(index)
                ? prev.filter(
                      (tierIndex) =>
                          tierIndex !== index
                  )
                : [...prev, index]
        );
    };

    return (
        <div className="col-span-full space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-slate-800">
                        Tramos progresivos
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                        Define los rangos y porcentajes que
                        aplican a cada tramo.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleAdd}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4" />
                    Agregar tramo
                </button>
            </div>
            {tiers.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
                    <p className="text-sm font-medium text-slate-600">
                        No hay tramos configurados.
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                        Agrega al menos un tramo para configurar
                        una regla progresiva.
                    </p>
                </div>
            )}
            {tiers.map((tier, index) => {
                const isExpanded =
                    expandedTiers.includes(index);
                return (
                    <div
                        key={index}
                        className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/70"
                    >
                        <div className="flex items-center justify-between px-4 py-3">
                            <button
                                type="button"
                                onClick={() =>
                                    toggleTier(index)
                                }
                                className="flex min-w-0 flex-1 items-center gap-3 text-left"
                                aria-expanded={isExpanded}
                            >
                                <ChevronDown
                                    className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${
                                        isExpanded
                                            ? "rotate-0"
                                            : "-rotate-90"
                                    }`}
                                />
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-700">
                                        Tramo {index + 1}
                                    </p>

                                    {!isExpanded && (
                                        <p className="mt-0.5 truncate text-xs text-slate-400">
                                            {tier.min_amount ?? 0}
                                            {" — "}
                                            {tier.max_amount ??
                                                "Sin límite"}
                                        </p>
                                    )}
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    handleRemove(index)
                                }
                                className="ml-3 rounded-lg p-1.5 text-red-500 transition hover:bg-red-50"
                                aria-label={`Eliminar tramo ${index + 1}`}
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        {isExpanded && (
                            <div className="border-t border-slate-200 px-4 pb-4 pt-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <TierNumberInput
                                        label="Desde"
                                        value={
                                            tier.min_amount
                                        }
                                        onChange={(value) =>
                                            handleChange(
                                                index,
                                                "min_amount",
                                                value
                                            )
                                        }
                                    />
                                    <TierNumberInput
                                        label="Hasta"
                                        value={
                                            tier.max_amount ??
                                            null
                                        }
                                        onChange={(value) =>
                                            handleChange(
                                                index,
                                                "max_amount",
                                                value
                                            )
                                        }
                                        placeholder="Sin límite"
                                    />
                                    <TierNumberInput
                                        label="Monto fijo"
                                        value={
                                            tier.fixed_amount ??
                                            0
                                        }
                                        onChange={(value) =>
                                            handleChange(
                                                index,
                                                "fixed_amount",
                                                value
                                            )
                                        }
                                    />
                                    <TierNumberInput
                                        label="Porcentaje"
                                        value={
                                            tier.percentage ??
                                            0
                                        }
                                        onChange={(value) =>
                                            handleChange(
                                                index,
                                                "percentage",
                                                value
                                            )
                                        }
                                        max={100}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function TierNumberInput({ label, value, onChange, placeholder, max }: {
    label: string;
    value: number | null;
    onChange: (value: number | null) => void;
    placeholder?: string;
    max?: number;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                {label}
            </label>
            <input
                type="number"
                min="0"
                max={max}
                step="0.01"
                value={value ?? ""}
                placeholder={placeholder}
                onChange={(event) => {
                    const rawValue =
                        event.target.value;
                    onChange(
                        rawValue === ""
                            ? null
                            : Number(rawValue)
                    );
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />
        </div>
    );
}