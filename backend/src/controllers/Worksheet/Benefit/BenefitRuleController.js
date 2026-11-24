
import { getBenefitRules, getBenefitRuleById, createBenefitRule, updateBenefitRule,
    deactivateBenefitRule, activateBenefitRule
} from "../../../services/Worksheet/Benefit/BenefitRuleService.js";

export const getRules = async (req, res) => {
    try {
        const { business_id } = req.user;
        const {
            page, limit, type, scope, active, name, from, to
        } = req.query;

        const result = await getBenefitRules({
            page, limit, type, scope, active, name, from, to, businessId: business_id
        });

        return res.status(200).json(result);

    } catch (error) {
        const badRequestErrors = [
            "business_id_required", "invalid_pagination",
            "invalid_active_filter", "benefit_rule_invalid_type",
            "benefit_rule_invalid_scope", "benefit_rule_invalid_from_date",
            "benefit_rule_invalid_to_date", "benefit_rule_invalid_date_range"
        ];

        if (badRequestErrors.includes(error.message)) {
            return res.status(400).json({
                message: error.message
            });
        }

        console.error("Error getting benefit rules:", error);

        return res.status(500).json({
            message: "Error al obtener las reglas de beneficios."
        });
    }
};

export const getRuleById = async (req, res) => {
    try {
        const { business_id } = req.user;
        const { id } = req.params;

        const benefitRule = await getBenefitRuleById({
            id, businessId: business_id
        });

        return res.status(200).json(benefitRule);

    } catch (error) {
        if (error.message === "benefit_rule_not_found") {
            return res.status(404).json({
                message: error.message
            });
        }

        if ([ "business_id_required", "benefit_rule_invalid_id" ].includes(error.message) ) {
            return res.status(400).json({
                message: error.message
            });
        }

        console.error("Error getting benefit rule:", error);

        return res.status(500).json({
            message: "Error al obtener la regla de beneficio."
        });
    }
};

export const createRule = async (req, res) => {
    try {
        const { business_id } = req.user;

        const benefitRule = await createBenefitRule(
            req.body,
            business_id
        );

        return res.status(201).json({
            message: "Regla de beneficio creada correctamente.",
            data: benefitRule
        });

    } catch (error) {
        const validationErrors = [
            "business_id_required", "benefit_rule_type_required",
            "benefit_rule_name_required", "benefit_rule_unit_required",
            "benefit_rule_start_date_required", "benefit_rule_invalid_type",
            "benefit_rule_invalid_scope", "benefit_rule_invalid_mode",
            "benefit_rule_invalid_frequency", "benefit_rule_invalid_unit",
            "benefit_rule_invalid_name", "benefit_rule_invalid_description",
            "benefit_rule_invalid_formula", "benefit_rule_invalid_amount",
            "benefit_rule_invalid_start_date", "benefit_rule_invalid_end_date",
            "benefit_rule_invalid_date_range", "benefit_rule_invalid_conditions",
            "benefit_rule_recurring_frequency_required", "benefit_rule_one_time_invalid_frequency"
        ];

        if (validationErrors.includes(error.message)) {
            return res.status(400).json({
                message: error.message
            });
        }

        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({
                message: "Los datos de la regla no son válidos.",
                errors: error.errors.map((item) => ({
                    field: item.path,
                    message: item.message
                }))
            });
        }

        console.error("Error creating benefit rule:", error);

        return res.status(500).json({
            message: "Error al crear la regla de beneficio."
        });
    }
};

export const updateRule = async (req, res) => {
    try {
        const { business_id } = req.user;
        const { id } = req.params;

        const benefitRule = await updateBenefitRule(
            id,
            req.body,
            business_id
        );

        return res.status(200).json({
            message: "Regla de beneficio actualizada correctamente.",
            data: benefitRule
        });

    } catch (error) {
        if (error.message === "benefit_rule_not_found") {
            return res.status(404).json({
                message: error.message
            });
        }

        const validationErrors = [
            "business_id_required",
            "benefit_rule_invalid_id",
            "benefit_rule_no_fields_to_update",
            "benefit_rule_invalid_type",
            "benefit_rule_invalid_scope",
            "benefit_rule_invalid_mode",
            "benefit_rule_invalid_frequency",
            "benefit_rule_invalid_unit",
            "benefit_rule_invalid_name",
            "benefit_rule_invalid_description",
            "benefit_rule_invalid_formula",
            "benefit_rule_invalid_amount",
            "benefit_rule_invalid_start_date",
            "benefit_rule_invalid_end_date",
            "benefit_rule_invalid_date_range",
            "benefit_rule_invalid_conditions",
            "benefit_rule_recurring_frequency_required",
            "benefit_rule_one_time_invalid_frequency"
        ];

        if (validationErrors.includes(error.message)) {
            return res.status(400).json({
                message: error.message
            });
        }

        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({
                message: "Los datos de la regla no son válidos.",
                errors: error.errors.map((item) => ({
                    field: item.path,
                    message: item.message
                }))
            });
        }

        console.error("Error updating benefit rule:", error);

        return res.status(500).json({
            message: "Error al actualizar la regla de beneficio."
        });
    }
};

export const deleteRule = async (req, res) => {
    try {
        const { business_id } = req.user;
        const { id } = req.params;

        const benefitRule = await deactivateBenefitRule(
            id,
            business_id
        );

        return res.status(200).json({
            message: "Regla de beneficio desactivada correctamente.",
            data: benefitRule
        });

    } catch (error) {
        if (error.message === "benefit_rule_not_found") {
            return res.status(404).json({
                message: error.message
            });
        }

        if (
            [
                "business_id_required", "benefit_rule_invalid_id", "benefit_rule_already_inactive"
            ].includes(error.message)
        ) {
            return res.status(400).json({
                message: error.message
            });
        }

        console.error("Error deactivating benefit rule:", error);

        return res.status(500).json({
            message: "Error al desactivar la regla de beneficio."
        });
    }
};

export const activeRule = async (req, res) => {
    try {
        const { business_id } = req.user;
        const { id } = req.params;

        const benefitRule = await activateBenefitRule(
            id,
            business_id
        );

        return res.status(200).json({
            message: "Regla de beneficio activada correctamente.",
            data: benefitRule
        });

    } catch (error) {
        if (error.message === "benefit_rule_not_found") {
            return res.status(404).json({
                message: error.message
            });
        }

        if (
            [
                "business_id_required", "benefit_rule_invalid_id", "benefit_rule_already_active"
            ].includes(error.message)
        ) {
            return res.status(400).json({
                message: error.message
            });
        }

        console.error("Error activating benefit rule:", error);

        return res.status(500).json({
            message: "Error al activar la regla de beneficio."
        });
    }
};

/* Falta crear el motor de calculo de los beneficios de las reglas generales, la idea es
trabajarlo en base a los tipos del modelo que ya estan predefinidos y en caso de que el tipo
sea OTHER entonces ahi si trabajar en base a formular y condiciones.*/