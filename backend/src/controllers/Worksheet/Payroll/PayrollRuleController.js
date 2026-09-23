import { 
    getPayrollRules, getPayrollRuleById, createPayrollRule, createPayrollRuleVersion, 
    deletePayrollRule, activatePayrollRule
} from "../../../services/Worksheet/Payroll/PayrollRuleService.js";

export const getRules = async (req, res) => {
    try {
        const { business_id, branch_id, rol } = req.user;
        const { page, limit, type, active, code, from, to } = req.query;

        const result = await getPayrollRules({
            page,
            limit,
            type,
            active: active !== undefined
                ? active === "true"
                : undefined,
            code,
            from,
            to,
            businessId: business_id,
            branchId: branch_id,
            rol
        });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};

export const getRuleById = async (req, res) => {
    try {
        const { business_id, branch_id, rol } = req.user;
        const { id } = req.params;

        const payrollRule = await getPayrollRuleById({
            id,
            businessId: business_id,
            branchId: branch_id,
            rol
        });

        return res.status(200).json(payrollRule);
    } catch (error) {
        if (error.message === "payroll_rule_not_found") {
            return res.status(404).json({
                message: error.message
            });
        }
        if (error.message === "branch_required") {
            return res.status(400).json({
                message: error.message
            });
        }
        return res.status(500).json({
            message: error.message
        });
    }
};

export const createRule = async (req, res) => {
    try {
        const { business_id, branch_id, rol, id: userId } = req.user;

        const payrollRule = await createPayrollRule(
            req.body,
            userId,
            business_id,
            branch_id,
            rol
        );

        return res.status(201).json({
            message: "Regla de nómina creada correctamente",
            data: payrollRule
        });

    } catch (error) {
        if (error.message === "branch_required") {
            return res.status(400).json({
                message: error.message
            });
        }

        if (error.message === "Sucursal no encontrada") {
            return res.status(404).json({
                message: error.message
            });
        }

        if (
            [
                "invalid_payroll_rule_calculation",
                "payroll_rule_calculation_missing",
                "payroll_rule_base_type_required",
                "payroll_rule_value_required",
                "payroll_rule_percentage_required",
                "payroll_rule_tiers_required"
            ].includes(error.message)
        ) {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: error.message
        });
    }
};

export const createRuleVersion = async (req, res) => {
    try {
        const { business_id, branch_id, rol, id: userId } = req.user;
        const { id } = req.params;

        const payrollRule = await createPayrollRuleVersion(
            id,
            req.body,
            userId,
            business_id,
            branch_id,
            rol
        );

        return res.status(201).json({
            message: "Nueva versión de la regla creada correctamente",
            data: payrollRule
        });

    } catch (error) {
        if (error.message === "payroll_rule_not_found") {
            return res.status(404).json({
                message: error.message
            });
        }

        if (error.message === "payroll_rule_inactive") {
            return res.status(400).json({
                message: error.message
            });
        }

        if (error.message === "branch_required") {
            return res.status(400).json({
                message: error.message
            });
        }

        if (
            [
                "invalid_payroll_rule_calculation",
                "payroll_rule_calculation_missing",
                "payroll_rule_base_type_required",
                "payroll_rule_value_required",
                "payroll_rule_percentage_required",
                "payroll_rule_tiers_required"
            ].includes(error.message)
        ) {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: error.message
        });
    }
};

export const deleteRule = async (req, res) => {
    try {
        const { business_id, branch_id, rol } = req.user;
        const { id } = req.params;

        const payrollRule = await deletePayrollRule(
            id,
            business_id,
            branch_id,
            rol
        );
        return res.status(200).json({
            message: "Regla de nómina desactivada correctamente",
            data: payrollRule
        });

    } catch (error) {
        if (error.message === "payroll_rule_not_found") {
            return res.status(404).json({
                message: error.message
            });
        }
        if (error.message === "payroll_rule_already_inactive") {
            return res.status(400).json({
                message: error.message
            });
        }
        if (error.message === "branch_required") {
            return res.status(400).json({
                message: error.message
            });
        }
        return res.status(500).json({
            message: error.message
        });
    }
};

export const activeRule = async (req, res) => {
    try {
        const { business_id, branch_id, rol } = req.user;
        const { id } = req.params;

        const payrollRule = await activatePayrollRule(
            id,
            business_id,
            branch_id,
            rol
        );
        return res.status(200).json({
            message: "Regla de nómina desactivada correctamente",
            data: payrollRule
        });

    } catch (error) {
        if (error.message === "payroll_rule_not_found") {
            return res.status(404).json({
                message: error.message
            });
        }
        if (error.message === "payroll_rule_already_active") {
            return res.status(400).json({
                message: error.message
            });
        }
        if (error.message === "branch_required") {
            return res.status(400).json({
                message: error.message
            });
        }
        return res.status(500).json({
            message: error.message
        });
    }
};