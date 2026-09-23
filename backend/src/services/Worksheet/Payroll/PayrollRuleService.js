import { Op } from "sequelize";
import sequelize from "../../../config/database.js";
import PayrollRule from "../../../models/Worksheet/Payroll/PayrollRules/PayrollRule.js";
import PayrollRuleTier from "../../../models/Worksheet/Payroll/PayrollRules/PayrollRuleTier.js";
import Branch from "../../../models/Branch.js";

export const getPayrollRules = async ({
    page = 1, limit = 10, type, active, code, from, to, businessId, branchId, rol 
} = {}) => {

    page = Number(page);
    limit = Number(limit);

    const offset = (page - 1) * limit;
    const where = {
        business_id: businessId
    };

    if (rol !== "admin" && rol !== "superAdmin") {
        if (!branchId) {
            throw new Error("branch_required");
        }

        where.branch_id = branchId;
    }

    if (type) {
        where.type = type;
    }
    if (active !== undefined) {
        where.active = active;
    }
    if (code) {
        where.code = code;
    }

    if (from || to) {
        where.effective_from = {};
        if (from) {
            where.effective_from[Op.gte] = from;
        }
        if (to) {
            where.effective_from[Op.lte] = to;
        }
    }

    const { count, rows } = await PayrollRule.findAndCountAll({
        where,
        include: [
            {
                model: Branch,
                as: "branch",
                attributes: ["id", "name"],
                required: false
            }
        ],
        order: [["id", "DESC"]],
        limit,
        offset
    });

    return {
        data: rows,
        pagination: {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit)
        }
    };
};

export const getPayrollRuleById = async ({ id, businessId, branchId, rol }) => {
    const where = {
        id,
        business_id: businessId
    };

    if (rol !== "admin" && rol !== "superAdmin") {
        if (!branchId) {
            throw new Error("branch_required");
        }
        where.branch_id = branchId;
    }

    const payrollRule = await PayrollRule.findOne({
        where,
        include: [
            {
                model: Branch,
                as: "branch",
                attributes: ["id", "name"],
                required: false
            },
            {
                model: PayrollRuleTier,
                as: "tiers",
                required: false,
                separate: true,
                order: [["min_amount", "ASC"]]
            }
        ]
    });
    if (!payrollRule) {
        throw new Error("payroll_rule_not_found");
    }
    return payrollRule;
};

const resolveCalculationType = (data) => {
    const hasValue =
        data.value !== undefined &&
        data.value !== null;

    const hasPercentage =
        data.percentage !== undefined &&
        data.percentage !== null;

    if (hasValue && hasPercentage) {
        throw new Error("rule_value_percentage_conflict");
    }

    if (hasValue) {
        return "FIXED";
    }

    if (hasPercentage) {
        return "PERCENTAGE";
    }

    return "PROGRESSIVE";
};

export const createPayrollRule = async (
    data, userId, businessId, branchId, rol
) => {
    const isPrivilegedRole = ["admin", "superAdmin"].includes(rol);

    if (!isPrivilegedRole && !branchId) {
        throw new Error("branch_required");
    }

    const ruleBranchId = isPrivilegedRole
        ? (data.branch_id ?? null)
        : branchId;

    if (ruleBranchId) {
        const branch = await Branch.findOne({
            where: {
                id: ruleBranchId,
                business_id: businessId
            }
        });

        if (!branch) {
            throw new Error("Sucursal no encontrada");
        }
    }

    const calculationType = resolveCalculationType(data);

    if (!data.base_type) {
        throw new Error("payroll_rule_base_type_required");
    }
    if (calculationType === "FIXED" && (data.value === undefined || data.value === null)) {
        throw new Error("payroll_rule_value_required");
    }

    if (calculationType === "PERCENTAGE" && 
        (data.percentage === undefined || data.percentage === null)
    ) {
        throw new Error("payroll_rule_percentage_required");
    }

    if (calculationType === "PROGRESSIVE" &&(!Array.isArray(data.tiers) || data.tiers.length === 0)) {
        throw new Error("payroll_rule_tiers_required");
    }

    const transaction = await sequelize.transaction();
    try {
        const previousRule = await PayrollRule.findOne({
            where: {
                business_id: businessId,
                branch_id: ruleBranchId,
                code: data.code,
                active: true
            },
            order: [["effective_from", "DESC"]],
            transaction
        });

        if (previousRule) {
            const previousDate = new Date(data.effective_from);
            previousDate.setDate(previousDate.getDate() - 1);

            const effectiveToPrevious =
                previousDate.toISOString().split("T")[0];

            await previousRule.update(
                {
                    effective_to: effectiveToPrevious,
                    active: false
                },
                { transaction }
            );
        }

        const payrollRule = await PayrollRule.create(
            {
                business_id: businessId,
                branch_id: ruleBranchId,
                code: data.code,
                name: data.name,
                type: data.type,
                calculation_type: calculationType,
                base_type: data.base_type,
                value:
                    calculationType === "FIXED"
                        ? data.value
                        : null,
                percentage:
                    calculationType === "PERCENTAGE"
                        ? data.percentage
                        : null,
                effective_from: data.effective_from,
                effective_to: data.effective_to ?? null,
                active: true,
                created_by: userId ?? null,
                updated_by: userId ?? null
            },
            { transaction }
        );

        if (calculationType === "PROGRESSIVE") {
            await PayrollRuleTier.bulkCreate(
                data.tiers.map((tier) => ({
                    payroll_rule_id: payrollRule.id,
                    min_amount: tier.min_amount,
                    max_amount: tier.max_amount ?? null,
                    fixed_amount: tier.fixed_amount ?? 0,
                    percentage: tier.percentage ?? 0
                })),
                { transaction }
            );
        }

        await transaction.commit();

        return payrollRule;

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const buildRuleData = (data, currentRule = null) => {
    const mergedData = {
        value: data.value ?? currentRule?.value ?? null,
        percentage:
            data.percentage ??
            currentRule?.percentage ??
            null,
        tiers:
            data.tiers ??
            currentRule?.tiers ??
            null
    };

    const calculationType = resolveCalculationType(mergedData);

    return {
        calculationType,
        value:
            calculationType === "FIXED"
                ? mergedData.value
                : null,

        percentage:
            calculationType === "PERCENTAGE"
                ? mergedData.percentage
                : null,

        tiers:
            calculationType === "PROGRESSIVE"
                ? mergedData.tiers
                : null
    };
};

export const createPayrollRuleVersion = async (
    id, data, userId, businessId, branchId, rol
) => {
    const isPrivilegedRole = ["admin", "superAdmin"].includes(rol);

    if (!isPrivilegedRole && !branchId) {
        throw new Error("branch_required");
    }

    const where = {
        id,
        business_id: businessId
    };

    if (!isPrivilegedRole) {
        where.branch_id = branchId;
    }

    const transaction = await sequelize.transaction();
    try {
        const currentRule = await PayrollRule.findOne({
            where,
            include: [
                {
                    model: PayrollRuleTier,
                    as: "tiers"
                }
            ],
            transaction
        });

        if (!currentRule) {
            throw new Error("payroll_rule_not_found");
        }
        if (!currentRule.active) {
            throw new Error("payroll_rule_inactive");
        }

        const ruleCalculation = buildRuleData( data, currentRule );

        const baseType =
            data.base_type ??
            currentRule.base_type;

        if (!baseType) {
            throw new Error(
                "payroll_rule_base_type_required"
            );
        }

        const newRuleData = {
            business_id: currentRule.business_id,
            branch_id: currentRule.branch_id,
            code: data.code ?? currentRule.code,
            name: data.name ?? currentRule.name,
            type: data.type ?? currentRule.type,
            calculation_type: ruleCalculation.calculationType,
            base_type: baseType,
            value: ruleCalculation.value,
            percentage: ruleCalculation.percentage,
            effective_from: data.effective_from ?? currentRule.effective_from,
            effective_to: data.effective_to ?? null,
            active: true,
            created_by: userId ?? null,
            updated_by: userId ?? null
        };

        const newEffectiveFrom =
            newRuleData.effective_from;

        const previousDate =
            new Date(newEffectiveFrom);

        previousDate.setDate(
            previousDate.getDate() - 1
        );

        const previousEffectiveTo =
            previousDate
                .toISOString()
                .split("T")[0];

        await currentRule.update(
            {
                effective_to: previousEffectiveTo,
                active: false
            },
            { transaction }
        );

        const newRule = await PayrollRule.create(
            newRuleData,
            { transaction }
        );

        if (ruleCalculation.calculationType === "PROGRESSIVE") {
            await PayrollRuleTier.bulkCreate(
                ruleCalculation.tiers.map((tier) => ({
                    payroll_rule_id: newRule.id,
                    min_amount:
                        tier.min_amount,
                    max_amount:
                        tier.max_amount ?? null,
                    fixed_amount:
                        tier.fixed_amount ?? 0,
                    percentage:
                        tier.percentage ?? 0
                })),
                { transaction }
            );
        }
        await transaction.commit();
        return newRule;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const deletePayrollRule = async ( id, businessId, branchId, rol ) => {
    const isPrivilegedRole = ["admin", "superAdmin"].includes(rol);
    if (!isPrivilegedRole && !branchId) {
        throw new Error("branch_required");
    }

    const where = {
        id,
        business_id: businessId
    };

    if (!isPrivilegedRole) {
        where.branch_id = branchId;
    }

    const payrollRule = await PayrollRule.findOne({
        where
    });

    if (!payrollRule) {
        throw new Error("payroll_rule_not_found");
    }

    if (!payrollRule.active) {
        throw new Error("payroll_rule_already_inactive");
    }

    await payrollRule.update({
        active: false
    });
    return payrollRule;
};

export const activatePayrollRule = async ( id, businessId, branchId, rol ) => {
    const isPrivilegedRole = ["admin", "superAdmin"].includes(rol);

    if (!isPrivilegedRole && !branchId) {
        throw new Error("branch_required");
    }

    const where = { id, business_id: businessId };

    if (!isPrivilegedRole) {
        where.branch_id = branchId;
    }

    const payrollRule = await PayrollRule.findOne({
        where
    });

    if (!payrollRule) {
        throw new Error("payroll_rule_not_found");
    }
    if (payrollRule.active) {
        throw new Error("payroll_rule_already_active");
    }

    await payrollRule.update({
        active: true
    });
    return payrollRule;
};
