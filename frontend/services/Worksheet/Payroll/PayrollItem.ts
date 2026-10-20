import api from "../../api";
import {  PayrollItem, CreatePayrollItemData, UpdatePayrollItemData } from "@/types/worksheet/payroll/PayrollItem";

export async function getPayrollItems(
    periodId: number, 
    payrollEmployeeId: number
): Promise<PayrollItem[]> {
    try {
        const { data } = await api.get<{ message: string; data: PayrollItem[] }>(
            `/payroll-items/${periodId}/employees/${payrollEmployeeId}/items`
        );
        return data.data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            "Error al obtener los conceptos de nómina"
        );
    }
}

export async function getPayrollItemById(
    periodId: number, 
    payrollEmployeeId: number, 
    id: number
): Promise<PayrollItem> {
    try {
        const { data } = await api.get<{ message: string; data: PayrollItem }>(
            `/payroll-items/${periodId}/employees/${payrollEmployeeId}/items/${id}`
        );

        return data.data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            "Error al obtener el concepto de nómina"
        );
    }
}

export async function createPayrollItem(
    periodId: number, 
    payrollEmployeeId: number, 
    itemData: CreatePayrollItemData
): Promise<PayrollItem> {
    try {
        const { data } = await api.post<{
            message: string;
            data: PayrollItem;
        }>(
            `/payroll-items/${periodId}/employees/${payrollEmployeeId}/items`,
            itemData
        );

        return data.data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            "Error al crear el concepto de nómina"
        );
    }
}

export async function updatePayrollItem(
    periodId: number, 
    payrollEmployeeId: number, 
    id: number, 
    itemData: UpdatePayrollItemData
): Promise<PayrollItem> {
    try {
        const { data } = await api.patch<{
            message: string;
            data: PayrollItem;
        }>(
            `/payroll-items/${periodId}/employees/${payrollEmployeeId}/items/${id}`,
            itemData
        );

        return data.data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            "Error al actualizar el concepto de nómina"
        );
    }
}

export async function deletePayrollItem(
    periodId: number, 
    payrollEmployeeId: number, 
    id: number
): Promise<any> {
    try {
        const { data } = await api.delete(
            `/payroll-items/${periodId}/employees/${payrollEmployeeId}/items/${id}`
        );

        return data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message ||
            error.message ||
            "Error al eliminar el concepto de nómina"
        );
    }
}