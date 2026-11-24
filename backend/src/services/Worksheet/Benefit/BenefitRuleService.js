import { Op } from "sequelize";
import sequelize from "../../../config/database.js";
import BenefitRule from "../../../models/Worksheet/Benefits/BenefitRule.js";
import { BENEFIT_TYPES, BENEFIT_SCOPES } from "../../../constants/benefitRule.js";
import { findBenefitRule, validateBusinessId, isValidDate, parseBoolean, pickRuleFields, validateBenefitRuleData } from "../../../utils/benefitRule.js";

export const getBenefitRules = async ({ page = 1, limit = 10, type, scope, active, name, from, to, businessId } = {}) => {
    validateBusinessId(businessId);

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
    const where = { business_id: businessId };

    if (type) {
        if (!BENEFIT_TYPES.includes(type)) {
            throw new Error("benefit_rule_invalid_type");
        }

        where.type = type;
    }

    if (scope) {
        if (!BENEFIT_SCOPES.includes(scope)) {
            throw new Error("benefit_rule_invalid_scope");
        }

        where.scope = scope;
    }

    if (active !== undefined) {
        where.is_active = parseBoolean(active);
    }

    if (name) {
        where.name = {
            [Op.like]: `%${String(name).trim()}%`,
        };
    }

    if (from && !isValidDate(from)) {
        throw new Error("benefit_rule_invalid_from_date");
    }

    if (to && !isValidDate(to)) {
        throw new Error("benefit_rule_invalid_to_date");
    }

    if (from && to && from > to) {
        throw new Error("benefit_rule_invalid_date_range");
    }

    if (from || to) {
        where.start_date = {};

        if (from) {
            where.start_date[Op.gte] = from;
        }

        if (to) {
            where.start_date[Op.lte] = to;
        }
    }

    const { count, rows } = await BenefitRule.findAndCountAll({
        where,
        order: [["id", "DESC"]],
        limit,
        offset,
    });

    return {
        data: rows,
        pagination: {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
        },
    };
};

export const getBenefitRuleById = async ({ id, businessId }) => {
    validateBusinessId(businessId);

    if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
        throw new Error("benefit_rule_invalid_id");
    }

    return findBenefitRule({
        id: Number(id),
        businessId,
    });
};

export const createBenefitRule = async ( data, businessId ) => {
    validateBusinessId(businessId);

    const ruleData = pickRuleFields(data);

    if (!ruleData.type) {
        throw new Error("benefit_rule_type_required");
    }

    if (!ruleData.name?.trim()) {
        throw new Error("benefit_rule_name_required");
    }

    if (!ruleData.unit) {
        throw new Error("benefit_rule_unit_required");
    }

    if (!ruleData.start_date) {
        throw new Error("benefit_rule_start_date_required");
    }

    const dataToValidate = {
        scope: "GLOBAL",
        benefit_mode: "RECURRING",
        frequency: "NONE",
        ...ruleData,
    };

    validateBenefitRuleData(dataToValidate);
    const transaction = await sequelize.transaction();

    try {
        const benefitRule = await BenefitRule.create(
            {
                ...ruleData,
                name: ruleData.name.trim(),
                business_id: Number(businessId),
                is_active: true,
            },
            { transaction },
        );

        await transaction.commit();

        return benefitRule;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const updateBenefitRule = async ( id, data, businessId ) => {
    validateBusinessId(businessId);

    if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
        throw new Error("benefit_rule_invalid_id");
    }

    const ruleData = pickRuleFields(data);

    if (Object.keys(ruleData).length === 0) {
        throw new Error("benefit_rule_no_fields_to_update");
    }

    const transaction = await sequelize.transaction();

    try {
        const benefitRule = await findBenefitRule({
            id: Number(id),
            businessId: Number(businessId),
            transaction,
            lock: true,
        });

        const mergedData = {
            type: benefitRule.type,
            name: benefitRule.name,
            description: benefitRule.description,
            scope: benefitRule.scope,
            benefit_mode: benefitRule.benefit_mode,
            frequency: benefitRule.frequency,
            unit: benefitRule.unit,
            amount: benefitRule.amount === null
                ? null
                : Number(benefitRule.amount),
            formula: benefitRule.formula,
            start_date: benefitRule.start_date,
            end_date: benefitRule.end_date,
            conditions: benefitRule.conditions,
            ...ruleData,
        };

        validateBenefitRuleData(mergedData);

        if (ruleData.name !== undefined) {
            ruleData.name = ruleData.name.trim();
        }

        await benefitRule.update(ruleData, { transaction });

        await transaction.commit();

        return benefitRule;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const deactivateBenefitRule = async ( id, businessId ) => {
    validateBusinessId(businessId);
    const transaction = await sequelize.transaction();

    try {
        const benefitRule = await findBenefitRule({
            id: Number(id),
            businessId: Number(businessId),
            transaction,
            lock: true,
        });

        if (!benefitRule.is_active) {
            throw new Error("benefit_rule_already_inactive");
        }

        await benefitRule.update(
            { is_active: false },
            { transaction },
        );

        await transaction.commit();

        return benefitRule;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const activateBenefitRule = async ( id, businessId ) => {
    validateBusinessId(businessId);
    const transaction = await sequelize.transaction();

    try {
        const benefitRule = await findBenefitRule({
            id: Number(id),
            businessId: Number(businessId),
            transaction,
            lock: true,
        });

        if (benefitRule.is_active) {
            throw new Error("benefit_rule_already_active");
        }

        await benefitRule.update(
            { is_active: true },
            { transaction },
        );

        await transaction.commit();

        return benefitRule;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};
/* Para el motor de calculo */
export const getActiveBenefitRules = async ( businessId, calculationDate ) => {
    validateBusinessId(businessId);

    if (!isValidDate(calculationDate)) {
        throw new Error("benefit_rule_invalid_calculation_date");
    }

    const benefitRules = await BenefitRule.findAll({
        where: {
            business_id: Number(businessId),
            scope: "GLOBAL",
            is_active: true,
            start_date: {
                [Op.lte]: calculationDate,
            },
            [Op.or]: [
                { end_date: null },
                {
                    end_date: {
                        [Op.gte]: calculationDate,
                    },
                },
            ],
        },
        attributes: [
            "id",
            "business_id",
            "type",
            "name",
            "description",
            "scope",
            "benefit_mode",
            "frequency",
            "unit",
            "amount",
            "formula",
            "start_date",
            "end_date",
            "conditions",
        ],
        order: [["type", "ASC"]],
        raw: true,
    });

    return {
        has_benefit_rules: benefitRules.length > 0,
        benefit_rules: benefitRules,
    };
};