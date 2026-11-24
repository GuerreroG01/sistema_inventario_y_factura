import { Op } from "sequelize";
import sequelize from "../../../../config/database.js";
import EmployeeBenefit from "../../../../models/Worksheet/Benefits/EmployeeBenefits.js";
import EmployeeBenefitTransaction from "../../../../models/Worksheet/Benefits/EmployeeBenefitTransaction.js";
import { employeeBelongsToBusiness } from "../../Employee/EmployeeService.js";
import { getEmployeeEmploymentContext } from "../../Employee/EmploymentService.js";
import { accrueBenefit } from "../BenefitTransactionService.js";
import { getActiveBenefitRules } from "../BenefitRuleService.js";
import { roundBalance } from "./NicaraguaVacationsService.js";
import { hasSalaryBaseChanged } from "./NicaraguaAguinaldoService,.js";
import { getEmployeeSalaryContext, getSalaryByEmployeeIdAtDate } from "../../Employee/SalaryService.js";
import { isBenefitCalculationWarning } from "../../../../constants/benefitCalculationWarnings.js";

const addYears = (dateString, years) => {
    const date = new Date(`${dateString}T00:00:00.000Z`);
    const originalDay = date.getUTCDate();
    date.setUTCDate(1);
    date.setUTCFullYear(date.getUTCFullYear() + years);

    const lastDay = new Date(Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        0
    )).getUTCDate();

    date.setUTCDate(Math.min(originalDay, lastDay));

    return date.toISOString().slice(0, 10);
};

export const calculateIndemnificationDays = (startDate, endDate) => {
    if (!startDate || !endDate || endDate < startDate) {
        throw new Error("invalid_indemnification_period");
    }

    const MAX_DAYS = 150;
    const FIRST_YEARS_RATE = 30;
    const ADDITIONAL_YEARS_RATE = 20;

    let accumulatedDays = 0;
    let currentDate = new Date(`${startDate}T00:00:00.000Z`);
    const finalDate = new Date(`${endDate}T00:00:00.000Z`);

    const getDaysInMonth = (year, month) => {
        return new Date(
            Date.UTC(year, month + 1, 0)
        ).getUTCDate();
    };

    const addCalendarMonths = (date, months) => {
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth();
        const day = date.getUTCDate();

        const targetMonth = month + months;
        const targetYear = year + Math.floor(targetMonth / 12);
        const normalizedMonth = targetMonth % 12;

        const lastDay = getDaysInMonth(
            targetYear,
            normalizedMonth
        );

        return new Date(Date.UTC(
            targetYear,
            normalizedMonth,
            Math.min(day, lastDay)
        ));
    };

    const addCalendarYears = (date, years) => {
        return addCalendarMonths(date, years * 12);
    };

    const daysBetween = (start, end) => {
        return Math.round(
            (end.getTime() - start.getTime()) / 86400000
        );
    };

    while (currentDate < finalDate) {
        const workedDaysTotal = daysBetween(
            new Date(`${startDate}T00:00:00.000Z`),
            currentDate
        );

        const serviceYear = Math.floor(
            workedDaysTotal / 365.2425
        ) + 1;

        const annualRate =
            serviceYear <= 3
                ? FIRST_YEARS_RATE
                : ADDITIONAL_YEARS_RATE;

        const nextMonth = addCalendarMonths(currentDate, 1);

        const segmentEnd =
            nextMonth < finalDate
                ? nextMonth
                : finalDate;

        const segmentDays = daysBetween(
            currentDate,
            segmentEnd
        );

        const monthDuration = getDaysInMonth(
            currentDate.getUTCFullYear(),
            currentDate.getUTCMonth()
        );

        accumulatedDays +=
            (annualRate / 12) *
            (segmentDays / monthDuration);

        accumulatedDays = Math.min(
            accumulatedDays,
            MAX_DAYS
        );

        currentDate = segmentEnd;

        if (accumulatedDays >= MAX_DAYS) {
            break;
        }
    }

    return Number(
        Math.min(accumulatedDays, MAX_DAYS).toFixed(6)
    );
};

async function getIndemnificationTransactions({ employee_benefit_id, transaction }) {
    return EmployeeBenefitTransaction.findAll({
        where: {
            employee_benefit_id,
            reference_type: {
                [Op.in]: [
                    "INITIAL_INDEMNIFICATION_ACCRUAL",
                    "INDEMNIFICATION_ACCRUAL",
                    "INDEMNIFICATION_REVERSAL",
                ],
            },
            transaction_type: {
                [Op.in]: ["ACCRUAL", "REVERSAL"],
            },
        },
        order: [
            ["date", "ASC"],
            ["id", "ASC"],
        ],
        transaction,
        lock: transaction.LOCK.UPDATE,
    });
}

function getActiveIndemnificationAccruals(transactions) {
    const accruals = transactions.filter(
        (movement) =>
            movement.transaction_type === "ACCRUAL"
    );

    const reversals = transactions.filter(
        (movement) =>
            movement.transaction_type === "REVERSAL"
    );

    const reversedIds = new Set();

    for (const reversal of reversals) {
        const originalId = Number(
            reversal.reverses_transaction_id
        );

        if (!Number.isInteger(originalId) || originalId <= 0) {
            throw new Error(
                "invalid_indemnification_reversal_reference"
            );
        }

        const originalAccrual = accruals.find(
            (accrual) => Number(accrual.id) === originalId
        );

        if (!originalAccrual) {
            throw new Error(
                "indemnification_original_accrual_not_found"
            );
        }

        if (
            Number(reversal.employee_benefit_id) !==
            Number(originalAccrual.employee_benefit_id)
        ) {
            throw new Error(
                "indemnification_reversal_benefit_mismatch"
            );
        }

        if (reversedIds.has(originalId)) {
            throw new Error(
                "indemnification_duplicate_reversal"
            );
        }

        const originalAmount = Number(originalAccrual.amount);
        const reversalAmount = Number(reversal.amount);

        if (
            !Number.isFinite(originalAmount) ||
            !Number.isFinite(reversalAmount) ||
            originalAmount <= 0 ||
            reversalAmount !== -originalAmount
        ) {
            throw new Error(
                "invalid_indemnification_reversal_amount"
            );
        }

        reversedIds.add(originalId);
    }

    return accruals.filter(
        (movement) =>
            !reversedIds.has(Number(movement.id))
    );
}

async function reverseIndemnificationAccrual({ benefit, accrual, calculationDate, transaction }) {
    if (!transaction) {
        throw new Error(
            "indemnification_transaction_required"
        );
    }

    if (
        Number(accrual.employee_benefit_id) !==
        Number(benefit.id)
    ) {
        throw new Error(
            "indemnification_accrual_benefit_mismatch"
        );
    }

    if (accrual.transaction_type !== "ACCRUAL") {
        throw new Error(
            "invalid_indemnification_accrual_type"
        );
    }

    const amount = Number(accrual.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("invalid_indemnification_accrual_amount");
    }

    const reversalKey = `INDEMNIFICATION_REVERSAL_${accrual.id}`;

    const existingReversal =
        await EmployeeBenefitTransaction.findOne({
            where: {
                idempotency_key: reversalKey,
            },
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

    if (existingReversal) {
        if (
            existingReversal.transaction_type !== "REVERSAL" ||
            Number(existingReversal.reverses_transaction_id) !==
                Number(accrual.id) ||
            Number(existingReversal.amount) !== -amount
        ) {
            throw new Error(
                "invalid_existing_indemnification_reversal"
            );
        }

        return {
            transaction: existingReversal,
            already_reversed: true,
            benefit,
        };
    }

    const previousReversal =
        await EmployeeBenefitTransaction.findOne({
            where: {
                reverses_transaction_id: accrual.id,
                transaction_type: "REVERSAL",
            },
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

    if (previousReversal) {
        throw new Error(
            "indemnification_accrual_already_reversed"
        );
    }

    const lockedBenefit =
        await EmployeeBenefit.findByPk(benefit.id, {
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

    if (!lockedBenefit) {
        throw new Error("employee_benefit_not_found");
    }

    const balanceBefore = Number(lockedBenefit.balance);

    if (
        !Number.isFinite(balanceBefore) ||
        balanceBefore < 0
    ) {
        throw new Error(
            "invalid_indemnification_balance"
        );
    }

    if (balanceBefore < amount) {
        throw new Error(
            "indemnification_accrual_already_used"
        );
    }

    const balanceAfter = roundBalance(
        balanceBefore - amount
    );

    const reversal =
        await EmployeeBenefitTransaction.create(
            {
                employee_benefit_id: lockedBenefit.id,
                transaction_type: "REVERSAL",
                amount: -amount,
                balance_before: balanceBefore,
                balance_after: balanceAfter,
                date: calculationDate,
                reference_type:
                    "INDEMNIFICATION_SALARY_REVERSAL",
                reference_id: accrual.id,
                idempotency_key: reversalKey,
                reverses_transaction_id: accrual.id,
                period_start_date:
                    accrual.period_start_date,
                period_end_date:
                    accrual.period_end_date,
                description:
                    `Reversión de acumulación de indemnización ` +
                    `${accrual.id} por cambio de salario`,
            },
            { transaction }
        );

    await lockedBenefit.update(
        {
            balance: balanceAfter,
        },
        { transaction }
    );

    return {
        transaction: reversal,
        already_reversed: false,
        benefit: lockedBenefit,
    };
}

export async function calculateInitialIndemnificationBenefit({
    business_id, employee_id, calculation_date = new Date().toISOString().slice(0, 10),
}) {
    try {
        const belongsToBusiness = await employeeBelongsToBusiness(
            business_id,
            employee_id
        );

        if (!belongsToBusiness) {
            throw new Error("employee_not_in_business");
        }

        const employmentContext = await getEmployeeEmploymentContext(
            employee_id
        );

        if (!employmentContext.has_employment) {
            throw new Error("employee_has_no_employment_history");
        }

        const currentEmployments =
            employmentContext.employment_history.filter((employment) => {
                return (
                    employment.start_date <= calculation_date &&
                    (!employment.end_date || employment.end_date >= calculation_date)
                );
            });

        if (currentEmployments.length === 0) {
            throw new Error(
                "employee_has_no_employment_on_calculation_date"
            );
        }

        if (currentEmployments.length > 1) {
            throw new Error("employee_has_ambiguous_employment");
        }

        const employment = currentEmployments[0];

        if (
            !["FULL_TIME", "PART_TIME"].includes(
                employment.employment_type
            )
        ) {
            throw new Error(
                "employee_not_eligible_for_indemnification"
            );
        }

        const rulesContext = await getActiveBenefitRules(
            business_id,
            calculation_date
        );

        const indemnificationRules =
            rulesContext.benefit_rules.filter(
                (rule) => rule.type === "SEVERANCE"
            );

        if (indemnificationRules.length !== 1) {
            throw new Error(
                indemnificationRules.length === 0
                    ? "indemnification_benefit_rule_not_found"
                    : "indemnification_benefit_rule_ambiguous"
            );
        }

        const indemnificationRule = indemnificationRules[0];

        const indemnificationDays = calculateIndemnificationDays(
            employment.start_date,
            calculation_date
        );

        if (indemnificationDays <= 0) {
            throw new Error("invalid_indemnification_days");
        }
        const salaryContext = await getEmployeeSalaryContext(employee_id);


        if (!salaryContext.has_salary_history) {
            throw new Error("employee_has_no_salary_history");
        }

        const salaryRecord = salaryContext.salary_history.find((record) => {
            return (
                record.effective_from <= calculation_date &&
                (!record.effective_to ||
                    record.effective_to >= calculation_date)
            );
        });

        if (!salaryRecord) {
            throw new Error("employee_salary_not_found_for_period");
        }

        const salaryBase = Number(salaryRecord.monthly_salary);
        if ( !Number.isFinite(salaryBase) || salaryBase <= 0 ) {
            throw new Error("invalid_indemnification_salary");
        }

        const dailySalary = salaryBase / 30;
        const totalAccrued = roundBalance( dailySalary * indemnificationDays );

        if (totalAccrued <= 0) {
            throw new Error("invalid_indemnification_amount");
        }

        return await sequelize.transaction(async (transaction) => {
            const [benefit] = await EmployeeBenefit.findOrCreate({
                where: {
                    business_id: Number(business_id),
                    employee_id: Number(employee_id),
                    type: "SEVERANCE",
                },
                defaults: {
                    business_id: Number(business_id),
                    employee_id: Number(employee_id),
                    benefit_rule_id: indemnificationRule.id,
                    type: "SEVERANCE",
                    benefit_mode: "ONE_TIME",
                    balance: 0,
                    unit: "CURRENCY",
                    status: "ACTIVE",
                    start_date: employment.start_date,
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

            const existingTransactions =
                await getIndemnificationTransactions({
                    employee_benefit_id: lockedBenefit.id,
                    transaction,
                });

            const activeAccruals =
                getActiveIndemnificationAccruals(
                    existingTransactions
                );

            if (activeAccruals.length > 0) {
                return {
                    status: "ALREADY_CALCULATED",
                    message: "indemnification_already_calculated",
                    data: [],
                    employment_start_date: employment.start_date,
                    calculation_date,
                    indemnification_days: indemnificationDays,
                    salary_base: salaryBase,
                    accrued_amount: 0,
                    current_balance: Number(lockedBenefit.balance),
                };
            }

            const idempotencyKey =
                `INITIAL_INDEMNIFICATION_${lockedBenefit.id}_` +
                `${employment.start_date}`;

            const accrualResult = await accrueBenefit({
                employeeBenefitId: lockedBenefit.id,
                businessId: business_id,
                amount: totalAccrued,
                date: calculation_date,
                referenceType: "INITIAL_INDEMNIFICATION_ACCRUAL",
                referenceId: indemnificationRule.id,
                idempotencyKey,
                periodStartDate: employment.start_date,
                periodEndDate: calculation_date,
                description:
                    `Acumulación inicial de indemnización correspondiente ` +
                    `a ${indemnificationDays.toFixed(4)} días de salario, ` +
                    `desde ${employment.start_date} hasta ${calculation_date}`,
                transaction,
            });

            const finalResult = {
                status: "ACCRUED",
                message: "employee_indemnification_calculated_successfully",
                data: [accrualResult.transaction.toJSON()],
                employment_start_date: employment.start_date,
                calculation_date,
                employment_type: employment.employment_type,
                salary_base: salaryBase,
                daily_salary: roundBalance(dailySalary),
                indemnification_days: indemnificationDays,
                maximum_indemnification_days: 150,
                accrued_amount: totalAccrued,
                current_balance: Number(accrualResult.benefit.balance),
                salary_history_id: salaryContext.salary_history_id,
            };
            return finalResult;
        });

    } catch (error) {
        if (isBenefitCalculationWarning(error.message)) {
            throw error;
        }
        console.error("[INITIAL ERROR] Error dentro del cálculo inicial");
        console.error("[INITIAL ERROR] Mensaje:", error.message);
        console.error("[INITIAL ERROR] Stack:", error.stack);
        throw error;
    }
}

export async function calculateEmployeeIndemnificationBenefit({
    business_id, employee_id, calculation_date = new Date().toISOString().slice(0, 10),
}) {
    const belongsToBusiness = await employeeBelongsToBusiness( business_id, employee_id );

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
        throw new Error(
            "employee_has_no_employment_on_calculation_date"
        );
    }

    if (currentEmployments.length > 1) {
        throw new Error("employee_has_ambiguous_employment");
    }

    const employment = currentEmployments[0];

    if (
        !["FULL_TIME", "PART_TIME"].includes(
            employment.employment_type
        )
    ) {
        throw new Error(
            "employee_not_eligible_for_indemnification"
        );
    }

    const rulesContext = await getActiveBenefitRules( business_id, calculation_date );

    const indemnificationRules =
        rulesContext.benefit_rules.filter(
            (rule) => rule.type === "SEVERANCE"
        );

    if (indemnificationRules.length !== 1) {
        throw new Error(
            indemnificationRules.length === 0
                ? "indemnification_benefit_rule_not_found"
                : "indemnification_benefit_rule_ambiguous"
        );
    }

    const indemnificationRule = indemnificationRules[0];

    const currentSalaryBase =
        await getSalaryByEmployeeIdAtDate({
            employee_id,
            business_id,
            calculation_date,
        });

    const salaryBase = Number(currentSalaryBase.salary);

    if (!Number.isFinite(salaryBase) || salaryBase <= 0) {
        throw new Error("invalid_indemnification_salary");
    }

    const totalIndemnificationDays =
        calculateIndemnificationDays(
            employment.start_date,
            calculation_date
        );

    if (totalIndemnificationDays <= 0) {
        throw new Error(
            "invalid_indemnification_days"
        );
    }

    const MAX_INDEMNIFICATION_DAYS = 150;
    const dailySalary = salaryBase / 30;

    const result = await sequelize.transaction(
        async (transaction) => {
            const [benefit] = await EmployeeBenefit.findOrCreate({
                where: {
                    business_id: Number(business_id),
                    employee_id: Number(employee_id),
                    type: "SEVERANCE",
                },
                defaults: {
                    business_id: Number(business_id),
                    employee_id: Number(employee_id),
                    benefit_rule_id: indemnificationRule.id,
                    type: "SEVERANCE",
                    benefit_mode: "ONE_TIME",
                    balance: 0,
                    unit: "CURRENCY",
                    status: "ACTIVE",
                    start_date: employment.start_date,
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

            const existingTransactions =
                await getIndemnificationTransactions({
                    employee_benefit_id: lockedBenefit.id,
                    period_start_date: employment.start_date,
                    period_end_date: calculation_date,
                    transaction,
                });

            const allActiveAccruals =
                getActiveIndemnificationAccruals(
                    existingTransactions
                );

            const periodAccruals = allActiveAccruals.filter(
                (movement) => {
                    return (
                        movement.period_start_date &&
                        movement.period_end_date &&
                        movement.period_start_date <= calculation_date &&
                        movement.period_end_date >= employment.start_date
                    );
                }
            );

            const salaryChanged = hasSalaryBaseChanged( periodAccruals, currentSalaryBase );
            let reversedTransactions = [];
            if (salaryChanged) {
                for (const accrual of periodAccruals) {
                    const reversalResult =
                        await reverseIndemnificationAccrual({
                            benefit: lockedBenefit,
                            accrual,
                            calculationDate: calculation_date,
                            transaction,
                        });
                    if (!reversalResult.already_reversed) {
                        reversedTransactions.push(
                            reversalResult.transaction
                        );
                    }
                }
            }

            const activePeriodAccruals = salaryChanged
                ? []
                : periodAccruals;

            let lastRecognizedDate = null;

            if (activePeriodAccruals.length > 0) {
                lastRecognizedDate = activePeriodAccruals.reduce(
                    (latest, movement) => {
                        return movement.period_end_date > latest
                            ? movement.period_end_date
                            : latest;
                    },
                    employment.start_date
                );
            }

            const recognizedDays = lastRecognizedDate
                ? calculateIndemnificationDays(
                    employment.start_date,
                    lastRecognizedDate
                )
                : 0;

            const pendingDays = Math.max(
                0,
                Math.min(
                    totalIndemnificationDays -
                        recognizedDays,
                    MAX_INDEMNIFICATION_DAYS -
                        recognizedDays
                )
            );

            const currentBalance = Number(
                lockedBenefit.balance
            );

            if (pendingDays <= 0) {
                const lastTransaction =
                    existingTransactions[
                        existingTransactions.length - 1
                    ] || null;
                return {
                    status: "ALREADY_CALCULATED",
                    message: "indemnification_already_calculated",
                    data: [],
                    reversals: reversedTransactions.map(
                        (movement) => movement.toJSON()
                    ),
                    employment_start_date: employment.start_date,
                    calculation_date,
                    salary_base: salaryBase,
                    total_indemnification_days: totalIndemnificationDays,
                    recognized_days: recognizedDays,
                    pending_days: 0,
                    maximum_indemnification_days: MAX_INDEMNIFICATION_DAYS,
                    accrued_amount: 0,
                    salary_changed: salaryChanged,
                    salary_history_id: currentSalaryBase.salary_history_id,
                    current_balance: Number(lockedBenefit.balance),
                    last_accrual_date: lastRecognizedDate ||
                        (lastTransaction
                            ? lastTransaction.period_end_date
                            : null),
                };
            }

            const totalAccrued = roundBalance( dailySalary * pendingDays );

            if (
                !Number.isFinite(totalAccrued) ||
                totalAccrued <= 0
            ) {
                throw new Error(
                    "invalid_indemnification_amount"
                );
            }
            const firstPendingDate = salaryChanged
                ? employment.start_date
                : lastRecognizedDate || employment.start_date;

            const lastPendingDate = calculation_date;

            const idempotencyKey =
                `INDEMNIFICATION_CUMULATIVE_${lockedBenefit.id}_` +
                `${currentSalaryBase.salary_history_id}_` +
                `${firstPendingDate}_${lastPendingDate}`;

            const accrualResult = await accrueBenefit({
                employeeBenefitId: lockedBenefit.id,
                businessId: business_id,
                amount: totalAccrued,
                date: lastPendingDate,
                referenceType: "INDEMNIFICATION_CUMULATIVE_ACCRUAL",
                referenceId: indemnificationRule.id,
                idempotencyKey,
                periodStartDate: firstPendingDate,
                periodEndDate: lastPendingDate,
                description:
                    `Acumulación de indemnización correspondiente ` +
                    `del ${firstPendingDate} al ${lastPendingDate}. ` +
                    `Salario base: ${salaryBase}. ` +
                    `Días acumulados: ${totalIndemnificationDays.toFixed(4)}. ` +
                    `Tope: ${MAX_INDEMNIFICATION_DAYS} días.`,

                transaction,
            });

            return {
                status: salaryChanged
                    ? "RECALCULATED"
                    : "ACCRUED",
                message: salaryChanged
                    ? "employee_indemnification_recalculated_after_salary_change"
                    : "employee_indemnification_calculated_successfully",
                data: [
                    accrualResult.transaction.toJSON(),
                ],
                reversals: reversedTransactions.map(
                    (movement) => movement.toJSON()
                ),
                employment_start_date: employment.start_date,
                calculation_date,
                employment_type: employment.employment_type,
                salary_base: salaryBase,
                daily_salary: roundBalance(dailySalary),
                salary_history_id: currentSalaryBase.salary_history_id,
                total_indemnification_days: totalIndemnificationDays,
                recognized_days: recognizedDays,
                pending_days: pendingDays,
                maximum_indemnification_days: MAX_INDEMNIFICATION_DAYS,
                accrued_amount: totalAccrued,
                salary_changed: salaryChanged,
                previous_balance: currentBalance,
                current_balance: Number(accrualResult.benefit.balance),
                first_pending_date: firstPendingDate,
                last_accrual_date: lastPendingDate,
            };
        }
    );
    return result;
}