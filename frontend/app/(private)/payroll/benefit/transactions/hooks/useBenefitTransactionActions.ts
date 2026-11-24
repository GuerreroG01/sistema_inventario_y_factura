"use client";

import { useState, useCallback } from "react";

import {
    accrueBenefit,
    consumeBenefit,
    payBenefit,
    adjustBenefit,
    reverseBenefitTransaction,
} from "@/services/Worksheet/Benefit/BenefitTransactionService";

import {
    BenefitTransactionResult,
    CreateBenefitTransactionData,
    AdjustBenefitTransactionData,
    CreateBenefitPaymentData,
    ReverseBenefitTransactionData,
} from "@/types/worksheet/benefit/EmployeeBenefitTransaction";

type TransactionAction =
    | "ACCRUAL"
    | "USAGE"
    | "PAYMENT"
    | "ADJUSTMENT";

interface Props {
    employeeBenefitId: number;
}

export function useBenefitTransactionActions({ employeeBenefitId }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Ejecutar operaciones de beneficios
    const executeAction = useCallback(
        async (
            type: TransactionAction,
            payload:
                | CreateBenefitTransactionData
                | CreateBenefitPaymentData
                | AdjustBenefitTransactionData
        ): Promise<BenefitTransactionResult> => {
            if (loading) {
                throw new Error("Ya existe una operación en proceso");
            }

            setLoading(true);
            setError(null);

            try {
                let result: BenefitTransactionResult;

                switch (type) {
                    case "ACCRUAL":
                        result = await accrueBenefit(
                            employeeBenefitId,
                            payload as CreateBenefitTransactionData
                        );
                        break;

                    case "USAGE":
                        result = await consumeBenefit(
                            employeeBenefitId,
                            payload as CreateBenefitTransactionData
                        );
                        break;

                    case "PAYMENT":
                        result = await payBenefit(
                            employeeBenefitId,
                            payload as CreateBenefitPaymentData
                        );
                        break;

                    case "ADJUSTMENT":
                        result = await adjustBenefit(
                            employeeBenefitId,
                            payload as AdjustBenefitTransactionData
                        );
                        break;

                    default:
                        throw new Error("Tipo de movimiento no válido");
                }

                return result;
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "Error al ejecutar la operación";

                setError(message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [employeeBenefitId, loading]
    );

    // Revertir una transacción existente
    const reverseTransaction = useCallback(
        async (
            transactionId: number,
            payload: ReverseBenefitTransactionData = {}
        ): Promise<BenefitTransactionResult> => {
            if (loading) {
                throw new Error("Ya existe una operación en proceso");
            }

            setLoading(true);
            setError(null);

            try {
                const result = await reverseBenefitTransaction(
                    transactionId,
                    payload
                );

                return result;
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "Error al revertir la transacción";

                setError(message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [loading]
    );

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        executeAction,
        reverseTransaction,
        loading,
        error,
        clearError,
    };
}