
import { Op } from "sequelize";
import sequelize from "../../../../config/database.js";
import EmployeeBenefit from "../../../../models/Worksheet/Benefits/EmployeeBenefits.js";
import EmployeeBenefitTransaction from "../../../../models/Worksheet/Benefits/EmployeeBenefitTransaction.js";
import { employeeBelongsToBusiness } from "../../Employee/EmployeeService.js";
import { getEmployeeEmploymentContext } from "../../Employee/EmploymentService.js";
import { accrueBenefit } from "../BenefitTransactionService.js";
import { getActiveBenefitRules } from "../BenefitRuleService.js";
import { VACATION_DAYS_PER_MONTH } from "../../../../constants/benefitRule.js";

export function roundBalance(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

function addMonths(dateString, months) {
    const [year, month, day] = dateString.split("-").map(Number);

    const targetMonthIndex = month - 1 + months;
    const targetYear = year + Math.floor(targetMonthIndex / 12);
    const normalizedMonth = ((targetMonthIndex % 12) + 12) % 12;

    const lastDay = new Date(
        Date.UTC(targetYear, normalizedMonth + 1, 0)
    ).getUTCDate();

    return [
        targetYear,
        String(normalizedMonth + 1).padStart(2, "0"),
        String(Math.min(day, lastDay)).padStart(2, "0"),
    ].join("-");
}

function getCompletedMonths(startDate, endDate) {
    let months =
        (Number(endDate.slice(0, 4)) - Number(startDate.slice(0, 4))) * 12 +
        (Number(endDate.slice(5, 7)) - Number(startDate.slice(5, 7)));

    if (addMonths(startDate, months) > endDate) {
        months--;
    }

    return Math.max(0, months);
}

export async function calculateEmployeeVacationBenefit({
    business_id, employee_id, calculation_date = new Date().toISOString().slice(0, 10)
}) {
    const belongsToBusiness = await employeeBelongsToBusiness(
        business_id, employee_id
    );

    if (!belongsToBusiness) {
        throw new Error("employee_not_in_business");
    }

    const employmentContext = await getEmployeeEmploymentContext(employee_id);

    if (!employmentContext.has_employment) {
        throw new Error("employee_has_no_employment_history");
    }

    const currentEmployments =
        employmentContext.employment_history.filter((employment) => {
            return (
                employment.start_date <= calculation_date &&
                (!employment.end_date ||
                    employment.end_date >= calculation_date)
            );
        });

    if (currentEmployments.length === 0) {
        throw new Error("employee_has_no_employment_on_calculation_date");
    }

    if (currentEmployments.length > 1) {
        throw new Error("employee_has_ambiguous_employment");
    }

    const rulesContext = await getActiveBenefitRules(business_id, calculation_date);

    const vacationRules = rulesContext.benefit_rules.filter(
        (rule) => rule.type === "VACATION"
    );

    if (vacationRules.length !== 1) {
        throw new Error(
            vacationRules.length === 0
                ? "vacation_benefit_rule_not_found"
                : "vacation_benefit_rule_ambiguous"
        );
    }

    const vacationRule = vacationRules[0];

    const employmentHistory = [
        ...employmentContext.employment_history,
    ].sort((a, b) => a.start_date.localeCompare(b.start_date));

    const firstEmployment = employmentHistory.find(
        (employment) => employment.start_date <= calculation_date
    );

    if (!firstEmployment) {
        throw new Error("employee_start_date_not_found");
    }

    const serviceStartDate = firstEmployment.start_date;

    const completedMonths = getCompletedMonths(
        serviceStartDate,
        calculation_date
    );

    const accruedVacationDays = roundBalance(
        completedMonths * VACATION_DAYS_PER_MONTH
    );

    const targetAccrualDate = addMonths(
        serviceStartDate,
        completedMonths
    );

    const result = await sequelize.transaction(
        async (transaction) => {

            const [benefit] = await EmployeeBenefit.findOrCreate({
                where: {
                    business_id: Number(business_id),
                    employee_id: Number(employee_id),
                    type: "VACATION",
                },
                defaults: {
                    business_id: Number(business_id),
                    employee_id: Number(employee_id),
                    benefit_rule_id: vacationRule.id,
                    type: "VACATION",
                    benefit_mode: "RECURRING",
                    balance: 0,
                    unit: "DAYS",
                    status: "ACTIVE",
                    start_date: serviceStartDate,
                },
                transaction,
            });

            const lockedBenefit = await EmployeeBenefit.findByPk(
                benefit.id,
                {
                    transaction,
                    lock: transaction.LOCK.UPDATE,
                }
            );

            if (!lockedBenefit) {
                throw new Error("employee_benefit_not_found");
            }

            let balance = Number(lockedBenefit.balance);

            const existingTransactions =
                await EmployeeBenefitTransaction.findAll({
                    where: {
                        employee_benefit_id: lockedBenefit.id,
                        transaction_type: "ACCRUAL",
                        period_end_date: {
                            [Op.ne]: null,
                            [Op.lte]: calculation_date,
                        },
                    },
                    order: [["period_end_date", "DESC"]],
                    transaction,
                });

            const vacationTransactions =
                existingTransactions.filter((movement) => {
                    return [
                        "ACUMULACION_INICIAL_DE_VACACIONES",
                        "ACUMULACION_MENSUAL_DE_VACACIONES",
                        "ACUMULACION_POR_PERIODO_DE_VACACIONES",
                        "ACUMULACION_RETROACTIVA_DE_VACACIONES",
                    ].includes(movement.reference_type);
                });

            const transactionsWithEndDate =
                vacationTransactions.filter(
                    (movement) => movement.period_end_date
                );

            const lastTransaction = transactionsWithEndDate[0] || null;

            const lastAccrualDate = lastTransaction
                ? lastTransaction.period_end_date
                : serviceStartDate;

            const recognizedMonths = Math.min(
                completedMonths,
                getCompletedMonths(
                    serviceStartDate,
                    lastAccrualDate
                )
            );

            const pendingMonths = Math.max(
                0,
                completedMonths - recognizedMonths
            );

            const recognizedDays = roundBalance(
                recognizedMonths * VACATION_DAYS_PER_MONTH
            );

            const pendingDays = roundBalance(
                pendingMonths * VACATION_DAYS_PER_MONTH
            );

            if (pendingMonths === 0) {
                return {
                    status: "ALREADY_CALCULATED",
                    message: "all_vacation_periods_already_calculated",
                    data: [],
                    completed_months: completedMonths,
                    recognized_months: recognizedMonths,
                    pending_months: 0,
                    accrued_days: accruedVacationDays,
                    recognized_days: recognizedDays,
                    pending_days: 0,
                    current_balance: balance,
                    last_accrual_date: lastTransaction
                        ? lastAccrualDate
                        : null,
                };
            }

            const periodStartDate = lastAccrualDate;
            const periodEndDate = targetAccrualDate;

            const idempotencyKey =
                `VACATION_ACCRUAL_${lockedBenefit.id}_` +
                `${periodStartDate}_${periodEndDate}`;

            const accrualResult = await accrueBenefit({
                employeeBenefitId: lockedBenefit.id,
                businessId: business_id,
                amount: pendingDays,
                date: periodEndDate,
                referenceType: "ACUMULACION_MENSUAL_DE_VACACIONES",
                referenceId: vacationRule.id,
                idempotencyKey,
                periodStartDate,
                periodEndDate,
                description:
                    `Acumulación de vacaciones correspondiente ` +
                    `del ${periodStartDate} al ${periodEndDate}`,
                transaction,
            });

            const movement = accrualResult.transaction;

            return {
                status: "ACCRUED",
                message: "employee_vacation_calculated_successfully",
                data: [movement.toJSON()],
                completed_months: completedMonths,
                recognized_months: recognizedMonths,
                pending_months: pendingMonths,
                accrued_days: accruedVacationDays,
                recognized_days: recognizedDays,
                pending_days: pendingDays,
                current_balance: Number(accrualResult.benefit.balance),
                last_accrual_date: periodEndDate,
            };
        }
    );

    return result;
}