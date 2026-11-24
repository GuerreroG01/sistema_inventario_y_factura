import { Op } from "sequelize";
import sequelize from "../../../config/database.js";
import Employee from "../../../models/Worksheet/Employee/Employee.js";
import EmployeeBenefit from "../../../models/Worksheet/Benefits/EmployeeBenefits.js";
import BenefitRule from "../../../models/Worksheet/Benefits/BenefitRule.js";
import { 
    BENEFIT_TYPES, BENEFIT_MODES, BENEFIT_UNITS, EMPLOYEE_BENEFIT_STATUSES
} from "../../../constants/benefitRule.js";
import { validateBusinessId, isValidDate } from "../../../utils/benefitRule.js";


const findEmployeeBenefit = async ({
    id, businessId, employeeId = null, transaction = null, lock = false, includeRule = false
}) => {
    const where = {
        id: Number(id),
        business_id: Number(businessId),
    };

    if (employeeId !== null) {
        where.employee_id = Number(employeeId);
    }

    const options = {
        where,
        transaction,
    };

    if (lock) {
        options.lock = transaction.LOCK.UPDATE;
    }

    if (includeRule) {
        options.include = [
            {
                model: BenefitRule,
                as: "rule",
                required: false,
            },
        ];
    }

    const benefit = await EmployeeBenefit.findOne(options);

    if (!benefit) {
        throw new Error("employee_benefit_not_found");
    }

    return benefit;
};

const pickEmployeeBenefitFields = (data = {}) => {
    const allowed = [
        "type",
        "benefit_mode",
        "balance",
        "unit",
        "status",
        "start_date",
        "end_date",
        "benefit_rule_id",
    ];

    const result = {};
    for (const key of allowed) {
        if (data[key] !== undefined) {
            result[key] = data[key];
        }
    }
    return result;
};

const validateEmployeeBenefitData = (data) => {
    if (data.type && !BENEFIT_TYPES.includes(data.type)) {
        throw new Error("employee_benefit_invalid_type");
    }

    if (data.benefit_mode && !BENEFIT_MODES.includes(data.benefit_mode)) {
        throw new Error("employee_benefit_invalid_benefit_mode");
    }

    if (data.unit && !BENEFIT_UNITS.includes(data.unit)) {
        throw new Error("employee_benefit_invalid_unit");
    }

    if (data.status && !EMPLOYEE_BENEFIT_STATUSES.includes(data.status)) {
        throw new Error("employee_benefit_invalid_status");
    }

    if (data.balance !== undefined && data.balance !== null) {
        const balance = Number(data.balance);
        if (Number.isNaN(balance) || balance < 0) {
            throw new Error("employee_benefit_invalid_balance");
        }
    }

    if (data.start_date && !isValidDate(data.start_date)) {
        throw new Error("employee_benefit_invalid_start_date");
    }

    if (data.end_date && !isValidDate(data.end_date)) {
        throw new Error("employee_benefit_invalid_end_date");
    }

    if (
        data.start_date &&
        data.end_date &&
        data.end_date < data.start_date
    ) {
        throw new Error("employee_benefit_invalid_date_range");
    }
};

const assertEmployeeExistsInBusiness = async (
    employeeId, businessId, transaction = null
) => {
    if (!employeeId || !Number.isInteger(Number(employeeId)) || Number(employeeId) <= 0) {
        throw new Error("employee_benefit_invalid_employee_id");
    }

    const employee = await Employee.findOne({
        where: {
            id: Number(employeeId),
            business_id: Number(businessId),
        },
        transaction,
        attributes: ["id"],
    });

    if (!employee) {
        throw new Error("employee_not_found");
    }
};

export const createEmployeeBenefit = async (data, businessId) => {
    validateBusinessId(businessId);

    const {
        employee_id, benefit_rule_id = null, type, benefit_mode = "RECURRING",
        balance = 0, unit, status = "ACTIVE", start_date = null, end_date = null
    } = data;

    if (!employee_id) {
        throw new Error("employee_benefit_employee_id_required");
    }
    if (!type) {
        throw new Error("employee_benefit_type_required");
    }
    if (!unit) {
        throw new Error("employee_benefit_unit_required");
    }

    await assertEmployeeExistsInBusiness(employee_id, businessId);

    const payload = {
        employee_id: Number(employee_id),
        business_id: Number(businessId),
        benefit_rule_id: benefit_rule_id ? Number(benefit_rule_id) : null,
        type,
        benefit_mode,
        balance: Number(balance),
        unit,
        status,
        start_date,
        end_date,
    };

    validateEmployeeBenefitData(payload);

    if (payload.benefit_rule_id) {
        const rule = await BenefitRule.findOne({
            where: {
                id: payload.benefit_rule_id,
                business_id: Number(businessId),
            },
        });
        if (!rule) {
            throw new Error("benefit_rule_not_found");
        }
        // Opcional: sincronizar type / unit / benefit_mode desde la rule
        // payload.type = rule.type;
        // payload.unit = rule.unit;
        // payload.benefit_mode = rule.benefit_mode;
    }

    const transaction = await sequelize.transaction();
    try {
        const benefit = await EmployeeBenefit.create(payload, { transaction });
        await transaction.commit();
        return benefit;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const assignBenefitRuleToEmployee = async ({
    benefitRuleId, employeeId, businessId, startDate = null, endDate = null,
    initialBalance = null
}) => {
    validateBusinessId(businessId);

    if (!benefitRuleId || !Number.isInteger(Number(benefitRuleId)) || Number(benefitRuleId) <= 0) {
        throw new Error("benefit_rule_invalid_id");
    }
    if (!employeeId || !Number.isInteger(Number(employeeId)) || Number(employeeId) <= 0) {
        throw new Error("employee_benefit_invalid_employee_id");
    }

    await assertEmployeeExistsInBusiness(employeeId, businessId);

    const transaction = await sequelize.transaction();
    try {
        const rule = await BenefitRule.findOne({
            where: {
                id: Number(benefitRuleId),
                business_id: Number(businessId),
                is_active: true,
            },
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        if (!rule) {
            throw new Error("benefit_rule_not_found_or_inactive");
        }

        const existing = await EmployeeBenefit.findOne({
            where: {
                employee_id: Number(employeeId),
                business_id: Number(businessId),
                benefit_rule_id: Number(benefitRuleId),
                status: { [Op.in]: ["ACTIVE", "PAUSED"] },
            },
            transaction,
        });

        if (existing) {
            throw new Error("employee_benefit_already_assigned");
        }

        const benefit = await EmployeeBenefit.create(
            {
                employee_id: Number(employeeId),
                business_id: Number(businessId),
                benefit_rule_id: Number(benefitRuleId),
                type: rule.type,
                benefit_mode: rule.benefit_mode,
                balance: initialBalance !== null ? Number(initialBalance) : (rule.amount ?? 0),
                unit: rule.unit,
                status: "ACTIVE",
                start_date: startDate || rule.start_date,
                end_date: endDate || rule.end_date,
            },
            { transaction }
        );

        await transaction.commit();
        return benefit;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const bulkAssignBenefitRule = async ({
    benefitRuleId, employeeIds = [], businessId, startDate = null,
    endDate = null, initialBalance = null,
}) => {
    validateBusinessId(businessId);

    if (!benefitRuleId || !Number.isInteger(Number(benefitRuleId)) || Number(benefitRuleId) <= 0) {
        throw new Error("benefit_rule_invalid_id");
    }

    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
        throw new Error("employee_benefit_employee_ids_required");
    }

    const uniqueIds = [...new Set(employeeIds.map(Number))].filter(
        (id) => Number.isInteger(id) && id > 0
    );

    if (uniqueIds.length === 0) {
        throw new Error("employee_benefit_invalid_employee_ids");
    }

    const transaction = await sequelize.transaction();
    try {
        const rule = await BenefitRule.findOne({
            where: {
                id: Number(benefitRuleId),
                business_id: Number(businessId),
                is_active: true,
            },
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        if (!rule) {
            throw new Error("benefit_rule_not_found_or_inactive");
        }

        const results = {
            created: [],
            skipped: [],
            errors: [],
        };

        for (const employeeId of uniqueIds) {
            try {
                await assertEmployeeExistsInBusiness(employeeId, businessId, transaction);

                const existing = await EmployeeBenefit.findOne({
                    where: {
                        employee_id: employeeId,
                        business_id: Number(businessId),
                        benefit_rule_id: Number(benefitRuleId),
                        status: { [Op.in]: ["ACTIVE", "PAUSED"] },
                    },
                    transaction,
                });

                if (existing) {
                    results.skipped.push({
                        employee_id: employeeId,
                        reason: "already_assigned",
                    });
                    continue;
                }

                const benefit = await EmployeeBenefit.create(
                    {
                        employee_id: employeeId,
                        business_id: Number(businessId),
                        benefit_rule_id: Number(benefitRuleId),
                        type: rule.type,
                        benefit_mode: rule.benefit_mode,
                        balance:
                            initialBalance !== null
                                ? Number(initialBalance)
                                : (rule.amount ?? 0),
                        unit: rule.unit,
                        status: "ACTIVE",
                        start_date: startDate || rule.start_date,
                        end_date: endDate || rule.end_date,
                    },
                    { transaction }
                );

                results.created.push(benefit);
            } catch (err) {
                results.errors.push({
                    employee_id: employeeId,
                    error: err.message,
                });
            }
        }

        await transaction.commit();
        return results;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const getEmployeeBenefits = async ({
    employeeId, businessId, page = 1, limit = 10, type, status, benefitMode,
    unit, from, to
} = {}) => {
    validateBusinessId(businessId);

    if (!employeeId || !Number.isInteger(Number(employeeId)) || Number(employeeId) <= 0) {
        throw new Error("employee_benefit_invalid_employee_id");
    }

    page = Number(page);
    limit = Number(limit);

    if (
        !Number.isInteger(page) ||
        page < 1 ||
        !Number.isInteger(limit) ||
        limit < 1 ||
        limit > 100
    ) {
        throw new Error("invalid_pagination");
    }

    const offset = (page - 1) * limit;

    const where = {
        employee_id: Number(employeeId),
        business_id: Number(businessId),
    };

    if (type) {
        if (!BENEFIT_TYPES.includes(type)) {
            throw new Error("employee_benefit_invalid_type");
        }
        where.type = type;
    }

    if (status) {
        if (!EMPLOYEE_BENEFIT_STATUSES.includes(status)) {
            throw new Error("employee_benefit_invalid_status");
        }
        where.status = status;
    }

    if (benefitMode) {
        if (!BENEFIT_MODES.includes(benefitMode)) {
            throw new Error("employee_benefit_invalid_benefit_mode");
        }
        where.benefit_mode = benefitMode;
    }

    if (unit) {
        if (!BENEFIT_UNITS.includes(unit)) {
            throw new Error("employee_benefit_invalid_unit");
        }
        where.unit = unit;
    }

    if (from && !isValidDate(from)) {
        throw new Error("employee_benefit_invalid_from_date");
    }
    if (to && !isValidDate(to)) {
        throw new Error("employee_benefit_invalid_to_date");
    }
    if (from && to && from > to) {
        throw new Error("employee_benefit_invalid_date_range");
    }

    if (from || to) {
        where.start_date = {};
        if (from) where.start_date[Op.gte] = from;
        if (to) where.start_date[Op.lte] = to;
    }

    const { count, rows } = await EmployeeBenefit.findAndCountAll({
        where,
        attributes: [
            "id",
            "type",
            "benefit_mode",
            "balance",
            "unit",
            "status",
            "start_date",
            "end_date",
        ],
        order: [["id", "DESC"]],
        limit,
        offset,
        include: [
            {
                model: BenefitRule,
                as: "rule",
                attributes: ["name"],
                required: false,
            },
        ],
    });

    const data = rows.map((benefit) => ({
        id: benefit.id,
        type: benefit.type,
        name: benefit.rule?.name ?? benefit.type,
        benefit_mode: benefit.benefit_mode,
        balance: benefit.balance,
        unit: benefit.unit,
        status: benefit.status,
        start_date: benefit.start_date,
        end_date: benefit.end_date,
    }));

    return {
        data,
        pagination: {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
        },
    };
};

export const getEmployeeBenefitById = async ({id,businessId,employeeId = null}) => {
    validateBusinessId(businessId);

    if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
        throw new Error("employee_benefit_invalid_id");
    }

    return findEmployeeBenefit({
        id: Number(id),
        businessId: Number(businessId),
        employeeId: employeeId ? Number(employeeId) : null,
        includeRule: true,
    });
};

export const updateEmployeeBenefit = async (id, data, businessId) => {
    validateBusinessId(businessId);

    if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
        throw new Error("employee_benefit_invalid_id");
    }

    const updateData = pickEmployeeBenefitFields(data);

    delete updateData.employee_id;
    delete updateData.business_id;

    if (Object.keys(updateData).length === 0) {
        throw new Error("employee_benefit_no_fields_to_update");
    }

    const transaction = await sequelize.transaction();
    try {
        const benefit = await findEmployeeBenefit({
            id: Number(id),
            businessId: Number(businessId),
            transaction,
            lock: true,
        });

        const merged = {
            type: benefit.type,
            benefit_mode: benefit.benefit_mode,
            balance: Number(benefit.balance),
            unit: benefit.unit,
            status: benefit.status,
            start_date: benefit.start_date,
            end_date: benefit.end_date,
            benefit_rule_id: benefit.benefit_rule_id,
            ...updateData,
        };

        validateEmployeeBenefitData(merged);

        if (updateData.benefit_rule_id !== undefined && updateData.benefit_rule_id !== null) {
            const rule = await BenefitRule.findOne({
                where: {
                    id: Number(updateData.benefit_rule_id),
                    business_id: Number(businessId),
                },
                transaction,
            });
            if (!rule) {
                throw new Error("benefit_rule_not_found");
            }
        }

        await benefit.update(updateData, { transaction });
        await transaction.commit();
        return benefit;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const changeEmployeeBenefitStatus = async ({id, businessId, status}) => {
    validateBusinessId(businessId);

    if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
        throw new Error("employee_benefit_invalid_id");
    }

    if (!status || !EMPLOYEE_BENEFIT_STATUSES.includes(status)) {
        throw new Error("employee_benefit_invalid_status");
    }

    const transaction = await sequelize.transaction();
    try {
        const benefit = await findEmployeeBenefit({
            id: Number(id),
            businessId: Number(businessId),
            transaction,
            lock: true,
        });

        if (benefit.status === status) {
            throw new Error(`employee_benefit_already_${status.toLowerCase()}`);
        }

        if (benefit.status === "CLOSED" && status !== "CLOSED") {
            throw new Error("employee_benefit_cannot_reopen_closed");
        }

        await benefit.update({ status }, { transaction });
        await transaction.commit();
        return benefit;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};