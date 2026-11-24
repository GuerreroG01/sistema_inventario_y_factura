
import { Op } from "sequelize";
import sequelize from "../../../../config/database.js";
import EmployeeBenefit from "../../../../models/Worksheet/Benefits/EmployeeBenefits.js";
import EmployeeBenefitTransaction from "../../../../models/Worksheet/Benefits/EmployeeBenefitTransaction.js";
import { employeeBelongsToBusiness } from "../../Employee/EmployeeService.js";
import { getEmployeeEmploymentContext } from "../../Employee/EmploymentService.js";
import { accrueBenefit } from "../BenefitTransactionService.js";
import { getActiveBenefitRules } from "../BenefitRuleService.js";
import { getEmployeeSalaryContext } from "../../Employee/SalaryService.js";
import { roundBalance } from "./NicaraguaVacationsService.js";

function getDaysBetween(startDate, endDate) {
    const start = new Date(`${startDate}T00:00:00Z`);
    const end = new Date(`${endDate}T00:00:00Z`);

    return Math.max(
        0,
        Math.floor((end - start) / 86400000) + 1
    );
}

function getThirteenthMonthPeriod(calculationDate) {
    const year = Number(calculationDate.slice(0, 4));
    const month = Number(calculationDate.slice(5, 7));

    const periodYear = month >= 12 ? year : year - 1;

    return {
        start_date: `${periodYear}-12-01`,
        end_date: `${periodYear + 1}-11-30`,
    };
}

function getDaysInPeriod(startDate, endDate) {
    return getDaysBetween(startDate, endDate);
}

async function getThirteenthMonthSalaryBase({ employee_id, calculation_date }) {
    const salaryContext =
        await getEmployeeSalaryContext(employee_id);

    if (!salaryContext.has_salary_history) {
        throw new Error("employee_has_no_salary_history");
    }

    const applicableSalaries =
        salaryContext.salary_history.filter((record) => {
            return (
                record.effective_from <= calculation_date &&
                (
                    !record.effective_to ||
                    record.effective_to >= calculation_date
                )
            );
        });

    if (applicableSalaries.length === 0) {
        throw new Error(
            "employee_salary_not_found_for_period"
        );
    }

    if (applicableSalaries.length > 1) {
        throw new Error(
            "employee_salary_is_ambiguous"
        );
    }

    const salaryRecord = applicableSalaries[0];

    return {
        salary: salaryRecord.monthly_salary,
        salary_history_id: salaryRecord.id,
        salary_type: salaryRecord.salary_type,
        effective_from: salaryRecord.effective_from,
        effective_to: salaryRecord.effective_to,
    };
}

async function getThirteenthMonthTransactions({ employee_benefit_id, transaction }) {
    return EmployeeBenefitTransaction.findAll({
        where: {
            employee_benefit_id,
            reference_type: {
                [Op.in]: [
                    "THIRTEENTH_MONTH_MONTHLY_ACCRUAL",
                    "THIRTEENTH_MONTH_CUMULATIVE_ACCRUAL",
                    "THIRTEENTH_MONTH_SALARY_REVERSAL",
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

function getActiveThirteenthMonthAccruals(transactions) {
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
                "invalid_thirteenth_month_reversal_reference"
            );
        }

        const originalAccrual = accruals.find(
            (accrual) => Number(accrual.id) === originalId
        );

        if (!originalAccrual) {
            throw new Error(
                "thirteenth_month_original_accrual_not_found"
            );
        }

        if (
            Number(reversal.employee_benefit_id) !==
            Number(originalAccrual.employee_benefit_id)
        ) {
            throw new Error(
                "thirteenth_month_reversal_benefit_mismatch"
            );
        }

        if (reversedIds.has(originalId)) {
            throw new Error(
                "thirteenth_month_duplicate_reversal"
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
                "invalid_thirteenth_month_reversal_amount"
            );
        }

        reversedIds.add(originalId);
    }

    return accruals.filter(
        (movement) =>
            !reversedIds.has(Number(movement.id))
    );
}

export function hasSalaryBaseChanged( activeAccruals, currentSalaryBase ) {
    if (activeAccruals.length === 0) {
        return false;
    }

    const expectedSalaryMarker =
        `_${currentSalaryBase.salary_history_id}_`;

    return activeAccruals.some((movement) => {
        return !movement.idempotency_key?.includes(
            expectedSalaryMarker
        );
    });
}

async function reverseThirteenthMonthAccrual({
    benefit,
    accrual,
    calculationDate,
    transaction,
}) {
    if (!transaction) {
        throw new Error(
            "thirteenth_month_transaction_required"
        );
    }

    if (
        Number(accrual.employee_benefit_id) !==
        Number(benefit.id)
    ) {
        throw new Error(
            "thirteenth_month_accrual_benefit_mismatch"
        );
    }

    if (accrual.transaction_type !== "ACCRUAL") {
        throw new Error(
            "invalid_thirteenth_month_accrual_type"
        );
    }

    const amount = Number(accrual.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("invalid_accrual_amount");
    }

    const reversalKey =
        `THIRTEENTH_MONTH_REVERSAL_${accrual.id}`;

    // Comprobar si ya existe una reversión.
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
                "invalid_existing_thirteenth_month_reversal"
            );
        }

        return {
            transaction: existingReversal,
            already_reversed: true,
            benefit,
        };
    }

    // Comprobar que no exista otra reversión
    // que apunte a la misma acumulación.
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
            "thirteenth_month_accrual_already_reversed"
        );
    }

    // Bloquear y consultar nuevamente el beneficio.
    const lockedBenefit =
        await EmployeeBenefit.findByPk(benefit.id, {
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

    if (!lockedBenefit) {
        throw new Error("employee_benefit_not_found");
    }

    const balanceBefore = Number(lockedBenefit.balance);

    if (!Number.isFinite(balanceBefore) || balanceBefore < 0) {
        throw new Error("invalid_thirteenth_month_balance");
    }

    // No permitir que la reversión genere un saldo negativo.
    if (balanceBefore < amount) {
        throw new Error(
            "thirteenth_month_accrual_already_used"
        );
    }

    const balanceAfter = roundBalance(
        balanceBefore - amount
    );

    // Registrar reversión.
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
                    "THIRTEENTH_MONTH_SALARY_REVERSAL",
                reference_id: accrual.id,
                idempotency_key: reversalKey,
                reverses_transaction_id: accrual.id,
                period_start_date:
                    accrual.period_start_date,
                period_end_date:
                    accrual.period_end_date,
                description:
                    `Reversión de acumulación ${accrual.id} ` +
                    `por cambio de salario`,
            },
            { transaction }
        );

    // Actualizar saldo del beneficio.
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

function getMonthStartDate(date) {
    return `${date.slice(0, 7)}-01`;
}

function getMonthEndDate(date) {
    const [year, month] = date.split("-").map(Number);

    const lastDay = new Date(
        Date.UTC(year, month, 0)
    ).getUTCDate();

    return `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
}

function addOneMonth(date) {
    const [year, month] = date.split("-").map(Number);

    return `${year + Math.floor(month / 12)}-${String((month % 12) + 1).padStart(2, "0")}-01`;
}

export async function calculateInitialThirteenthMonthBenefit({
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

    const rulesContext = await getActiveBenefitRules( business_id, calculation_date );

    const thirteenthMonthRules =
        rulesContext.benefit_rules.filter(
            (rule) => rule.type === "THIRTEENTH_MONTH"
        );

    if (thirteenthMonthRules.length !== 1) {
        throw new Error(
            thirteenthMonthRules.length === 0
                ? "thirteenth_month_benefit_rule_not_found"
                : "thirteenth_month_benefit_rule_ambiguous"
        );
    }

    const thirteenthMonthRule = thirteenthMonthRules[0];

    const period = getThirteenthMonthPeriod(calculation_date);

    const periodStartDate =
        employment.start_date > period.start_date
            ? employment.start_date
            : period.start_date;

    const periodEndDate =
        employment.end_date &&
        employment.end_date < period.end_date
            ? employment.end_date
            : period.end_date;

    if (periodStartDate > periodEndDate) {
        throw new Error("invalid_thirteenth_month_period");
    }

    const targetDate =
        calculation_date < periodEndDate
            ? calculation_date
            : periodEndDate;

    return sequelize.transaction(async (transaction) => {

        const [benefit] = await EmployeeBenefit.findOrCreate({
            where: {
                business_id: Number(business_id),
                employee_id: Number(employee_id),
                type: "THIRTEENTH_MONTH",
            },
            defaults: {
                business_id: Number(business_id),
                employee_id: Number(employee_id),
                benefit_rule_id: thirteenthMonthRule.id,
                type: "THIRTEENTH_MONTH",
                benefit_mode: "RECURRING",
                balance: 0,
                unit: "CURRENCY",
                status: "ACTIVE",
                start_date: periodStartDate,
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
            await getThirteenthMonthTransactions({
                employee_benefit_id: lockedBenefit.id,
                transaction,
            });

        const activeAccruals =
            getActiveThirteenthMonthAccruals(
                existingTransactions
            );

        const recognizedMonthsSet = new Set();

        for (const accrual of activeAccruals) {

            if (
                !accrual.period_start_date ||
                !accrual.period_end_date
            ) {
                continue;
            }

            let monthCursor = getMonthStartDate(
                accrual.period_start_date
            );

            while (monthCursor <= accrual.period_end_date) {

                recognizedMonthsSet.add(
                    monthCursor.slice(0, 7)
                );

                monthCursor = addOneMonth(monthCursor);
            }
        }

        let cursor = getMonthStartDate(periodStartDate);

        const monthlyBreakdown = [];

        let recognizedMonths = 0;
        let pendingMonths = 0;
        let totalAccrued = 0;
        let firstPendingDate = null;
        let lastPendingDate = null;

        const salaryContext = await getEmployeeSalaryContext(
            Number(employee_id)
        );

        if (!salaryContext.has_salary_history) {
            throw new Error("employee_salary_history_not_found");
        }

        const salaryHistory = salaryContext.salary_history;

        while (cursor <= targetDate) {

            const calendarMonthStart = cursor;
            const calendarMonthEnd = getMonthEndDate(cursor);

            const monthlyStartDate =
                calendarMonthStart < periodStartDate
                    ? periodStartDate
                    : calendarMonthStart;

            const monthlyEndDate = [
                calendarMonthEnd,
                periodEndDate,
                targetDate,
            ].reduce((earliest, date) =>
                date < earliest ? date : earliest
            );

            const applicableSalaries = salaryHistory.filter((record) => {
                return (
                    record.effective_from <= monthlyEndDate &&
                    (
                        !record.effective_to ||
                        record.effective_to >= monthlyEndDate
                    )
                );
            });

            if (applicableSalaries.length === 0) {
                throw new Error("employee_salary_not_found_for_period");
            }

            if (applicableSalaries.length > 1) {
                throw new Error("employee_salary_is_ambiguous");
            }

            const applicableSalary = applicableSalaries[0];

            const salaryBase = Number(
                applicableSalary.monthly_salary
            );

            const monthKey = cursor.slice(0, 7);

            if (recognizedMonthsSet.has(monthKey)) {
                recognizedMonths++;
                cursor = addOneMonth(cursor);
                continue;
            }

            if (
                !Number.isFinite(salaryBase) ||
                salaryBase <= 0
            ) {
                throw new Error(
                    "invalid_thirteenth_month_salary"
                );
            }

            const workedDays = getDaysBetween(
                monthlyStartDate,
                monthlyEndDate
            );

            const totalMonthDays = getDaysInPeriod(
                calendarMonthStart,
                calendarMonthEnd
            );

            if (workedDays <= 0 || totalMonthDays <= 0) {
                throw new Error(
                    "invalid_thirteenth_month_period"
                );
            }

            const monthlyAmount = roundBalance(
                (salaryBase / 12) *
                (workedDays / totalMonthDays)
            );

            if (monthlyAmount > 0) {

                pendingMonths++;

                totalAccrued = roundBalance(
                    totalAccrued + monthlyAmount
                );

                if (!firstPendingDate) {
                    firstPendingDate = monthlyStartDate;
                }

                lastPendingDate = monthlyEndDate;

                monthlyBreakdown.push({
                    month: monthKey,
                    period_start_date: monthlyStartDate,
                    period_end_date: monthlyEndDate,
                    worked_days: workedDays,
                    total_month_days: totalMonthDays,
                    salary_base: salaryBase,
                    salary_history_id:
                        salaryContext.salary_history_id,
                    accrued_amount: monthlyAmount,
                });
            }

            cursor = addOneMonth(cursor);
        }

        if (pendingMonths === 0) {
            return {
                status: "ALREADY_CALCULATED",
                message: "thirteenth_month_already_calculated",
                data: [],
                monthly_breakdown: [],
                period_start_date: periodStartDate,
                period_end_date: periodEndDate,
                recognized_months: recognizedMonths,
                pending_months: 0,
                accrued_amount: 0,
                current_balance: Number(lockedBenefit.balance),
            };
        }

        const idempotencyKey =
            `THIRTEENTH_MONTH_CUMULATIVE_${lockedBenefit.id}_` +
            `${firstPendingDate}_${lastPendingDate}`;

        const accrualResult = await accrueBenefit({
            employeeBenefitId: lockedBenefit.id,
            businessId: business_id,
            amount: totalAccrued,
            date: lastPendingDate,
            referenceType:
                "THIRTEENTH_MONTH_CUMULATIVE_ACCRUAL",
            referenceId: thirteenthMonthRule.id,
            idempotencyKey,
            periodStartDate: firstPendingDate,
            periodEndDate: lastPendingDate,
            description:
                `Acumulación inicial de décimo tercer mes correspondiente ` +
                `del ${firstPendingDate} al ${lastPendingDate}`,
            transaction,
        });

        return {
            status: "ACCRUED",
            message:
                "employee_thirteenth_month_calculated_successfully",
            data: [
                accrualResult.transaction.toJSON(),
            ],
            monthly_breakdown: monthlyBreakdown,
            period_start_date: periodStartDate,
            period_end_date: periodEndDate,
            recognized_months: recognizedMonths,
            pending_months: pendingMonths,
            accrued_amount: totalAccrued,
            current_balance: Number(
                accrualResult.benefit.balance
            ),
            last_accrual_date: lastPendingDate,
        };
    });
}

export async function calculateEmployeeThirteenthMonthBenefit({
    business_id, employee_id, calculation_date = new Date().toISOString().slice(0, 10),
}) {
    const belongsToBusiness = await employeeBelongsToBusiness( business_id, employee_id);

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

    const employment = currentEmployments[0];

    const rulesContext = await getActiveBenefitRules(
        business_id,
        calculation_date
    );

    const thirteenthMonthRules =
        rulesContext.benefit_rules.filter(
            (rule) => rule.type === "THIRTEENTH_MONTH"
        );

    if (thirteenthMonthRules.length !== 1) {
        throw new Error(
            thirteenthMonthRules.length === 0
                ? "thirteenth_month_benefit_rule_not_found"
                : "thirteenth_month_benefit_rule_ambiguous"
        );
    }

    const thirteenthMonthRule = thirteenthMonthRules[0];
    const period = getThirteenthMonthPeriod(calculation_date);

    const periodStartDate =
        employment.start_date > period.start_date
            ? employment.start_date
            : period.start_date;

    const periodEndDate =
        employment.end_date &&
        employment.end_date < period.end_date
            ? employment.end_date
            : period.end_date;

    if (periodStartDate > periodEndDate) {
        throw new Error("invalid_thirteenth_month_period");
    }

    const targetDate =
        calculation_date < periodEndDate
            ? calculation_date
            : periodEndDate;

    const finalAccrualDate = targetDate;

    const currentSalaryBase =
        await getThirteenthMonthSalaryBase({
            employee_id,
            calculation_date,
        });

    const salaryBase = Number(currentSalaryBase.salary);

    if (!Number.isFinite(salaryBase) || salaryBase <= 0) {
        throw new Error("invalid_thirteenth_month_salary");
    }

    const result = await sequelize.transaction(
        async (transaction) => {

            const [benefit] = await EmployeeBenefit.findOrCreate({
                where: {
                    business_id: Number(business_id),
                    employee_id: Number(employee_id),
                    type: "THIRTEENTH_MONTH",
                },
                defaults: {
                    business_id: Number(business_id),
                    employee_id: Number(employee_id),
                    benefit_rule_id: thirteenthMonthRule.id,
                    type: "THIRTEENTH_MONTH",
                    benefit_mode: "RECURRING",
                    balance: 0,
                    unit: "CURRENCY",
                    status: "ACTIVE",
                    start_date: periodStartDate,
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

            const existingTransactions = await getThirteenthMonthTransactions({
                employee_benefit_id: lockedBenefit.id,
                period_start_date: periodStartDate,
                period_end_date: finalAccrualDate,
                transaction,
            });

            const allActiveAccruals =
                getActiveThirteenthMonthAccruals(
                    existingTransactions
                );

            const periodAccruals = allActiveAccruals.filter(
                (movement) => {
                    return (
                        movement.period_start_date &&
                        movement.period_end_date &&
                        movement.period_start_date <= finalAccrualDate &&
                        movement.period_end_date >= periodStartDate
                    );
                }
            );

            const salaryChanged = hasSalaryBaseChanged(
                periodAccruals,
                currentSalaryBase
            );

            let reversedTransactions = [];

            if (salaryChanged) {

                for (const accrual of periodAccruals) {

                    const reversalResult =
                        await reverseThirteenthMonthAccrual({
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

            const isMonthRecognized = (monthStart, monthEnd) => {
                return activePeriodAccruals.some((movement) => {
                    return (
                        movement.period_start_date <= monthStart &&
                        movement.period_end_date >= monthEnd
                    );
                });
            };

            let cursor = getMonthStartDate(periodStartDate);
            const monthlyBreakdown = [];
            let recognizedMonths = 0;
            let pendingMonths = 0;
            let totalAccrued = 0;
            let firstPendingDate = null;
            let lastPendingDate = null;
            const currentBalance = Number(lockedBenefit.balance);

            while (cursor <= finalAccrualDate) {

                const calendarMonthStart = cursor;
                const calendarMonthEnd = getMonthEndDate(cursor);

                const monthlyStartDate =
                    calendarMonthStart < periodStartDate
                        ? periodStartDate
                        : calendarMonthStart;

                const monthlyEndDate = [
                    calendarMonthEnd,
                    periodEndDate,
                    targetDate,
                ].reduce((earliest, date) =>
                    date < earliest ? date : earliest
                );

                if (
                    isMonthRecognized(
                        monthlyStartDate,
                        monthlyEndDate
                    )
                ) {
                    recognizedMonths++;

                    cursor = addOneMonth(cursor);
                    continue;
                }

                const workedDays = getDaysBetween(
                    monthlyStartDate,
                    monthlyEndDate
                );

                const totalMonthDays = getDaysInPeriod(
                    calendarMonthStart,
                    calendarMonthEnd
                );

                if (workedDays <= 0 || totalMonthDays <= 0) {
                    throw new Error(
                        "invalid_thirteenth_month_period"
                    );
                }

                const monthlyAmount = roundBalance(
                    (salaryBase / 12) *
                    (workedDays / totalMonthDays)
                );

                if (monthlyAmount > 0) {
                    pendingMonths++;
                    totalAccrued = roundBalance( totalAccrued + monthlyAmount );

                    if (!firstPendingDate) {
                        firstPendingDate = monthlyStartDate;
                    }
                    lastPendingDate = monthlyEndDate;

                    monthlyBreakdown.push({
                        month: cursor.slice(0, 7),
                        period_start_date: monthlyStartDate,
                        period_end_date: monthlyEndDate,
                        worked_days: workedDays,
                        total_month_days: totalMonthDays,
                        salary_base: salaryBase,
                        salary_history_id:
                            currentSalaryBase.salary_history_id,
                        accrued_amount: monthlyAmount,
                    });
                }
                cursor = addOneMonth(cursor);
            }

            if (pendingMonths === 0) {
                const lastTransaction =
                    existingTransactions[
                        existingTransactions.length - 1
                    ] || null;

                return {
                    status: "ALREADY_CALCULATED",
                    message: "thirteenth_month_already_calculated",
                    data: [],
                    reversals: reversedTransactions.map(
                        (movement) => movement.toJSON()
                    ),
                    monthly_breakdown: [],
                    period_start_date: periodStartDate,
                    period_end_date: periodEndDate,
                    recognized_months: recognizedMonths,
                    pending_months: 0,
                    accrued_amount: 0,
                    salary_changed: salaryChanged,
                    salary_history_id:
                        currentSalaryBase.salary_history_id,
                    current_balance: Number(lockedBenefit.balance),
                    last_accrual_date: lastTransaction
                        ? lastTransaction.period_end_date
                        : null,
                };
            }

            const idempotencyKey =
                `THIRTEENTH_MONTH_CUMULATIVE_${lockedBenefit.id}_` +
                `${currentSalaryBase.salary_history_id}_` +
                `${firstPendingDate}_${lastPendingDate}`;

            const accrualResult = await accrueBenefit({
                employeeBenefitId: lockedBenefit.id,
                businessId: business_id,
                amount: totalAccrued,
                date: lastPendingDate,
                referenceType:
                    "THIRTEENTH_MONTH_CUMULATIVE_ACCRUAL",
                referenceId: thirteenthMonthRule.id,
                idempotencyKey,
                periodStartDate: firstPendingDate,
                periodEndDate: lastPendingDate,
                description:
                    `Acumulación de décimo tercer mes correspondiente ` +
                    `del ${firstPendingDate} al ${lastPendingDate}. ` +
                    `Salario base: ${salaryBase}`,
                transaction,
            });

            return {
                status: salaryChanged
                    ? "RECALCULATED"
                    : "ACCRUED",
                message: salaryChanged
                    ? "employee_thirteenth_month_recalculated_after_salary_change"
                    : "employee_thirteenth_month_calculated_successfully",
                data: [
                    accrualResult.transaction.toJSON(),
                ],
                reversals: reversedTransactions.map(
                    (movement) => movement.toJSON()
                ),
                monthly_breakdown: monthlyBreakdown,
                period_start_date: periodStartDate,
                period_end_date: periodEndDate,
                recognized_months: recognizedMonths,
                pending_months: pendingMonths,
                accrued_amount: totalAccrued,
                salary_changed: salaryChanged,
                salary_history_id:
                    currentSalaryBase.salary_history_id,
                previous_balance: currentBalance,
                current_balance: Number(
                    accrualResult.benefit.balance
                ),
                last_accrual_date: lastPendingDate,
            };
        }
    );

    return result;
}