"use client";

import { useState } from "react";
import { PlusCircle, MinusCircle, Wallet, SlidersHorizontal } from "lucide-react";
import { 
    BenefitTransactionType, CreateBenefitTransactionData, CreateBenefitPaymentData, AdjustBenefitTransactionData,
} from "@/types/worksheet/benefit/EmployeeBenefitTransaction";
import { BenefitUnit, BenefitType } from "@/types/worksheet/benefit/BenefitRule";
import { BenefitTransactionModal } from "./BenefitTransactionModal";

type ActionType = Exclude<BenefitTransactionType, "REVERSAL">;
type TransactionPayload =
  | CreateBenefitTransactionData
  | CreateBenefitPaymentData
  | AdjustBenefitTransactionData;

interface Props {
  unit: BenefitUnit;
  benefitType: BenefitType;
  loading: boolean;
  error?: string | null;
  onSubmit: (type: ActionType, payload: TransactionPayload) => Promise<void>;
  onClearError?: () => void;
}

const ACTIONS: {
    type: ActionType;
    label: string;
    description: string;
    icon: typeof PlusCircle;
    className: string;
    iconClassName: string;
}[] = [
    {
        type: "ACCRUAL",
        label: "Acumular",
        description: "Aumentar saldo",
        icon: PlusCircle,
        className:
        "border-emerald-200/80 bg-emerald-50/80 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-emerald-100/50",
        iconClassName: "text-emerald-600",
    },
    {
        type: "USAGE",
        label: "Consumir",
        description: "Descontar saldo",
        icon: MinusCircle,
        className:
        "border-orange-200/80 bg-orange-50/80 text-orange-700 hover:bg-orange-100 hover:border-orange-300 hover:shadow-orange-100/50",
        iconClassName: "text-orange-600",
    },
    {
        type: "PAYMENT",
        label: "Registrar pago",
        description: "Liquidar saldo pendiente",
        icon: Wallet,
        className:
        "border-sky-200/80 bg-sky-50/80 text-sky-700 hover:bg-sky-100 hover:border-sky-300 hover:shadow-sky-100/50",
        iconClassName: "text-sky-600",
    },
    {
        type: "ADJUSTMENT",
        label: "Ajustar saldo",
        description: "Corregir saldo",
        icon: SlidersHorizontal,
        className:
        "border-violet-200/80 bg-violet-50/80 text-violet-700 hover:bg-violet-100 hover:border-violet-300 hover:shadow-violet-100/50",
        iconClassName: "text-violet-600",
    }
];

export function BenefitTransactionActions({ unit, benefitType, loading, error, onSubmit, onClearError }: Props) {
    const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);

    const handleOpen = (type: ActionType) => {
        if (loading) return;
        onClearError?.();
        setSelectedAction(type);
    };

    const handleClose = () => {
        if (loading) return;
        setSelectedAction(null);
        onClearError?.();
    };

    const handleSubmit = async (payload: TransactionPayload) => {
        if (!selectedAction || loading) return;

        try {
        await onSubmit(selectedAction, payload);
        setSelectedAction(null);
        } catch {
        }
    };

    const visibleActions = ACTIONS.filter(
        (action) => action.type !== "PAYMENT" || unit === "CURRENCY"
    );

    return (
        <>
            <div className="flex flex-wrap items-center gap-2.5">
                {visibleActions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={action.type}
                            type="button"
                            onClick={() => handleOpen(action.type)}
                            disabled={loading}
                            title={action.description}
                            className={`
                                group relative flex items-center gap-2 rounded-xl border px-3.5 py-2.5
                                text-xs font-semibold tracking-tight
                                shadow-sm transition-all duration-200
                                hover:shadow-md hover:-translate-y-0.5
                                active:translate-y-0 active:shadow-sm
                                disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm
                                ${action.className}
                            `}
                        >
                            <Icon
                                className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${action.iconClassName}`}
                            />
                            <span>{action.label}</span>
                        </button>
                    );
                })}
            </div>

            {selectedAction && (
                <BenefitTransactionModal
                    type={selectedAction}
                    unit={unit}
                    benefitType={benefitType}
                    loading={loading}
                    error={error}
                    onClose={handleClose}
                    onSubmit={handleSubmit}
                />
            )}
        </>
    );
}