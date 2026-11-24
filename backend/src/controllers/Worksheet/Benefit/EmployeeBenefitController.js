import * as employeeBenefitService from "../../../services/Worksheet/Benefit/EmployeeBenefitService.js";

const getBusinessId = (req) => {
    return req.businessId || req.user?.business_id;
};

export const createEmployeeBenefit = async (req, res, next) => {
    try {
        const businessId = getBusinessId(req);
        const benefit = await employeeBenefitService.createEmployeeBenefit(
            req.body,
            businessId
        );

        return res.status(201).json({
            success: true,
            data: benefit,
        });
    } catch (error) {
        next(error);
    }
};

export const assignBenefitRuleToEmployee = async (req, res, next) => {
    try {
        const businessId = getBusinessId(req);
        const {
            benefit_rule_id,
            employee_id,
            start_date = null,
            end_date = null,
            initial_balance = null,
        } = req.body;

        const benefit = await employeeBenefitService.assignBenefitRuleToEmployee({
            benefitRuleId: benefit_rule_id,
            employeeId: employee_id,
            businessId,
            startDate: start_date,
            endDate: end_date,
            initialBalance: initial_balance,
        });

        return res.status(201).json({
            success: true,
            data: benefit,
        });
    } catch (error) {
        next(error);
    }
};

export const bulkAssignBenefitRule = async (req, res, next) => {
    try {
        const businessId = getBusinessId(req);
        const {
            benefit_rule_id,
            employee_ids = [],
            start_date = null,
            end_date = null,
            initial_balance = null,
        } = req.body;

        const results = await employeeBenefitService.bulkAssignBenefitRule({
            benefitRuleId: benefit_rule_id,
            employeeIds: employee_ids,
            businessId,
            startDate: start_date,
            endDate: end_date,
            initialBalance: initial_balance,
        });

        return res.status(200).json({
            success: true,
            data: results,
        });
    } catch (error) {
        next(error);
    }
};

export const getEmployeeBenefits = async (req, res, next) => {
    try {
        const businessId = getBusinessId(req);
        const { employeeId } = req.params;
        const {
            page = 1,
            limit = 10,
            type,
            status,
            benefit_mode,
            unit,
            from,
            to,
        } = req.query;

        const result = await employeeBenefitService.getEmployeeBenefits({
            employeeId,
            businessId,
            page,
            limit,
            type,
            status,
            benefitMode: benefit_mode,
            unit,
            from,
            to,
        });

        return res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        next(error);
    }
};

export const getEmployeeBenefitById = async (req, res, next) => {
    try {
        const businessId = getBusinessId(req);
        const { id } = req.params;
        const { employee_id } = req.query; // opcional

        const benefit = await employeeBenefitService.getEmployeeBenefitById({
            id,
            businessId,
            employeeId: employee_id || null,
        });

        return res.status(200).json({
            success: true,
            data: benefit,
        });
    } catch (error) {
        next(error);
    }
};

export const updateEmployeeBenefit = async (req, res, next) => {
    try {
        const businessId = getBusinessId(req);
        const { id } = req.params;

        const benefit = await employeeBenefitService.updateEmployeeBenefit(
            id,
            req.body,
            businessId
        );

        return res.status(200).json({
            success: true,
            data: benefit,
        });
    } catch (error) {
        next(error);
    }
};

export const changeEmployeeBenefitStatus = async (req, res, next) => {
    try {
        const businessId = getBusinessId(req);
        const { id } = req.params;
        const { status } = req.body;

        const benefit = await employeeBenefitService.changeEmployeeBenefitStatus({
            id,
            businessId,
            status,
        });

        return res.status(200).json({
            success: true,
            data: benefit,
        });
    } catch (error) {
        next(error);
    }
};