
import { getEmployeeSalaryContext } from "../services/Worksheet/Employee/SalaryService.js";
import { getEmployeeEmploymentContext } from "../services/Worksheet/Employee/EmploymentService.js";

// Comprueba si existe historial salarial aplicable al período indicado.
const hasValidSalaryHistory = async ({ employee_id, period, transaction }) => {

    if (!period) {
        throw new Error("benefit_period_required");
    }

    const year = Number(period);

    if (!Number.isInteger(year) || year < 1900 || year > 9999) {
        throw new Error("invalid_benefit_period");
    }

    const { has_salary_history, salary_history } =
        await getEmployeeSalaryContext(employee_id, { transaction });

    if (!has_salary_history || !salary_history.length) {
        return false;
    }

    const periodStart = new Date(Date.UTC(year, 0, 1));
    const periodEnd = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

    return salary_history.some((record) => {

        if (!record.effective_from) {
            return false;
        }

        const effectiveFrom = new Date(record.effective_from);

        const effectiveTo = record.effective_to
            ? new Date(record.effective_to)
            : null;

        if (
            Number.isNaN(effectiveFrom.getTime()) ||
            (effectiveTo && Number.isNaN(effectiveTo.getTime()))
        ) {
            return false;
        }

        const startsBeforePeriodEnds =
            effectiveFrom <= periodEnd;

        const endsAfterPeriodStarts =
            !effectiveTo || effectiveTo >= periodStart;

        return startsBeforePeriodEnds && endsAfterPeriodStarts;
    });
};

const hasValidEmploymentHistory = async ({ employee_id, period, transaction }) => {

    if (!period) {
        throw new Error("benefit_period_required");
    }

    const year = Number(period);

    if (!Number.isInteger(year) || year < 1900 || year > 9999) {
        throw new Error("invalid_benefit_period");
    }

    const employmentContext =
        await getEmployeeEmploymentContext(employee_id, {
            transaction
        });

    const employmentHistory = employmentContext.employment_history;

    if ( !employmentContext.has_employment || !employmentHistory.length ) {
        return false;
    }

    const periodStart = `${year}-01-01`;
    const periodEnd = `${year}-12-31`;

    return employmentHistory.some((employment) => {

        if (!employment.start_date) {
            return false;
        }

        const effectiveFrom = employment.start_date;
        const effectiveTo = employment.end_date || null;

        const startsBeforePeriodEnds =
            effectiveFrom <= periodEnd;

        const endsAfterPeriodStarts =
            !effectiveTo || effectiveTo >= periodStart;

        return (
            startsBeforePeriodEnds &&
            endsAfterPeriodStarts
        );
    });
};

const resolveSalaryHistory = async ({ business_id, employee_id, period, benefit_type, transaction }) => {
    return await hasValidSalaryHistory({
        business_id,
        employee_id,
        period,
        benefit_type,
        transaction
    });
};

const resolveEmploymentHistory = async ({ employee_id, period, transaction }) => {
    return await hasValidEmploymentHistory({
        employee_id,
        period,
        transaction
    });
};

export const BENEFIT_ISSUE_RESOLVERS = {
    employee_salary_history_not_found: resolveSalaryHistory,
    employee_has_no_salary_history: resolveSalaryHistory,
    employee_has_no_employment_history: resolveEmploymentHistory,
    employee_has_no_employment_on_calculation_date: resolveEmploymentHistory
};