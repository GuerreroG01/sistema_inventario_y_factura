import {
    accrueBenefit,
    consumeBenefit,
    payBenefit,
    adjustBenefitBalance,
    reverseBenefitTransaction,
    getBenefitBalance,
    getBenefitTransactions,
} from "../../../services/Worksheet/Benefit/BenefitTransactionService.js";
import { statusMap } from "../../../constants/statusMap_BenTransc.js";

const handleError = (res, error) => {
    const message = error.message || "internal_server_error";
    const status = statusMap[message] || 500;
    return res.status(status).json({
        success: false,
        error: message,
    });
};

export const accrue = async (req, res) => {
    try {
        const businessId = req.user?.business_id || req.headers["x-business-id"];
        const { employeeBenefitId } = req.params;
        const {
            amount,
            date = null,
            description = null,
            referenceType = null,
            referenceId = null,
            idempotencyKey = null,
        } = req.body;

        const result = await accrueBenefit({
            employeeBenefitId: Number(employeeBenefitId),
            businessId: Number(businessId),
            amount,
            date,
            description,
            referenceType,
            referenceId,
            idempotencyKey,
            createdBy: req.user?.id || null,
        });

        return res.status(201).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return handleError(res, error);
    }
};

export const consume = async (req, res) => {
    try {
        const businessId = req.user?.business_id || req.headers["x-business-id"];
        const { employeeBenefitId } = req.params;
        const {
            amount,
            date = null,
            description = null,
            referenceType = null,
            referenceId = null,
            idempotencyKey = null,
            allowNegativeBalance = false,
        } = req.body;

        const result = await consumeBenefit({
            employeeBenefitId: Number(employeeBenefitId),
            businessId: Number(businessId),
            amount,
            date,
            description,
            referenceType,
            referenceId,
            idempotencyKey,
            createdBy: req.user?.id || null,
            allowNegativeBalance: Boolean(allowNegativeBalance),
        });

        return res.status(201).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return handleError(res, error);
    }
};

export const pay = async (req, res) => {
    try {
        const businessId = req.user?.business_id || req.headers["x-business-id"];
        const { employeeBenefitId } = req.params;
        const {
            amount,
            date = null,
            description = null,
            referenceType = null,
            referenceId = null,
            idempotencyKey = null,
            allowNegativeBalance = false,
        } = req.body;

        const result = await payBenefit({
            employeeBenefitId: Number(employeeBenefitId),
            businessId: Number(businessId),
            amount,
            date,
            description,
            referenceType,
            referenceId,
            idempotencyKey,
            createdBy: req.user?.id || null,
            allowNegativeBalance: Boolean(allowNegativeBalance),
        });

        return res.status(201).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return handleError(res, error);
    }
};

export const adjust = async (req, res) => {
    try {
        const businessId = req.user?.business_id || req.headers["x-business-id"];
        const { employeeBenefitId } = req.params;
        const {
            amount,
            description,
            date = null,
            referenceType = null,
            referenceId = null,
            idempotencyKey = null,
            allowNegativeBalance = false,
        } = req.body;

        const result = await adjustBenefitBalance({
            employeeBenefitId: Number(employeeBenefitId),
            businessId: Number(businessId),
            amount,
            description,
            date,
            referenceType,
            referenceId,
            idempotencyKey,
            createdBy: req.user?.id || null,
            allowNegativeBalance: Boolean(allowNegativeBalance),
        });

        return res.status(201).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return handleError(res, error);
    }
};

export const reverse = async (req, res) => {
    try {
        const businessId = req.user?.business_id || req.headers["x-business-id"];
        const { transactionId } = req.params;
        const {
            date = null,
            description = null,
            idempotencyKey = null,
            allowNegativeBalance = false,
        } = req.body;

        const result = await reverseBenefitTransaction({
            transactionId: Number(transactionId),
            businessId: Number(businessId),
            date,
            description,
            idempotencyKey,
            createdBy: req.user?.id || null,
            allowNegativeBalance: Boolean(allowNegativeBalance),
        });

        return res.status(201).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return handleError(res, error);
    }
};

export const get = async (req, res) => {
    try {
        const businessId = req.user?.business_id || req.headers["x-business-id"];
        const { employeeBenefitId } = req.params;
        const { employeeId = null } = req.query;

        const result = await getBenefitBalance({
            employeeBenefitId: Number(employeeBenefitId),
            businessId: Number(businessId),
            employeeId: employeeId ? Number(employeeId) : null,
        });

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return handleError(res, error);
    }
};

export const getBenefit = async (req, res) => {
    try {
        const businessId = req.user?.business_id || req.headers["x-business-id"];
        const { employeeBenefitId } = req.params;
        const {
            page = 1,
            limit = 20,
            transactionType = null,
            from = null,
            to = null,
            order = "DESC",
        } = req.query;

        const result = await getBenefitTransactions({
            employeeBenefitId: Number(employeeBenefitId),
            businessId: Number(businessId),
            page: Number(page),
            limit: Number(limit),
            transactionType,
            from,
            to,
            order,
        });

        return res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        return handleError(res, error);
    }
};