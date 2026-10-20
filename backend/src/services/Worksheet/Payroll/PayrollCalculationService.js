import { getActiveEmployeesInPeriod } from "../Employee/EmployeeService.js";
import { getCurrentSalaryByEmployeeId, getMonthlySalary } from "../Employee/SalaryService.js";
import { getActivePayrollRulesInPeriod } from "./PayrollRuleService.js";
import { getActiveEmploymentsInPeriod } from "../Employee/EmploymentService.js";
import { calculateIR } from "../Employee/NicaraguaPayrollDeductionService.js";

//Orquestador principal de cálculo de nómina
export const calculatePayrollForPeriod = async ({
    businessId, startDate, endDate, branchId = null
} = {}) => {
    if (!businessId) {
        throw new Error("business_id_required");
    }

    if (!startDate || !endDate) {
        throw new Error("date_range_required");
    }

    const employeeIds = await getActiveEmployeesInPeriod({
        businessId,
        startDate,
        endDate,
        branchId,
    });

    const employments = await getActiveEmploymentsInPeriod({
        businessId,
        startDate,
        endDate,
        branchId,
    });

    if (employeeIds.length === 0) {
        return {
            period: { startDate, endDate, branchId },
            totalEmployees: 0,
            employees: [],
        };
    }

    // Relaciona cada empleado con su employment_id.
    const employmentByEmployeeId = new Map();

    for (const employment of employments) {
        employmentByEmployeeId.set(
            Number(employment.employee_id),
            employment.employment_id
        );
    }

    const payrollRules = await getActivePayrollRulesInPeriod({
        businessId,
        startDate,
        endDate,
        branchId,
    });

    const results = [];

    for (const employeeId of employeeIds) {
        try {
            const employmentId = employmentByEmployeeId.get(
                Number(employeeId)
            );

            if (employmentId === undefined) {
                throw new Error("active_employment_not_found");
            }

            const salaryData = await getCurrentSalaryByEmployeeId(
                employeeId,
                businessId
            );

            const grossSalary = getMonthlySalary(
                salaryData.salary,
                salaryData.salary_type
            );

            const calculation = calculateEmployeePayroll(
                grossSalary,
                payrollRules
            );

            results.push({
                employee_id: employeeId,
                employment_id: employmentId,
                gross_salary: Number(grossSalary.toFixed(2)),
                total_earnings: Number(
                    calculation.totalEarnings.toFixed(2)
                ),
                total_deductions: Number(
                    calculation.totalDeductions.toFixed(2)
                ),
                net_salary: Number(
                    calculation.netSalary.toFixed(2)
                ),
                employer_cost: Number(
                    calculation.employerCost.toFixed(2)
                ),
                status: "CALCULATED",
                items: calculation.items,
            });
        } catch (error) {
            results.push({
                employee_id: employeeId,
                error: error.message,
                status: "ERROR",
            });
        }
    }

    return {
        period: {
            startDate,
            endDate,
            branchId,
        },
        totalEmployees: results.length,
        employees: results,
    };
};

const calculateEmployeePayroll = (grossSalary, rules) => {
    let totalEarnings = 0;
    let totalDeductions = 0;
    let employerCost = 0;
    const items = [];

    // Las reglas EARNING por ahora no están siendo tomadas en cuenta.
    //Se necesita la forma de establecer como reconocer las horas extras de los empleados.
    const earningRules = rules.filter(
        (r) => r.type === "EARNING"
    );

    const deductionRules = rules.filter(
        (r) => r.type === "DEDUCTION"
    );

    const employerCostRules = rules.filter(
        (r) => r.type === "EMPLOYER_COST"
    );

    for (const rule of earningRules) {
        const calc = applyRule(rule, grossSalary);

        if (calc.amount > 0) {
            totalEarnings += calc.amount;

            items.push({
                payroll_rule_id: rule.id,
                concept: rule.name || rule.code,
                type: "EARNING",
                amount: Number(calc.amount.toFixed(2)),
                calculation_base: calc.base,
                applied_percentage: calc.percentage,
                description: rule.code,
            });
        }
    }

    const baseForDeductions = grossSalary + totalEarnings;

    // 2. CALCULA LAS DEDUCCIONES DISTINTAS DEL IR
    const nonIRRules = deductionRules.filter(
        (r) => r.code !== "IR"
    );

    const irRules = deductionRules.filter(
        (r) => r.code === "IR"
    );

    let inssLaboralAmount = 0;

    for (const rule of nonIRRules) {
        const calc = applyRule(rule, baseForDeductions);

        if (calc.amount > 0) {
            totalDeductions += calc.amount;

            items.push({
                payroll_rule_id: rule.id,
                concept: rule.name || rule.code,
                type: "DEDUCTION",
                amount: Number(calc.amount.toFixed(2)),
                calculation_base: calc.base,
                applied_percentage: calc.percentage,
                description: rule.code,
            });
        }

        // Conserva el importe real del INSS laboral calculado
        if (rule.code === "INSS_LABORAL") {
            inssLaboralAmount = calc.amount;
        }
    }

    // 3. CALCULA IR DESPUÉS DEL INSS LABORAL
    const netMonthlyAfterINSS =
        baseForDeductions - inssLaboralAmount;

    for (const rule of irRules) {
        const calc = applyRule(
            rule,
            baseForDeductions,
            { netMonthlyAfterINSS }
        );

        if (calc.amount > 0) {
            totalDeductions += calc.amount;

            items.push({
                payroll_rule_id: rule.id,
                concept: rule.name || rule.code,
                type: "DEDUCTION",
                amount: Number(calc.amount.toFixed(2)),
                calculation_base:
                    calc.irDetails?.annual_base ?? calc.base,
                applied_percentage: calc.percentage,
                description: rule.code,
            });
        }
    }

    // 4. COSTOS PATRONALES
    for (const rule of employerCostRules) {
        const calc = applyRule(rule, baseForDeductions);

        if (calc.amount > 0) {
            employerCost += calc.amount;

            items.push({
                payroll_rule_id: rule.id,
                concept: rule.name || rule.code,
                type: "EMPLOYER_COST",
                amount: Number(calc.amount.toFixed(2)),
                calculation_base: calc.base,
                applied_percentage: calc.percentage,
                description: rule.code,
            });
        }
    }

    // 5. SALARIO NETO
    const netSalary = baseForDeductions - totalDeductions;

    return {
        totalEarnings,
        totalDeductions,
        netSalary,
        employerCost,
        items,
    };
};

//Aplica una regla individual (FIXED, PERCENTAGE o PROGRESSIVE)
const applyRule = (rule, baseAmount, context = {}) => {
    let amount = 0;
    let appliedPercentage = null;
    let usedBase = baseAmount;
    let irDetails = null;

    if (rule.code === "IR") {
        const netMonthlyAfterINSS =
            context.netMonthlyAfterINSS;

        if (!Number.isFinite(netMonthlyAfterINSS)) {
            throw new Error(
                `[APPLY_RULE] IR requiere netMonthlyAfterINSS válido. ` +
                `Regla: ${rule.id}`
            );
        }

        irDetails = calculateIR({
            netMonthlyAfterINSS,
            rule,
        });

        amount = Number(irDetails.amount);
        appliedPercentage = irDetails.tier?.percentage ?? null;

        usedBase = irDetails.annual_base;

    } else {
        // RESTO DE LAS REGLAS
        switch (rule.calculation_type) {
            case "FIXED":
                amount = Number(rule.value || 0);
                break;

            case "PERCENTAGE":
                appliedPercentage = Number(rule.percentage || 0);
                amount = (baseAmount * appliedPercentage) / 100;
                break;

            case "PROGRESSIVE":
                if (rule.tiers && rule.tiers.length > 0) {
                    const result = calculateProgressive(
                        rule.tiers,
                        baseAmount
                    );

                    amount = result.amount;
                    appliedPercentage = result.percentage;
                    usedBase = result.base;
                } else {
                    console.warn(
                        "[APPLY_RULE] Regla progresiva sin tramos",
                        {
                            ruleId: rule.id,
                            code: rule.code,
                        }
                    );
                }
                break;

            default:
                console.warn("[APPLY_RULE] Tipo desconocido", {
                    ruleId: rule.id,
                    code: rule.code,
                    calculation_type: rule.calculation_type,
                });
        }
    }

    if (!Number.isFinite(amount)) {
        throw new Error(
            `[APPLY_RULE] Importe inválido para regla ${rule.code}`
        );
    }

    const result = {
        amount: Number(amount.toFixed(2)),
        percentage: appliedPercentage,
        base: Number(usedBase.toFixed(2)),
        ...(irDetails ? { irDetails } : {}),
    };

    return result;
};

//Cálculo progresivo por tramos
const calculateProgressive = (tiers, amount) => {
    const sortedTiers = [...tiers].sort(
        (a, b) => Number(a.min_amount) - Number(b.min_amount)
    );

    let total = 0;
    let lastPercentage = 0;

    for (const tier of sortedTiers) {
        const min = Number(tier.min_amount);
        const max = tier.max_amount !== null ? Number(tier.max_amount) : Infinity;

        if (amount > min) {
            const taxable = Math.min(amount, max) - min;
            const fixed = Number(tier.fixed_amount || 0);
            const percentage = Number(tier.percentage || 0);

            total += fixed + (taxable * percentage) / 100;
            lastPercentage = percentage;
        }
    }

    return {
        amount: total,
        percentage: lastPercentage,
        base: amount,
    };
};