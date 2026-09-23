import { Op } from "sequelize";
import PayrollRule from "../../../models/Worksheet/Payroll/PayrollRules/PayrollRule.js";
import PayrollRuleTier from "../../../models/Worksheet/Payroll/PayrollRules/PayrollRuleTier.js";

const roundMoney = (value) => {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
};

export const getMonthlySalary = (salary, salaryType, { hoursPerDay = 8, daysPerWeek = 5 } = {}) => {
    const amount = Number(salary);

    if (!Number.isFinite(amount)) {
        throw new Error("El salario proporcionado no es válido");
    }

    switch (salaryType) {
        case "MONTHLY":
            return roundMoney(amount);
        case "WEEKLY":
            return roundMoney(amount * (52 / 12));
        case "DAILY":
            return roundMoney(amount * daysPerWeek * (52 / 12));
        case "HOURLY":
            return roundMoney(amount * hoursPerDay * daysPerWeek * (52 / 12));
        default:
            throw new Error(`Tipo de salario no soportado: ${salaryType}`);
    }
};

const getNicaraguaPayrollRules = async ({ businessId, branchId, date }) => {
    return PayrollRule.findAll({
        where: {
            business_id: businessId,
            active: true,
            code: {
                [Op.in]: ["INSS_LABORAL", "IR"]
            },
            effective_from: {
                [Op.lte]: date
            },
            [Op.or]: [
                { effective_to: null },
                { effective_to: { [Op.gte]: date } }
            ],
            [Op.and]: [
                {
                    [Op.or]: [
                        { branch_id: null },
                        { branch_id: branchId }
                    ]
                }
            ]
        },
        include: [
            {
                model: PayrollRuleTier,
                as: "tiers"
            }
        ],
        order: [
            ["id", "ASC"]
        ]
    });
};

const getRuleByCode = (rules, code) => {
    return rules.find(rule => rule.code === code) || null;
};

const calculateINSSLaboral = ({ grossMonthlySalary, rule }) => {
    if (!rule) {
        throw new Error("No existe una regla activa INSS_LABORAL");
    }

    const percentage = Number(rule.percentage);

    if (!Number.isFinite(percentage)) {
        throw new Error("El porcentaje de INSS_LABORAL no es válido");
    }

    const amount = grossMonthlySalary * (percentage / 100);

    return {
        rule_id: rule.id,
        code: rule.code,
        name: rule.name,
        type: rule.type,
        calculation_type: rule.calculation_type,
        base_type: rule.base_type,
        base_amount: roundMoney(grossMonthlySalary),
        percentage,
        amount: roundMoney(amount)
    };
};

const findProgressiveTier = ({ tiers, annualBase }) => {
    if (!tiers || tiers.length === 0) {
        return null;
    }

    const orderedTiers = [...tiers].sort((a, b) => Number(a.min_amount) - Number(b.min_amount));

    return orderedTiers.find(tier => {
        const minAmount = Number(tier.min_amount);
        const maxAmount = tier.max_amount === null || tier.max_amount === undefined ? null : Number(tier.max_amount);

        if (annualBase < minAmount) {
            return false;
        }

        if (maxAmount === null) {
            return true;
        }

        return annualBase <= maxAmount;
    }) || null;
};

const calculateIR = ({ netMonthlyAfterINSS, rule }) => {
    if (!rule) {
        throw new Error("No existe una regla activa IR");
    }

    const annualBase = roundMoney(netMonthlyAfterINSS * 12);
    const tier = findProgressiveTier({ tiers: rule.tiers, annualBase });

    if (!tier) {
        return {
            rule_id: rule.id,
            code: rule.code,
            name: rule.name,
            type: rule.type,
            calculation_type: rule.calculation_type,
            base_type: rule.base_type,
            base_amount: annualBase,
            monthly_base: roundMoney(netMonthlyAfterINSS),
            annual_base: annualBase,
            tier: null,
            annual_amount: 0,
            amount: 0
        };
    }

    const minAmount = Number(tier.min_amount);
    const fixedAmount = Number(tier.fixed_amount || 0);
    const percentage = Number(tier.percentage || 0);

    const excess = Math.max(0, annualBase - minAmount);
    const percentageAmount = excess * (percentage / 100);
    const annualIR = fixedAmount + percentageAmount;
    const monthlyIR = annualIR / 12;

    return {
        rule_id: rule.id,
        code: rule.code,
        name: rule.name,
        type: rule.type,
        calculation_type: rule.calculation_type,
        base_type: rule.base_type,
        monthly_base: roundMoney(netMonthlyAfterINSS),
        annual_base: annualBase,
        base_amount: annualBase,
        tier: {
            id: tier.id,
            min_amount: minAmount,
            max_amount: tier.max_amount === null ? null : Number(tier.max_amount),
            fixed_amount: fixedAmount,
            percentage
        },
        excess: roundMoney(excess),
        fixed_amount: roundMoney(fixedAmount),
        percentage_amount: roundMoney(percentageAmount),
        annual_amount: roundMoney(annualIR),
        amount: roundMoney(monthlyIR)
    };
};

export const calculateNicaraguaPayrollDeductions = async ({ salary, salaryType, businessId, branchId = null, date, options = {} }) => {
    if (!businessId) {
        throw new Error("businessId es obligatorio");
    }

    if (!date) {
        throw new Error("date es obligatorio");
    }

    const grossMonthlySalary = getMonthlySalary(salary, salaryType, options);

    const rules = await getNicaraguaPayrollRules({ businessId, branchId, date });
    const inssRule = getRuleByCode(rules, "INSS_LABORAL");
    const irRule = getRuleByCode(rules, "IR");

    const inss = calculateINSSLaboral({ grossMonthlySalary, rule: inssRule });
    const monthlySalaryAfterINSS = roundMoney(grossMonthlySalary - inss.amount);
    const ir = calculateIR({ netMonthlyAfterINSS: monthlySalaryAfterINSS, rule: irRule });

    const totalDeductions = roundMoney(inss.amount + ir.amount);
    const netSalary = roundMoney(grossMonthlySalary - totalDeductions);

    return {
        salary: {
            original_amount: roundMoney(Number(salary)),
            salary_type: salaryType,
            monthly_gross: grossMonthlySalary
        },
        deductions: {
            inss_laboral: inss,
            ir: ir,
            total: totalDeductions
        },
        calculation: {
            gross_salary: grossMonthlySalary,
            inss_laboral: inss.amount,
            salary_after_inss: monthlySalaryAfterINSS,
            annual_taxable_base: ir.annual_base,
            ir_annual: ir.annual_amount,
            ir_monthly: ir.amount,
            total_deductions: totalDeductions,
            net_salary: netSalary
        }
    };
};

export default {
    calculateNicaraguaPayrollDeductions,
    getMonthlySalary
};