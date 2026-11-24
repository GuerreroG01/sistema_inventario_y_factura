import api from "../../api";

import {
    BenefitTransaction, BenefitBalance, CreateBenefitTransactionData, AdjustBenefitTransactionData,
    ReverseBenefitTransactionData, BenefitTransactionFilters, BenefitTransactionPagination,
    BenefitTransactionResult, CreateBenefitPaymentData
} from "@/types/worksheet/benefit/EmployeeBenefitTransaction";

const BASE = "/benefit-transaction";

const getErrorMessage = (error: any, fallback: string): string => {
    return (
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        fallback
    );
};

export async function accrueBenefit(
    employeeBenefitId: number,
    payload: CreateBenefitTransactionData
): Promise<BenefitTransactionResult> {
    try {
        const { data } = await api.post<{
            success: boolean;
            data: BenefitTransactionResult;
        }>(`${BASE}/${employeeBenefitId}/accrue`, payload);

        return data.data;
    } catch (error: any) {
        throw new Error(
            getErrorMessage(error, "Error al acumular el beneficio")
        );
    }
}

export async function consumeBenefit(
    employeeBenefitId: number,
    payload: CreateBenefitTransactionData
): Promise<BenefitTransactionResult> {
    try {
        const { data } = await api.post<{
            success: boolean;
            data: BenefitTransactionResult;
        }>(`${BASE}/${employeeBenefitId}/consume`, payload);

        return data.data;
    } catch (error: any) {
        throw new Error(
            getErrorMessage(error, "Error al consumir el beneficio")
        );
    }
}

export async function payBenefit(
    employeeBenefitId: number,
    payload: CreateBenefitPaymentData
): Promise<BenefitTransactionResult> {
    try {
        const { data } = await api.post<{
            success: boolean;
            data: BenefitTransactionResult;
        }>(`${BASE}/${employeeBenefitId}/pay`, payload);

        return data.data;
    } catch (error: any) {
        throw new Error(
            getErrorMessage(error, "Error al registrar el pago del beneficio")
        );
    }
}

export async function adjustBenefit(
    employeeBenefitId: number,
    payload: AdjustBenefitTransactionData
): Promise<BenefitTransactionResult> {
    try {
        const { data } = await api.post<{
            success: boolean;
            data: BenefitTransactionResult;
        }>(`${BASE}/${employeeBenefitId}/adjust`, payload);

        return data.data;
    } catch (error: any) {
        throw new Error(
            getErrorMessage(error, "Error al ajustar el saldo del beneficio")
        );
    }
}

export async function reverseBenefitTransaction(
    transactionId: number,
    payload: ReverseBenefitTransactionData = {}
): Promise<BenefitTransactionResult> {
    try {
        const { data } = await api.post<{
            success: boolean;
            data: BenefitTransactionResult;
        }>(`${BASE}/transactions/${transactionId}/reverse`, payload);

        return data.data;
    } catch (error: any) {
        throw new Error(
            getErrorMessage(error, "Error al revertir la transacción")
        );
    }
}

export async function getBenefitBalance(
    employeeBenefitId: number,
    employeeId?: number | null
): Promise<BenefitBalance> {
    try {
        const { data } = await api.get<{
            success: boolean;
            data: BenefitBalance;
        }>(`${BASE}/${employeeBenefitId}/balance`, {
            params: employeeId ? { employeeId } : undefined,
        });

        return data.data;
    } catch (error: any) {
        throw new Error(
            getErrorMessage(error, "Error al obtener el saldo del beneficio")
        );
    }
}

export async function getBenefitTransactions(
    employeeBenefitId: number,
    filters?: BenefitTransactionFilters
): Promise<BenefitTransactionPagination> {
    try {

        const url = `${BASE}/${employeeBenefitId}/transactions`;

        const { data } = await api.get<{
            success: boolean;
            data: BenefitTransaction[];
            pagination: BenefitTransactionPagination["pagination"];
        }>(url, {
            params: filters,
        });

        const result: BenefitTransactionPagination = {
            data: data.data,
            pagination: data.pagination,
        };
        console.log("El resultado es: ", result);

        return result;

    } catch (error: any) {
        throw new Error(
            getErrorMessage(
                error,
                "Error al obtener el historial de transacciones"
            )
        );
    }
}

/*Falta crear un subcomponente que muestre las transacciones especificas de ese empleado especifico
y usar las funciones accrueBenefit, consumeBenefit y payBenefit, y mostrar los movimientos de ese beneficio
ya sea acumulaciones o consumos del beneficio, hay que ver si hacerlo una página completa o un modal.*/