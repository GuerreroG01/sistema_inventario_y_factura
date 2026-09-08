import EmployeeEmployment from "../../../models/Worksheet/Employee/EmployeeEmployment.js";
import Employee from "../../../models/Worksheet/Employee/Employee.js";
import { updateEmployee } from "./EmployeeService.js";
import { Op } from "sequelize";
/*
Hay que revisar el metodo create para ver si de verdad asigna automaticamente del token pero que también pueda asignar de otra
sucursal desde el frontend y también hay que probar si los modales funcionan y guardan correctamente los datos.
*/
export const createEmployment = async ( employeeId, data, businessId, branchId, rol ) => {
    const isPrivilegedRole = ["admin", "superAdmin"].includes(rol);

    const where = {
        id: employeeId,
        business_id: businessId
    };

    if (!isPrivilegedRole) {
        if (!branchId) {
            throw new Error("branch_required");
        }

        where.branch_id = branchId;
    }

    const employee = await Employee.findOne({
        where
    });

    if (!employee) {
        throw new Error("Empleado no encontrado");
    }

    const startDate = data.start_date;

    if (!startDate) {
        throw new Error("La fecha de inicio es obligatoria");
    }

    const employmentBranchId = isPrivilegedRole
        ? data.branch_id ?? branchId
        : branchId;

    if (!employmentBranchId) {
        throw new Error("branch_required");
    }

    const currentEmployment = await EmployeeEmployment.findOne({
        where: {
            employee_id: employeeId,
            status: "ACTIVE",
            [Op.or]: [
                { end_date: null },
                { end_date: { [Op.gte]: startDate } }
            ]
        },
        order: [["start_date", "DESC"]]
    });

    if (currentEmployment) {
        const newStartDate = new Date(`${startDate}T00:00:00`);

        const currentStartDate = new Date(
            `${currentEmployment.start_date}T00:00:00`
        );

        if (newStartDate <= currentStartDate) {
            throw new Error(
                "La fecha de inicio debe ser posterior al inicio de la relación laboral actual"
            );
        }

        const previousEndDate = new Date(newStartDate);
        previousEndDate.setDate(previousEndDate.getDate() - 1);

        await currentEmployment.update({
            end_date: previousEndDate.toISOString().split("T")[0],
            status: "ENDED"
        });
    }

    const employment = await EmployeeEmployment.create({
        employee_id: employeeId,
        branch_id: employmentBranchId,
        position: data.position,
        department: data.department ?? null,
        employment_type: data.employment_type ?? "FULL_TIME",
        start_date: startDate,
        end_date: data.end_date ?? null,
        status: data.status ?? "ACTIVE"
    });

    await updateEmployee(
        employeeId,
        {
            position: data.position,
            department: data.department,
            branch_id: employmentBranchId
        },
        null, businessId, branchId, rol
    );

    return employment;
};

//Obtener el historial de puestos del empleado
export const getEmploymentHistory = async ( employeeId, businessId, branchId, rol) => {
    const isPrivilegedRole = ["admin", "superAdmin"].includes(rol);

    const where = {
        id: employeeId,
        business_id: businessId
    };

    if (!isPrivilegedRole) {
        if (!branchId) {
            throw new Error("branch_required");
        }

        where.branch_id = branchId;
    }

    const employee = await Employee.findOne({
        where
    });

    if (!employee) {
        throw new Error("Empleado no encontrado");
    }

    const employments = await EmployeeEmployment.findAll({
        where: {
            employee_id: employeeId
        },
        order: [["start_date", "DESC"]]
    });

    return employments;
};

//Obtener el puesto actual del empleado
export const getCurrentEmployment = async ( employeeId, businessId, branchId, rol ) => {
    const isPrivilegedRole = ["admin", "superAdmin"].includes(rol);

    const where = {
        id: employeeId,
        business_id: businessId
    };

    if (!isPrivilegedRole) {
        if (!branchId) {
            throw new Error("branch_required");
        }

        where.branch_id = branchId;
    }

    const employee = await Employee.findOne({
        where
    });

    if (!employee) {
        throw new Error("Empleado no encontrado");
    }

    const today = new Date();

    const employment = await EmployeeEmployment.findOne({
        where: {
            employee_id: employeeId,
            start_date: {
                [Op.lte]: today
            },
            [Op.or]: [
                {
                    end_date: null
                },
                {
                    end_date: {
                        [Op.gte]: today
                    }
                }
            ]
        },
        order: [["start_date", "DESC"]]
    });

    if (employment) {
        return employment;
    }

    const employments = await EmployeeEmployment.findAll({
        where: {
            employee_id: employeeId
        },
        order: [["start_date", "DESC"]]
    });

    if (employments.length === 1) {
        return employments[0];
    }

    throw new Error(
        "El empleado no tiene una relación laboral activa"
    );
};
//Obtener el puesto por fecha
export const getEmploymentAtDate = async ( employeeId, date, businessId, branchId, rol ) => {
    const isPrivilegedRole = ["admin", "superAdmin"].includes(rol);

    const where = {
        id: employeeId,
        business_id: businessId
    };

    if (!isPrivilegedRole) {
        if (!branchId) {
            throw new Error("branch_required");
        }

        where.branch_id = branchId;
    }

    const employee = await Employee.findOne({
        where
    });

    if (!employee) {
        throw new Error("Empleado no encontrado");
    }

    if (!date) {
        throw new Error("La fecha es obligatoria");
    }

    const employment = await EmployeeEmployment.findOne({
        where: {
            employee_id: employeeId,
            start_date: {
                [Op.lte]: date
            },
            [Op.or]: [
                {
                    end_date: null
                },
                {
                    end_date: {
                        [Op.gte]: date
                    }
                }
            ]
        },
        order: [["start_date", "DESC"]]
    });

    if (!employment) {
        throw new Error(
            "No existe una relación laboral para esa fecha"
        );
    }
    return employment;
};
//Terminación de ese puesto( ya sea para cambiar o terminar relación laboral)
export const endEmployment = async ( employeeId, endDate, businessId, branchId, rol ) => {
    const isPrivilegedRole = ["admin", "superAdmin"].includes(rol);

    const where = {
        id: employeeId,
        business_id: businessId
    };

    if (!isPrivilegedRole) {
        if (!branchId) {
            throw new Error("branch_required");
        }

        where.branch_id = branchId;
    }

    const employee = await Employee.findOne({
        where
    });

    if (!employee) {
        throw new Error("Empleado no encontrado");
    }

    if (!endDate) {
        throw new Error("La fecha de finalización es obligatoria");
    }

    const today = new Date().toISOString().split("T")[0];

    const employment = await EmployeeEmployment.findOne({
        where: {
            employee_id: employeeId,
            status: "ACTIVE",
            end_date: null
        },
        order: [["start_date", "DESC"]]
    });

    if (!employment) {
        throw new Error(
            "El empleado no tiene una relación laboral activa"
        );
    }

    if (endDate < employment.start_date) {
        throw new Error(
            "La fecha de finalización no puede ser anterior a la fecha de inicio"
        );
    }

    if (endDate < today) {
        throw new Error(
            "La fecha de finalización no puede ser anterior a la fecha actual"
        );
    }

    await employment.update({
        end_date: endDate,
        status: "ENDED"
    });

    return employment;
};