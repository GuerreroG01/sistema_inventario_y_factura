
import { BENEFIT_TYPES, BENEFIT_SCOPES, BENEFIT_MODES, BENEFIT_FREQUENCIES, BENEFIT_UNITS,
    RULE_FIELDS
} from "../constants/benefitRule.js";
import BenefitRule from "../models/Worksheet/Benefits/BenefitRule.js";

export const findBenefitRule = async ({ id, businessId, transaction, lock = false }) => {
    const options = {
        where: {
            id,
            business_id: businessId,
        },
        transaction,
    };

    if (lock && transaction) {
        options.lock = transaction.LOCK.UPDATE;
    }

    const rule = await BenefitRule.findOne(options);

    if (!rule) {
        throw new Error("benefit_rule_not_found");
    }

    return rule;
};

export const validateBusinessId = (businessId) => {
    if (
        businessId === undefined ||
        businessId === null ||
        businessId === "" ||
        !Number.isInteger(Number(businessId)) ||
        Number(businessId) <= 0
    ) {
        throw new Error("business_id_required");
    }
};

export const validateBenefitRuleId = (id) => {
    if (
        id === undefined ||
        id === null ||
        id === "" ||
        !Number.isInteger(Number(id)) ||
        Number(id) <= 0
    ) {
        throw new Error("benefit_rule_invalid_id");
    }
};

export const isValidDate = (value) => {
    if (typeof value !== "string") {
        return false;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
    );
};

export const parseBoolean = (value) => {
    if (value === true || value === "true" || value === "1") {
        return true;
    }

    if (value === false || value === "false" || value === "0") {
        return false;
    }

    throw new Error("invalid_active_filter");
};

export const pickRuleFields = (data = {}) => {
    const result = {};

    for (const field of RULE_FIELDS) {
        if (Object.prototype.hasOwnProperty.call(data, field)) {
            result[field] = data[field];
        }
    }

    return result;
};

export const validateBenefitRuleData = (data) => {
    if ( data.type !== undefined && !BENEFIT_TYPES.includes(data.type) ) {
        throw new Error("benefit_rule_invalid_type");
    }

    if ( data.scope !== undefined && !BENEFIT_SCOPES.includes(data.scope) ) {
        throw new Error("benefit_rule_invalid_scope");
    }

    if ( data.benefit_mode !== undefined && !BENEFIT_MODES.includes(data.benefit_mode) ) {
        throw new Error("benefit_rule_invalid_mode");
    }

    if ( data.frequency !== undefined && !BENEFIT_FREQUENCIES.includes(data.frequency) ) {
        throw new Error("benefit_rule_invalid_frequency");
    }

    if ( data.unit !== undefined && !BENEFIT_UNITS.includes(data.unit) ) {
        throw new Error("benefit_rule_invalid_unit");
    }

    if ( data.name !== undefined &&
        (
            typeof data.name !== "string" ||
            !data.name.trim() ||
            data.name.trim().length > 150
        )
    ) {
        throw new Error("benefit_rule_invalid_name");
    }

    if ( data.description !== undefined && data.description !== null &&
        (
            typeof data.description !== "string" ||
            data.description.length > 500
        )
    ) {
        throw new Error("benefit_rule_invalid_description");
    }

    if ( data.formula !== undefined && data.formula !== null &&
        (
            typeof data.formula !== "string" ||
            data.formula.length > 255
        )
    ) {
        throw new Error("benefit_rule_invalid_formula");
    }

    if ( data.amount !== undefined && data.amount !== null ) {
        const amount = Number(data.amount);

        if (!Number.isFinite(amount) || amount < 0) {
            throw new Error("benefit_rule_invalid_amount");
        }
    }

    if ( data.start_date !== undefined && !isValidDate(data.start_date) ) {
        throw new Error("benefit_rule_invalid_start_date");
    }

    if ( data.end_date !== undefined && data.end_date !== null && !isValidDate(data.end_date) ) {
        throw new Error("benefit_rule_invalid_end_date");
    }

    if ( data.start_date && data.end_date && data.end_date < data.start_date ) {
        throw new Error("benefit_rule_invalid_date_range");
    }

    if ( data.conditions !== undefined && data.conditions !== null &&
        (
            typeof data.conditions !== "object" ||
            Array.isArray(data.conditions)
        )
    ) {
        throw new Error("benefit_rule_invalid_conditions");
    }

    if ( data.benefit_mode === "RECURRING" && data.frequency === "NONE" ) {
        throw new Error(
            "benefit_rule_recurring_frequency_required"
        );
    }

    if (
        data.benefit_mode === "ONE_TIME" &&
        data.frequency &&
        !["NONE", "ON_DEMAND"].includes(data.frequency)
    ) {
        throw new Error(
            "benefit_rule_one_time_invalid_frequency"
        );
    }
};