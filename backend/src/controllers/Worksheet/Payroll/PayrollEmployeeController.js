import {
    createPayrollEmployee, getPayrollEmployeesByPeriod, getPayrollEmployeeById,
    deletePayrollEmployee
} from "../../../services/Worksheet/Payroll/PayrollEmployeeService.js";

const handleError = (res, error) => {
    console.error("Error en PayrollEmployee:", error);

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
        const { periodId } = req.params;
        const { employee_id } = req.body;

        const payrollEmployee = await createPayrollEmployee(
            periodId,
            employee_id,
            businessId
        );

        return res.status(201).json({
            message: "Empleado agregado al período de nómina correctamente.",
            data: payrollEmployee,
        });
    } catch (error) {
        return handleError(res, error);
    }
};

export const get = async (req, res) => {
    try {
        const businessId = req.business?.id;
        const { periodId } = req.params;

        const result = await getPayrollEmployeesByPeriod(
            periodId,
            businessId,
            req.query
        );

        return res.status(200).json({
            message: "Empleados de nómina obtenidos correctamente.",
            ...result,
        });
    } catch (error) {
        return handleError(res, error);
    }
};

export const getById = async (req, res) => {
    try {
        const businessId = req.business?.id;
        const { periodId, id } = req.params;

        const payrollEmployee = await getPayrollEmployeeById(
            periodId,
            id,
            businessId
        );

        return res.status(200).json({
            message: "Resultado del empleado obtenido correctamente.",
            data: payrollEmployee,
        });
    } catch (error) {
        return handleError(res, error);
    }
};

export const deletePayEmployee = async (req, res) => {
    try {
        const businessId = req.business?.id;
        const { periodId, id } = req.params;

        const result = await deletePayrollEmployee(
            periodId,
            id,
            businessId
        );

        return res.status(200).json(result);
    } catch (error) {
        return handleError(res, error);
    }
};