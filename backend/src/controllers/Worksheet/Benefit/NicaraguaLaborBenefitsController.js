import { calculateEmployeeVacationBenefit } from "../../../services/Worksheet/Benefit/Nicaragua/NicaraguaVacationsService.js";
import { 
    calculateEmployeeThirteenthMonthBenefit, calculateInitialThirteenthMonthBenefit
} from "../../../services/Worksheet/Benefit/Nicaragua/NicaraguaAguinaldoService,.js";
import { employeeHasThirteenthMonthTransactions, employeeHasIndemnificationTransactions } from "../../../services/Worksheet/Benefit/BenefitTransactionService.js";
import { calculateInitialIndemnificationBenefit, calculateEmployeeIndemnificationBenefit } from "../../../services/Worksheet/Benefit/Nicaragua/NicaraguaIndemnService.js";

export const getEmployeeVacationBenefit = async (req, res) => {
    try {
        const { business_id, employee_id } = req.params;

        const {
            calculation_date,
        } = req.query;

        const result = await calculateEmployeeVacationBenefit({
            business_id,
            employee_id,
            calculation_date: calculation_date || undefined,
        });

        return res.status(200).json({
            success: true,
            message: "employee_vacation_calculated_successfully",
            data: result,
        });

    } catch (error) {
        console.error("Error calculating employee vacation:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "employee_vacation_calculation_error",
        });
    }
};

export const calculateEmployeeThirteenthMonth = async (req, res) => {
    try {
        const { employee_id } = req.params;
        const business_id = req.user.business_id;
        const { calculation_date } = req.body || {};

        if (!employee_id) {
            return res.status(400).json({
                success: false,
                message: "employee_id_required",
            });
        }

        const hasTransactions =
            await employeeHasThirteenthMonthTransactions({
                employee_id,
                business_id,
            });

        let result;

        if (!hasTransactions) {

            result = await calculateInitialThirteenthMonthBenefit({
                business_id,
                employee_id,
                calculation_date,
            });

            return res.status(200).json({
                success: true,
                calculation_type: "INITIAL",
                message: "initial_thirteenth_month_calculation",
                result,
            });
        }

        result = await calculateEmployeeThirteenthMonthBenefit({
            business_id,
            employee_id,
            calculation_date,
        });

        return res.status(200).json({
            success: true,
            calculation_type: "RECURRING",
            message: "thirteenth_month_recalculation",
            result,
        });

    } catch (error) {

        console.error(
            "Error calculating employee thirteenth month:",
            error
        );

        const errors = {
            employee_not_in_business: 404,
            employee_has_no_employment_history: 400,
            employee_has_no_employment_on_calculation_date: 400,
            employee_has_ambiguous_employment: 409,
            thirteenth_month_benefit_rule_not_found: 404,
            thirteenth_month_benefit_rule_ambiguous: 409,
            invalid_thirteenth_month_period: 400,
            employee_has_no_salary_history: 400,
            employee_salary_not_found_for_period: 400,
            employee_salary_is_ambiguous: 400,
            invalid_thirteenth_month_salary: 400,
            employee_benefit_not_found: 404,
            employee_benefit_already_initialized: 409,
        };

        const statusCode = errors[error.message] || 500;

        return res.status(statusCode).json({
            success: false,
            message: error.message || "internal_server_error",
        });
    }
};

export const calculateEmployeeIndemnification = async (req, res) => {
    try {
        const { employee_id } = req.params;
        const { business_id } = req.user;
        const { calculation_date } = req.body || {};

        if (!employee_id) {
            return res.status(400).json({
                success: false,
                message: "employee_id_required",
            });
        }

        const hasTransactions =
            await employeeHasIndemnificationTransactions({
                employee_id,
                business_id,
            });

        let result;

        if (!hasTransactions) {

            result = await calculateInitialIndemnificationBenefit({
                business_id,
                employee_id,
                calculation_date,
            });

            return res.status(200).json({
                success: true,
                calculation_type: "INITIAL",
                message: "initial_indemnification_calculation",
                result,
            });
        }

        result = await calculateEmployeeIndemnificationBenefit({
            business_id,
            employee_id,
            calculation_date,
        });

        return res.status(200).json({
            success: true,
            calculation_type: "RECURRING",
            message: "indemnification_recalculation",
            result,
        });

    } catch (error) {

        console.error(
            "Error calculating employee indemnification:",
            error
        );

        const errors = {
            employee_not_in_business: 404,
            employee_has_no_employment_history: 400,
            employee_has_no_employment_on_calculation_date: 400,
            employee_has_ambiguous_employment: 409,
            employee_not_eligible_for_indemnification: 400,
            indemnification_benefit_rule_not_found: 404,
            indemnification_benefit_rule_ambiguous: 409,
            invalid_indemnification_period: 400,
            invalid_indemnification_days: 400,
            invalid_indemnification_salary: 400,
            invalid_indemnification_amount: 400,
            employee_has_no_salary_history: 400,
            employee_salary_not_found_for_period: 400,
            employee_salary_is_ambiguous: 400,
            employee_benefit_not_found: 404,
            employee_benefit_already_initialized: 409,
        };

        const statusCode = errors[error.message] || 500;

        return res.status(statusCode).json({
            success: false,
            message: error.message || "internal_server_error",
        });
    }
};