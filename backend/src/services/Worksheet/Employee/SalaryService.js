import EmployeeSalaryHistory from "../../../models/Worksheet/Employee/EmployeeSalaryHistory.js";
import Employee from "../../../models/Worksheet/Employee/Employee.js";
import PayrollRule from "../../../models/Worksheet/Payroll/PayrollRules/PayrollRule.js";
import PayrollRuleTier from "../../../models/Worksheet/Payroll/PayrollRules/PayrollRuleTier.js";
import { calculateNicaraguaPayrollDeductions } from "./NicaraguaPayrollDeductionService.js";

import { Op } from "sequelize";
import { cacheService, CacheKeys } from "../../cache/index.js";

const getMonthlyPeriod = (date = new Date()) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    return {
        periodStart: new Date(year, month, 1),
        periodEnd: new Date(year, month + 1, 0),
    };
};

const createSalaryHistory = async ( employeeId, data, businessId ) => {
    const employee = await Employee.findOne({
        where: {
            id: employeeId,
            business_id: businessId
        }
    });

    if (!employee) {
        throw new Error("Empleado no encontrado");
    }

    if (!data.salary) {
        throw new Error("El salario es obligatorio");
    }

    if (!data.effective_from) {
        throw new Error("La fecha de inicio es obligatoria");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newEffectiveFrom = new Date(
        `${data.effective_from}T00:00:00`
    );

    const newEffectiveTo = data.effective_to
        ? new Date(`${data.effective_to}T00:00:00`)
        : null;

    // No permitir salario inicial retroactivo
    if (newEffectiveFrom < today) {
        throw new Error(
            "La fecha de inicio no puede ser anterior a la fecha actual"
        );
    }

    // Validar que effective_to no sea anterior a effective_from
    if (
        newEffectiveTo &&
        newEffectiveTo < newEffectiveFrom
    ) {
        throw new Error(
            "La fecha de finalización no puede ser anterior a la fecha de inicio"
        );
    }

    // Un empleado solamente puede tener un salario inicial
    const existingSalary =
        await EmployeeSalaryHistory.findOne({
            where: {
                employee_id: employeeId
            }
        });

    if (existingSalary) {
        throw new Error(
            "El empleado ya tiene un historial salarial. Utilice el método de cambio salarial"
        );
    }

    const salaryHistory =
        await EmployeeSalaryHistory.create({
            employee_id: employeeId,
            salary: data.salary,
            salary_type: data.salary_type ?? "MONTHLY",
            effective_from: data.effective_from,
            effective_to: data.effective_to ?? null,
            reason: data.reason ?? null
        });

    return salaryHistory;
};
//Obtener el historial de salarios del empleado a lo largo de la relación laboral
export const getSalaryHistory = async ( employeeId, businessId ) => {
    const employee = await Employee.findOne({
        where: {
            id: employeeId,
            business_id: businessId
        }
    });

    if (!employee) {
        throw new Error("Empleado no encontrado");
    }

    const salaryHistory = await EmployeeSalaryHistory.findAll({
        where: {
            employee_id: employeeId
        },
        order: [["effective_from", "DESC"]]
    });

    return salaryHistory;
};
//Salario actual
export const getCurrentSalary = async (employeeId, businessId) => {
    const employee = await Employee.findOne({
        where: {
            id: employeeId,
            business_id: businessId
        }
    });

    if (!employee) {
        throw new Error("Empleado no encontrado");
    }

    const today = new Date();

    const salary = await EmployeeSalaryHistory.findOne({
        where: {
            employee_id: employeeId,
            effective_from: {
                [Op.lte]: today
            },
            [Op.or]: [
                {
                    effective_to: null
                },
                {
                    effective_to: {
                        [Op.gte]: today
                    }
                }
            ]
        },
        order: [["effective_from", "DESC"]]
    });

    if (salary) {
        return salary;
    }
    const salaryData = await EmployeeSalaryHistory.findAll({
        where: {
            employee_id: employeeId,
        },
        order: [["effective_from", "DESC"]]
    });
    if (salaryData.length === 1) {
        return salaryData[0];
    }
    throw new Error(
        "El empleado no tiene un salario asignado"
    );
};
//Obtener el salario actual por fecha especifica
export const getSalaryAtDate = async ( employeeId, date, businessId ) => {
    const employee = await Employee.findOne({
        where: {
            id: employeeId,
            business_id: businessId
        }
    });

    if (!employee) {
        throw new Error("Empleado no encontrado");
    }

    if (!date) {
        throw new Error("La fecha es obligatoria");
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
        order: [["effective_from", "DESC"]]
    });

    if (!salary) {
        throw new Error(
            "No existe un salario registrado para esa fecha"
        );
    }

    return salary;
};
//Cambio de salario(Aumento)
const changeSalary = async ( employeeId, data, businessId ) => {
    const employee = await Employee.findOne({
        where: {
            id: employeeId,
            business_id: businessId
        }
    });

    if (!employee) {
        throw new Error("Empleado no encontrado");
    }

    if (!data.salary) {
        throw new Error("El salario es obligatorio");
    }

    if (!data.effective_from) {
        throw new Error("La fecha de inicio es obligatoria");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newEffectiveFrom = new Date(
        `${data.effective_from}T00:00:00`
    );

    const newEffectiveTo = data.effective_to
        ? new Date(`${data.effective_to}T00:00:00`)
        : null;

    if (newEffectiveFrom < today) {
        throw new Error(
            "La fecha de inicio no puede ser anterior a la fecha actual"
        );
    }

    if ( newEffectiveTo && newEffectiveTo < newEffectiveFrom ) {
        throw new Error(
            "La fecha de finalización no puede ser anterior a la fecha de inicio"
        );
    }

    /*
     * Buscar el salario vigente actualmente.
     */
    const currentSalary =
        await EmployeeSalaryHistory.findOne({
            where: {
                employee_id: employeeId,

                effective_from: {
                    [Op.lte]: today
                },

                [Op.or]: [
                    {
                        effective_to: null
                    },
                    {
                        effective_to: {
                            [Op.gte]: today
                        }
                    }
                ]
            },

            order: [["effective_from", "DESC"]]
        });

    /*
     * Buscar si ya existe un salario que comience
     * en la fecha del nuevo cambio o después.
     */
    const futureSalary =
        await EmployeeSalaryHistory.findOne({
            where: {
                employee_id: employeeId,
                effective_from: {
                    [Op.gte]: data.effective_from
                }
            },

            order: [["effective_from", "ASC"]]
        });

    /*
     * Si existe un salario futuro exactamente en esa fecha,
     * no permitimos duplicarlo.
     */
    if (
        futureSalary &&
        futureSalary.effective_from === data.effective_from
    ) {
        throw new Error(
            "Ya existe un salario registrado para esa fecha de inicio"
        );
    }

    /*
     * Si hay un salario futuro después de la fecha del cambio,
     * el nuevo salario debe terminar el día anterior a ese salario.
     */
    let finalEffectiveTo = data.effective_to ?? null;

    if (futureSalary) {
        const futureEffectiveFrom = new Date(
            `${futureSalary.effective_from}T00:00:00`
        );

        const calculatedEffectiveTo =
            new Date(futureEffectiveFrom);

        calculatedEffectiveTo.setDate(
            calculatedEffectiveTo.getDate() - 1
        );

        if (
            !newEffectiveTo ||
            calculatedEffectiveTo < newEffectiveTo
        ) {
            finalEffectiveTo = calculatedEffectiveTo
                .toISOString()
                .split("T")[0];
        }
    }

    /*
     * Si existe salario actual y el nuevo cambio comienza
     * después de su inicio, cerrar el salario actual.
     */
    if (currentSalary) {
        const currentEffectiveFrom = new Date(
            `${currentSalary.effective_from}T00:00:00`
        );

        if (newEffectiveFrom <= currentEffectiveFrom) {
            throw new Error(
                "La fecha de inicio debe ser posterior al inicio del salario actual"
            );
        }

        const previousEffectiveTo =
            new Date(newEffectiveFrom);

        previousEffectiveTo.setDate(
            previousEffectiveTo.getDate() - 1
        );

        await currentSalary.update({
            effective_to: previousEffectiveTo
                .toISOString()
                .split("T")[0]
        });
    }

    const newSalary =
        await EmployeeSalaryHistory.create({
            employee_id: employeeId,
            salary: data.salary,
            salary_type:
                data.salary_type ??
                currentSalary?.salary_type ??
                "MONTHLY",
            effective_from: data.effective_from,
            effective_to: finalEffectiveTo,
            reason: data.reason ?? null
        });

    return newSalary;
};
export const save = async (req, res) => {
    try {
        const { employeeId } = req.params;

        const salary = await saveSalary(
            employeeId,
            req.body,
            req.user.business_id
        );

        return res.status(201).json({
            message: salary.isChange
                ? "Salario actualizado correctamente"
                : "Historial salarial creado correctamente",
            data: salary.data
        });

    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};
export const saveSalary = async ( employeeId, data, businessId ) => {
    const employee = await Employee.findOne({
        where: {
            id: employeeId,
            business_id: businessId
        }
    });

    if (!employee) {
        throw new Error("Empleado no encontrado");
    }

    const existingSalary =
        await EmployeeSalaryHistory.findOne({
            where: {
                employee_id: employeeId
            }
        });

    if (!existingSalary) {
        const salary = await createSalaryHistory( employeeId, data, businessId );
        return {
            isChange: false,
            data: salary
        };
    }
    const salary = await changeSalary(employeeId,data,businessId);
    cacheService.del(CacheKeys.PROFITABILITY, businessId);
    return {
        isChange: true,
        data: salary
    };
};

//Aqui hay que tomar en cuenta para el futuro que no en todos los negocios se manejan horarios de 8 horas
// y también no en todos se manejan jornadas de 5 dias por semana, también hay de 6 dias como en nicaragua.
export const getMonthlySalary = ( salary, salaryType,
    {
        hoursPerDay = 8,
        daysPerWeek = 5
    } = {}
) => {
    const amount = Number(salary);

    if (!Number.isFinite(amount)) {
        throw new Error("El salario proporcionado no es válido");
    }

    switch (salaryType) {
        case "MONTHLY":
            return amount;

        case "WEEKLY":
            return amount * (52 / 12);

        case "DAILY":
            return amount * daysPerWeek * (52 / 12);

        case "HOURLY":
            return amount
                * hoursPerDay
                * daysPerWeek
                * (52 / 12);

        default:
            throw new Error(
                `Tipo de salario no soportado: ${salaryType}`
            );
    }
};

export const getTotalSalaries = async ( businessId, branchId = null, date = null ) => {
    const targetDate = date
        ? new Date(`${date}T00:00:00`)
        : new Date();

    if (isNaN(targetDate.getTime())) {
        throw new Error("La fecha proporcionada no es válida");
    }

    const employeeWhere = {
        business_id: businessId
    };

    if (branchId) {
        employeeWhere.branch_id = branchId;
    }

    const employees = await Employee.findAll({
        where: {
            ...employeeWhere,
            status: "ACTIVE"
        },
        attributes: ["id", "branch_id"]
    });

    if (employees.length === 0) {
        return {
            total: 0,
            employees: 0,
            employeesWithSalary: 0,
            branch_id: branchId ?? null,
            date: targetDate.toISOString().split("T")[0]
        };
    }

    let total = 0;
    let employeesWithSalary = 0;

    for (const employee of employees) {
        let salary = await EmployeeSalaryHistory.findOne({
            where: {
                employee_id: employee.id,
                effective_from: {
                    [Op.lte]: targetDate
                },
                [Op.or]: [
                    {
                        effective_to: null
                    },
                    {
                        effective_to: {
                            [Op.gte]: targetDate
                        }
                    }
                ]
            },
            order: [["effective_from", "DESC"]]
        });

        if (!salary) {
            const salaryHistory =
                await EmployeeSalaryHistory.findAll({
                    where: {
                        employee_id: employee.id
                    },
                    order: [["effective_from", "DESC"]]
                });

            if (salaryHistory.length === 1) {
                salary = salaryHistory[0];
            }
        }
        if (!salary) {
            continue;
        }

        const monthlySalary = getMonthlySalary(
            salary.salary,
            salary.salary_type
        );

        total += monthlySalary;
        employeesWithSalary++;
    }

    return {
        total,
        employees: employees.length,
        employeesWithSalary,
        branch_id: branchId ?? null,
        date: targetDate.toISOString().split("T")[0]
    };
};

export const roundMoney = (value) => {
    return Math.round(
        (Number(value) + Number.EPSILON) * 100
    ) / 100;
};

const resolveRuleBase = ({ rule, context }) => {
    switch (rule.base_type) {
        case "GROSS_SALARY":
            return context.current.grossSalary;
        case "ANNUAL_GROSS_SALARY":
            return context.annual.grossSalary;
        case "NET_SALARY":
            return context.current.netSalary;
        case "ANNUAL_NET_SALARY":
            return context.annual.netSalary;
        case "CUSTOM":
            return null;
        default:
            return null;
    }
};

const calculateFixed = (rule) => {
    if (rule.value === null || rule.value === undefined) {
        return 0;
    }
    return Number(rule.value);
};

const calculatePercentage = (rule, base) => {
    if ( rule.percentage === null || rule.percentage === undefined) {
        return 0;
    }
    const percentage = Number(rule.percentage);
    return base * (percentage / 100);
};

const calculateProgressive = (rule, base) => {

    if (
        !rule.tiers ||
        rule.tiers.length === 0
    ) {
        return 0;
    }

    /*
     * Ordenamos los rangos por mínimo.
     */

    const tiers = [...rule.tiers].sort(
        (a, b) =>
            Number(a.min_amount) -
            Number(b.min_amount)
    );


    /*
     * Buscamos el rango correspondiente
     * al salario/base.
     */

    const tier = tiers.find((tier) => {

        const minAmount =
            Number(tier.min_amount);

        const maxAmount =
            tier.max_amount === null
                ? null
                : Number(tier.max_amount);


        if (base < minAmount) {
            return false;
        }


        if (maxAmount === null) {
            return true;
        }


        return base <= maxAmount;
    });


    if (!tier) {
        return 0;
    }


    /*
     * Según la estructura actual de tus reglas:
     *
     * impuesto = porcentaje sobre TODO el salario
     *          + cuota fija
     */

    const fixedAmount =
        Number(tier.fixed_amount || 0);

    const percentage =
        Number(tier.percentage || 0);

    const percentageAmount =
        base * (percentage / 100);


    return (
        fixedAmount +
        percentageAmount
    );
};

const calculateRuleAmount = ({ rule, context }) => {

    /*
     * CUSTOM todavía no se procesa.
     */

    if (rule.base_type === "CUSTOM") {
        return null;
    }


    /*
     * EARNING todavía no se procesa.
     */

    if (rule.type === "EARNING") {
        return null;
    }


    /*
     * Resolver base de cálculo.
     */

    const base = resolveRuleBase({
        rule,
        context
    });


    if (
        base === null ||
        base === undefined
    ) {
        return null;
    }


    let calculatedAmount = 0;


    /*
     * Calcular según el tipo de regla.
     */

    switch (rule.calculation_type) {

        case "FIXED":

            calculatedAmount =
                calculateFixed(rule);

            break;


        case "PERCENTAGE":

            calculatedAmount =
                calculatePercentage(
                    rule,
                    base
                );

            break;


        case "PROGRESSIVE":

            calculatedAmount =
                calculateProgressive(
                    rule,
                    base
                );

            break;


        default:

            return null;
    }


    /*
     * Determinar si la base y el cálculo
     * son anuales.
     */

    const isAnnual =
        rule.base_type === "ANNUAL_GROSS_SALARY" ||
        rule.base_type === "ANNUAL_NET_SALARY";


    /*
     * Si la regla es anual pero la nómina
     * es mensual, convertimos el resultado
     * anual a mensual.
     */

    const periodAmount = isAnnual
        ? calculatedAmount / 12
        : calculatedAmount;


    return {

        rule_id: rule.id,

        code: rule.code,

        name: rule.name,

        type: rule.type,

        calculation_type:
            rule.calculation_type,

        base_type:
            rule.base_type,

        base_amount:
            roundMoney(base),

        annual_amount:
            isAnnual
                ? roundMoney(calculatedAmount)
                : null,

        amount:
            roundMoney(periodAmount)
    };
};

const getApplicablePayrollRules = async ({
    businessId,
    branchId,
    date
}) => {

    return PayrollRule.findAll({

        where: {
            business_id: businessId,

            active: true,

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

/*Aqui no se esta tomando en cuenta el tema de las reglas de tipo ingresos ya que no hay forma actualmente de saber las 
horas extras realizadas por un empleado o el tema de si fueran comisiones por ventas.*/
export const calculateEmployeePayroll = async (employeeId, businessId, options = {}) => {
    const employee = await Employee.findOne({
        where: {
            id: employeeId,
            business_id: businessId
        }
    });

    if (!employee) {
        throw new Error("Empleado no encontrado");
    }

    let periodStart;
    let periodEnd;

    if (options.periodStart || options.periodEnd) {
        if (!options.periodStart || !options.periodEnd) {
            throw new Error("periodStart y periodEnd deben proporcionarse juntos");
        }
        periodStart = new Date(options.periodStart);
        periodEnd = new Date(options.periodEnd);
    } else {
        const period = getMonthlyPeriod();
        periodStart = period.periodStart;
        periodEnd = period.periodEnd;
    }

    if (Number.isNaN(periodStart.getTime()) || Number.isNaN(periodEnd.getTime())) {
        throw new Error("El período de nómina no es válido");
    }

    if (periodStart > periodEnd) {
        throw new Error("La fecha inicial no puede ser mayor que la fecha final");
    }

    const salary = await getSalaryAtDate(employeeId, periodEnd, businessId);

    if (!salary) {
        throw new Error("El empleado no tiene un salario vigente para el período");
    }

    const originalSalary = Number(salary.salary);

    if (!Number.isFinite(originalSalary)) {
        throw new Error("El salario del empleado no es válido");
    }

    const rules = await getApplicablePayrollRules({
        businessId,
        branchId: employee.branch_id,
        date: periodEnd
    });

    const nicaraguaRules = rules.filter(
        rule => rule.code === "INSS_LABORAL" || rule.code === "IR"
    );

    const generalRules = rules.filter(
        rule => rule.code !== "INSS_LABORAL" && rule.code !== "IR"
    );

    let nicaraguaPayroll = null;

    if (nicaraguaRules.length > 0) {
        nicaraguaPayroll = await calculateNicaraguaPayrollDeductions({
            salary: originalSalary,
            salaryType: salary.salary_type,
            businessId,
            branchId: employee.branch_id,
            date: periodEnd
        });
    }

    let grossMonthlySalary;

    if (nicaraguaPayroll) {
        grossMonthlySalary = nicaraguaPayroll.salary.monthly_gross;
    } else {
        grossMonthlySalary = getMonthlySalary(
            originalSalary,
            salary.salary_type
        );
    }

    const context = {
        employee,
        period: {
            start: periodStart,
            end: periodEnd,
            type: "MONTHLY"
        },
        salary: {
            id: salary.id,
            amount: originalSalary,
            monthlyAmount: grossMonthlySalary,
            type: salary.salary_type,
            effective_from: salary.effective_from,
            effective_to: salary.effective_to
        },
        current: {
            grossSalary: grossMonthlySalary,
            netSalary: null
        },
        annual: {
            grossSalary: grossMonthlySalary * 12,
            netSalary: null
        }
    };

    const deductions = [];
    let totalDeductions = 0;

    if (nicaraguaPayroll) {
        const nicaraguaDeductions = nicaraguaPayroll.deductions;

        if (nicaraguaDeductions.inss_laboral) {
            const inss = nicaraguaDeductions.inss_laboral;
            deductions.push({
                rule_id: inss.rule_id,
                code: inss.code,
                name: inss.name,
                type: inss.type,
                calculation_type: inss.calculation_type,
                base_type: inss.base_type,
                base_amount: inss.base_amount,
                percentage: inss.percentage,
                amount: inss.amount
            });
            totalDeductions += inss.amount;
        }

        if (nicaraguaDeductions.ir) {
            const ir = nicaraguaDeductions.ir;
            deductions.push({
                rule_id: ir.rule_id,
                code: ir.code,
                name: ir.name,
                type: ir.type,
                calculation_type: ir.calculation_type,
                base_type: ir.base_type,
                base_amount: ir.annual_base,
                monthly_base: ir.monthly_base,
                annual_base: ir.annual_base,
                tier: ir.tier,
                excess: ir.excess,
                fixed_amount: ir.fixed_amount,
                percentage: ir.tier ? ir.tier.percentage : 0,
                percentage_amount: ir.percentage_amount,
                annual_amount: ir.annual_amount,
                amount: ir.amount
            });
            totalDeductions += ir.amount;
        }
    }

    const generalDeductionRules = generalRules.filter(
        rule => rule.type === "DEDUCTION"
    );

    for (const rule of generalDeductionRules) {
        const result = calculateRuleAmount({ rule, context });

        if (result === null) {
            continue;
        }

        deductions.push(result);
        totalDeductions += result.amount;
    }

    const netSalary = roundMoney(
        context.current.grossSalary - totalDeductions
    );

    context.current.netSalary = netSalary;

    context.annual.netSalary = roundMoney(
        netSalary * 12
    );

    const employerCostRules = generalRules.filter(
        rule => rule.type === "EMPLOYER_COST"
    );

    const employerCosts = [];
    let totalEmployerCosts = 0;

    for (const rule of employerCostRules) {
        const result = calculateRuleAmount({ rule, context });

        if (result === null) {
            continue;
        }

        employerCosts.push(result);
        totalEmployerCosts += result.amount;
    }

    const grossSalary = roundMoney(context.current.grossSalary);
    const deductionsTotal = roundMoney(totalDeductions);
    const finalNetSalary = roundMoney(grossSalary - deductionsTotal);

    const dynamicDeductions = Object.fromEntries(
        deductions.map(deduction => [
            deduction.code,
            {
                name: deduction.name,
                amount: roundMoney(deduction.amount)
            }
        ])
    );

    return {
        gross_salary: grossSalary,
        ...dynamicDeductions,
        total_deductions: deductionsTotal,
        net_salary: finalNetSalary
    };
};