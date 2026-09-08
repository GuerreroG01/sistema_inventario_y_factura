import EmployeeSalaryHistory from "../../../models/Worksheet/Employee/EmployeeSalaryHistory.js";
import Employee from "../../../models/Worksheet/Employee/Employee.js";
import { Op } from "sequelize";

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
        "El empleado no tiene una relación laboral activa"
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

    // No permitir cambios retroactivos
    if (newEffectiveFrom < today) {
        throw new Error(
            "La fecha de inicio no puede ser anterior a la fecha actual"
        );
    }

    // Validar rango
    if (
        newEffectiveTo &&
        newEffectiveTo < newEffectiveFrom
    ) {
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
        const salary = await createSalaryHistory(
            employeeId,
            data,
            businessId
        );

        return {
            isChange: false,
            data: salary
        };
    }

    const salary = await changeSalary(employeeId,data,businessId);

    return {
        isChange: true,
        data: salary
    };
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

        total += Number(salary.salary);
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