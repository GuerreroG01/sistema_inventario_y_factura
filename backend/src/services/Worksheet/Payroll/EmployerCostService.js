import { Op } from "sequelize";
import Employee from "../../../models/Worksheet/Employee/Employee.js";
import EmployeeSalaryHistory from "../../../models/Worksheet/Employee/EmployeeSalaryHistory.js";
import PayrollRule from "../../../models/Worksheet/Payroll/PayrollRules/PayrollRule.js";
import PayrollRuleTier from "../../../models/Worksheet/Payroll/PayrollRules/PayrollRuleTier.js";
import { roundMoney, getMonthlySalary } from "../Employee/SalaryService.js"

const getEmployerCostRules = async ({
    businessId,
    branchId = null,
    date
}) => {
    return PayrollRule.findAll({
        where: {
            business_id: businessId,
            active: true,

            type: "EMPLOYER_COST",

            effective_from: {
                [Op.lte]: date
            },

            [Op.or]: [
                {
                    effective_to: null
                },
                {
                    effective_to: {
                        [Op.gte]: date
                    }
                }
            ],

            [Op.and]: [
                {
                    [Op.or]: [
                        {
                            branch_id: null
                        },
                        {
                            branch_id: branchId
                        }
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

const calculateEmployerCostRule = ({
    rule,
    grossMonthlySalary
}) => {
    if (!rule) {
        return null;
    }

    const baseAmount = roundMoney(
        grossMonthlySalary
    );

    switch (rule.calculation_type) {

        case "FIXED": {
            const value = Number(rule.value);

            if (!Number.isFinite(value)) {
                throw new Error(
                    `El valor de la regla ${rule.code} no es válido`
                );
            }

            return {
                rule_id: rule.id,
                code: rule.code,
                name: rule.name,
                type: rule.type,
                calculation_type: rule.calculation_type,
                base_type: rule.base_type,
                base_amount: baseAmount,
                value: roundMoney(value),
                percentage: null,
                amount: roundMoney(value)
            };
        }

        case "PERCENTAGE": {
            const percentage = Number(
                rule.percentage
            );

            if (!Number.isFinite(percentage)) {
                throw new Error(
                    `El porcentaje de la regla ${rule.code} no es válido`
                );
            }

            const amount = roundMoney(
                baseAmount * (percentage / 100)
            );

            return {
                rule_id: rule.id,
                code: rule.code,
                name: rule.name,
                type: rule.type,
                calculation_type: rule.calculation_type,
                base_type: rule.base_type,
                base_amount: baseAmount,
                value: null,
                percentage,
                amount
            };
        }

        case "PROGRESSIVE": {
            return calculateProgressiveEmployerCost({
                rule,
                grossMonthlySalary
            });
        }

        default:
            throw new Error(
                `Tipo de cálculo no soportado: ${rule.calculation_type}`
            );
    }
};

const findProgressiveTier = ({
    tiers,
    annualBase
}) => {
    if (!tiers || tiers.length === 0) {
        return null;
    }

    const orderedTiers = [...tiers].sort(
        (a, b) =>
            Number(a.min_amount) -
            Number(b.min_amount)
    );

    return orderedTiers.find(tier => {
        const minAmount = Number(
            tier.min_amount
        );

        const maxAmount =
            tier.max_amount === null ||
            tier.max_amount === undefined
                ? null
                : Number(tier.max_amount);

        if (annualBase < minAmount) {
            return false;
        }

        if (maxAmount === null) {
            return true;
        }

        return annualBase <= maxAmount;
    }) || null;
};

const calculateProgressiveEmployerCost = ({
    rule,
    grossMonthlySalary
}) => {
    const annualBase = roundMoney(
        grossMonthlySalary * 12
    );

    const tier = findProgressiveTier({
        tiers: rule.tiers,
        annualBase
    });

    if (!tier) {
        return {
            rule_id: rule.id,
            code: rule.code,
            name: rule.name,
            type: rule.type,
            calculation_type: rule.calculation_type,
            base_type: rule.base_type,
            base_amount: annualBase,
            monthly_base: roundMoney(
                grossMonthlySalary
            ),
            annual_base: annualBase,
            tier: null,
            annual_amount: 0,
            amount: 0
        };
    }

    const minAmount = Number(
        tier.min_amount
    );

    const fixedAmount = Number(
        tier.fixed_amount || 0
    );

    const percentage = Number(
        tier.percentage || 0
    );

    const excess = Math.max(
        0,
        annualBase - minAmount
    );

    const percentageAmount =
        excess * (percentage / 100);

    const annualAmount =
        fixedAmount + percentageAmount;

    const monthlyAmount =
        annualAmount / 12;

    return {
        rule_id: rule.id,
        code: rule.code,
        name: rule.name,
        type: rule.type,
        calculation_type: rule.calculation_type,
        base_type: rule.base_type,

        base_amount: annualBase,

        monthly_base: roundMoney(
            grossMonthlySalary
        ),

        annual_base: annualBase,

        tier: {
            id: tier.id,
            min_amount: minAmount,
            max_amount:
                tier.max_amount === null
                    ? null
                    : Number(tier.max_amount),
            fixed_amount: fixedAmount,
            percentage
        },

        excess: roundMoney(excess),

        fixed_amount: roundMoney(
            fixedAmount
        ),

        percentage_amount: roundMoney(
            percentageAmount
        ),

        annual_amount: roundMoney(
            annualAmount
        ),

        amount: roundMoney(
            monthlyAmount
        )
    };
};

export const calculateEmployeeEmployerCosts = async ({
    employeeId,
    businessId,
    date,
    options = {}
}) => {
    if (!employeeId) {
        throw new Error(
            "employeeId es obligatorio"
        );
    }

    if (!businessId) {
        throw new Error(
            "businessId es obligatorio"
        );
    }

    if (!date) {
        throw new Error(
            "date es obligatorio"
        );
    }

    const employee = await Employee.findOne({
        where: {
            id: employeeId,
            business_id: businessId
        }
    });

    if (!employee) {
        throw new Error(
            "Empleado no encontrado"
        );
    }

    const salary = await EmployeeSalaryHistory.findOne({
        where: {
            employee_id: employeeId,

            effective_from: {
                [Op.lte]: date
            },

            [Op.or]: [
                {
                    effective_to: null
                },
                {
                    effective_to: {
                        [Op.gte]: date
                    }
                }
            ]
        },

        order: [
            ["effective_from", "DESC"],
            ["id", "DESC"]
        ]
    });

    if (!salary) {
        throw new Error(
            "El empleado no tiene un salario vigente para el período"
        );
    }

    const grossMonthlySalary =
        getMonthlySalary(
            salary.salary,
            salary.salary_type,
            options
        );

    const rules =
        await getEmployerCostRules({
            businessId,
            branchId: employee.branch_id,
            date
        });

    const employerCosts = [];
    let totalEmployerCosts = 0;

    for (const rule of rules) {
        const result =
            calculateEmployerCostRule({
                rule,
                grossMonthlySalary
            });

        if (!result) {
            continue;
        }

        employerCosts.push(result);

        totalEmployerCosts += result.amount;
    }

    return {
        total_employer_costs: roundMoney(totalEmployerCosts)
    };
};

export const calculateTotalEmployerCosts = async ({
    businessId,
    date,
    branchId = null,
    options = {}
}) => {
    if (!businessId) {
        throw new Error(
            "businessId es obligatorio"
        );
    }

    if (!date) {
        throw new Error(
            "date es obligatorio"
        );
    }

    const employeeWhere = {
        business_id: businessId
    };

    if (branchId !== null) {
        employeeWhere.branch_id = branchId;
    }

    const employees = await Employee.findAll({
        where: employeeWhere
    });

    const employeesCosts = [];

    let totalEmployerCosts = 0;
    let totalGrossSalary = 0;

    for (const employee of employees) {
        const salary =
            await EmployeeSalaryHistory.findOne({
                where: {
                    employee_id: employee.id,

                    effective_from: {
                        [Op.lte]: date
                    },

                    [Op.or]: [
                        {
                            effective_to: null
                        },
                        {
                            effective_to: {
                                [Op.gte]: date
                            }
                        }
                    ]
                },

                order: [
                    ["effective_from", "DESC"],
                    ["id", "DESC"]
                ]
            });

        if (!salary) {
            continue;
        }

        const grossMonthlySalary =
            getMonthlySalary(
                salary.salary,
                salary.salary_type,
                options
            );

        const rules =
            await getEmployerCostRules({
                businessId,
                branchId: employee.branch_id,
                date
            });

        const employerCosts = [];

        let employeeEmployerCost = 0;

        for (const rule of rules) {
            const result =
                calculateEmployerCostRule({
                    rule,
                    grossMonthlySalary
                });

            if (!result) {
                continue;
            }

            employerCosts.push(result);

            employeeEmployerCost +=
                result.amount;
        }

        const employeeTotal =
            roundMoney(
                employeeEmployerCost
            );

        totalGrossSalary +=
            grossMonthlySalary;

        totalEmployerCosts +=
            employeeTotal;

        employeesCosts.push({
            employee_id: employee.id,

            gross_salary:
                roundMoney(
                    grossMonthlySalary
                ),

            employer_costs:
                employerCosts,

            total_employer_costs:
                employeeTotal
        });
    }

    return {
        total_employer_costs: roundMoney(totalEmployerCosts)
    };
};