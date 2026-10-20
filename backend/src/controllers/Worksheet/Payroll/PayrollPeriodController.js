import {
  createPayrollPeriod, getPayrollPeriods, getPayrollPeriodById, updatePayrollPeriod,
  deletePayrollPeriod, updatePayrollPeriodStatus, processAndSavePayrollForPeriod, 
  getPayrollPeriodSummary, getPayrollItemsByEmployee
} from "../../../services/Worksheet/Payroll/PayrollPeriodService.js";

const handleError = (res, error) => {
    console.error("Error en PayrollPeriod:", error);

    return res.status(error.statusCode || 500).json({
        message:
        error.statusCode && error.statusCode < 500
            ? error.message
            : "Error interno del servidor.",
    });
};

export const create = async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const period = await createPayrollPeriod(req.body, businessId);

        return res.status(201).json({
        message: "Período de nómina creado correctamente.",
        data: period,
        });
    } catch (error) {
        return handleError(res, error);
    }
};

export const get = async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const result = await getPayrollPeriods(businessId, req.query);

        return res.status(200).json({
        message: "Períodos de nómina obtenidos correctamente.",
        ...result,
        });
    } catch (error) {
        return handleError(res, error);
    }
};

export const getById = async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const { id } = req.params;
        const period = await getPayrollPeriodById(id, businessId);

        return res.status(200).json({
        message: "Período de nómina obtenido correctamente.",
        data: period,
        });
    } catch (error) {
        return handleError(res, error);
    }
};

export const update = async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const { id } = req.params;
        const period = await updatePayrollPeriod(id, req.body, businessId);

        return res.status(200).json({
        message: "Período de nómina actualizado correctamente.",
        data: period,
        });
    } catch (error) {
        return handleError(res, error);
    }
};

export const updateStatus = async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const { id } = req.params;
        const { status } = req.body;

        const period = await updatePayrollPeriodStatus(id, status, businessId);

        return res.status(200).json({
            message: "Estado del período de nómina actualizado correctamente.",
            data: period,
        });
    } catch (error) {
        return handleError(res, error);
    }
};

export const deletePeriod = async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const { id } = req.params;
        const result = await deletePayrollPeriod(id, businessId);

        return res.status(200).json(result);
    } catch (error) {
        return handleError(res, error);
    }
};

export const calculatePayroll = async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const payrollPeriodId = Number(req.params.periodId);

        // Validaciones básicas (opcional, porque el servicio también valida)
        if (!businessId) {
            const error = new Error("No se ha identificado la empresa autenticada.");
            error.statusCode = 401;
            throw error;
        }

        if (!Number.isInteger(payrollPeriodId) || payrollPeriodId < 1) {
            const error = new Error("El ID del período no es válido.");
            error.statusCode = 400;
            throw error;
        }

        const result = await processAndSavePayrollForPeriod({
            payrollPeriodId,
            businessId,
        });

        return res.status(200).json({
            success: true,
            message: "Nómina calculada y guardada correctamente",
            data: result,
        });
    } catch (error) {
        return handleError(res, error);
    }
};

export const getSummary = async (req, res) => {
    try {
        const { periodId } = req.params;

        const summary = await getPayrollPeriodSummary(periodId);

        return res.status(200).json({
            success: true,
            data: summary,
        });
    } catch (error) {
        if (error.message === "payroll_period_id_required") {
            return res.status(400).json({
                success: false,
                message: "El ID del período de nómina es obligatorio y debe ser un número entero.",
            });
        }

        if (error.message === "payroll_period_not_found") {
            return res.status(404).json({
                success: false,
                message: "No se encontró el período de nómina.",
            });
        }

        console.error("Error al obtener el resumen de nómina:", error);

        return res.status(500).json({
            success: false,
            message: "Error interno al obtener el resumen de nómina.",
        });
    }
};


export const getItemsByEmployee = async (req, res) => {
    try {
        const { periodId, payrollEmployeeId } = req.params;

        const items = await getPayrollItemsByEmployee(
            periodId,
            payrollEmployeeId
        );

        return res.status(200).json({
            success: true,
            data: items,
        });
    } catch (error) {
        if (
            error.message === "payroll_period_id_required" ||
            error.message === "payroll_employee_id_required"
        ) {
            return res.status(400).json({
                success: false,
                message: "Los identificadores deben ser números enteros positivos.",
            });
        }

        if (error.message === "payroll_employee_not_found") {
            return res.status(404).json({
                success: false,
                message: "No se encontró el registro de nómina para el período indicado.",
            });
        }

        console.error("Error al obtener los conceptos de nómina:", error);

        return res.status(500).json({
            success: false,
            message: "Error interno al obtener los conceptos de nómina.",
        });
    }
};