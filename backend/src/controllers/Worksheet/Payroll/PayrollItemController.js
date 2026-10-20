import {
    createPayrollItem, getPayrollItems, getPayrollItemById, updatePayrollItem,
    deletePayrollItem
} from "../../../services/Worksheet/Payroll/PayrollItemService.js";

const handleError = (res, error) => {
    console.error("Error en PayrollItem:", error);

    return res.status(error.statusCode || 500).json({
        message:
        error.statusCode && error.statusCode < 500
            ? error.message
            : "Error interno del servidor.",
    });
};

export const create = async (req, res) => {
    try {
        const businessId = req.business?.id;
        const { payrollEmployeeId } = req.params;

        const item = await createPayrollItem(
            payrollEmployeeId,
            req.body,
            businessId
        );

        return res.status(201).json({
            message: "Concepto de nómina creado correctamente.",
            data: item,
        });
    } catch (error) {
        return handleError(res, error);
    }
};

export const get = async (req, res) => {
    try {
        const businessId = req.business?.id;
        const { payrollEmployeeId } = req.params;

        const items = await getPayrollItems(
            payrollEmployeeId,
            businessId
        );

        return res.status(200).json({
            message: "Conceptos de nómina obtenidos correctamente.",
            data: items,
        });
    } catch (error) {
        return handleError(res, error);
    }
};

export const getById = async (req, res) => {
    try {
        const businessId = req.business?.id;
        const { payrollEmployeeId, id } = req.params;

        const item = await getPayrollItemById(
            payrollEmployeeId,
            id,
            businessId
        );

        return res.status(200).json({
            message: "Concepto de nómina obtenido correctamente.",
            data: item,
        });
    } catch (error) {
        return handleError(res, error);
    }
};

export const update = async (req, res) => {
    try {
        const businessId = req.business?.id;
        const { payrollEmployeeId, id } = req.params;

        const item = await updatePayrollItem(
            payrollEmployeeId,
            id,
            req.body,
            businessId
        );

        return res.status(200).json({
            message: "Concepto de nómina actualizado correctamente.",
            data: item,
        });
    } catch (error) {
        return handleError(res, error);
    }
};

export const deletePayItem = async (req, res) => {
    try {
        const businessId = req.business?.id;
        const { payrollEmployeeId, id } = req.params;

        const result = await deletePayrollItem(
            payrollEmployeeId,
            id,
            businessId
        );

        return res.status(200).json(result);
    } catch (error) {
        return handleError(res, error);
    }
};