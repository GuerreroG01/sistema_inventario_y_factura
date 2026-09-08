import Employee from "../../../models/Worksheet/Employee/Employee.js";
import Branch from "../../../models/Branch.js";
import { Op } from "sequelize";
import EmployeeEmployment from "../../../models/Worksheet/Employee/EmployeeEmployment.js";
import { getTotalSalaries } from "./SalaryService.js";

export const createEmployee = async ( data, userId, businessId, branchId, rol ) => {
    const isPrivilegedRole = ["admin", "superAdmin"].includes(rol);
    const today = new Date().toLocaleDateString("en-CA", {
        timeZone: "America/Managua"
    });
    if (!isPrivilegedRole && !branchId) {
        throw new Error("branch_required");
    }

    const employeeBranchId = branchId;

    if (!employeeBranchId) {
        throw new Error("branch_required");
    }

    const branch = await Branch.findOne({
        where: {
            id: employeeBranchId,
            business_id: businessId
        }
    });

    if (!branch) {
        throw new Error("Sucursal no encontrada");
    }

    const employee = await Employee.create({
        business_id: businessId,
        branch_id: employeeBranchId,
        employee_code: data.employee_code,
        first_name: data.first_name,
        last_name: data.last_name,
        identification: data.identification ?? null,
        phone: data.phone ?? null,
        email: data.email ?? null,
        address: data.address ?? null,
        hire_date: data.hire_date ?? today,
        termination_date: null,
        status: data.status ?? "ACTIVE",
        created_by: userId ?? null,
        updated_by: userId ?? null
    });
    return employee;
};

export const getAllEmployees = async ({
    page = 1, limit = 10, search, status, businessId, branchId, rol
} = {}) => {

    page = Number(page);
    limit = Number(limit);

    const offset = (page - 1) * limit;

    const isPrivilegedRole = ["admin", "superAdmin"].includes(rol);

    const where = {
        business_id: businessId
    };

    if (!isPrivilegedRole) {
        if (!branchId) {
            throw new Error("branch_required");
        }

        where.branch_id = branchId;
    }

    if (status) {
        where.status = status;
    }

    if (search) {
        where[Op.or] = [
            {
                first_name: {
                    [Op.iLike]: `%${search}%`
                }
            },
            {
                last_name: {
                    [Op.iLike]: `%${search}%`
                }
            },
            {
                employee_code: {
                    [Op.iLike]: `%${search}%`
                }
            },
            {
                identification: {
                    [Op.iLike]: `%${search}%`
                }
            }
        ];
    }

    const { count, rows } = await Employee.findAndCountAll({
        where,
        include: [
            {
                model: Branch,
                as: "branch",
                attributes: ["id", "name"],
                required: true
            },
            {
                model: EmployeeEmployment,
                as: "employments",
                attributes: [
                    "id",
                    "position",
                    "department",
                    "employment_type",
                    "start_date",
                    "end_date",
                    "status"
                ],
                where: {
                    start_date: {
                        [Op.lte]: new Date()
                    },
                    [Op.or]: [
                        {
                            end_date: null
                        },
                        {
                            end_date: {
                                [Op.gte]: new Date()
                            }
                        }
                    ]
                },
                required: false,
                separate: true,
                limit: 1,
                order: [["start_date", "DESC"]]
            }
        ],
        order: [["id", "DESC"]],
        limit,
        offset
    });

    const data = rows.map(employee => {
        const employeeJson = employee.toJSON();

        const currentEmployment =
            employeeJson.employments?.[0] ?? null;

        delete employeeJson.employments;

        return {
            ...employeeJson,
            position: currentEmployment?.position ?? null,
            department: currentEmployment?.department ?? null
        };
    });

    return {
        data,
        pagination: {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit)
        }
    };
};

export const getEmployeeById = async (id, businessId, branchId, rol) => {
    const where = {
        id,
        business_id: businessId
    };

    const isPrivilegedRole = ["admin", "superAdmin"].includes(rol);

    if (!isPrivilegedRole) {
        if (!branchId) {
            throw new Error("branch_required");
        }

        where.branch_id = branchId;
    }

    const employee = await Employee.findOne({
        where,
        attributes: {
            exclude: ["position", "department"]
        },
        include: [
            {
                model: Branch,
                as: "branch",
                attributes: ["id", "name"],
                required: true
            }
        ]
    });

    if (!employee) {
        throw new Error("Empleado no encontrado");
    }

    const today = new Date();

    const employment = await EmployeeEmployment.findOne({
        where: {
            employee_id: id,
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
        attributes: ["position", "department"],
        order: [["start_date", "DESC"]]
    });

    const employeeData = employee.toJSON();

    employeeData.position = employment?.position ?? null;
    employeeData.department = employment?.department ?? null;

    return employeeData;
};


export const updateEmployee = async ( id, data, userId, businessId, branchId, rol ) => {
    const isPrivilegedRole = ["admin", "superAdmin"].includes(rol);

    const where = {
        id,
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

    let employeeBranchId = employee.branch_id;

    if (isPrivilegedRole) {
        if (data.branch_id !== undefined) {
            employeeBranchId = data.branch_id;
        }
    } else {
        employeeBranchId = branchId;
    }
    if (data.branch_id !== undefined && isPrivilegedRole) {
        const branch = await Branch.findOne({
            where: {
                id: employeeBranchId,
                business_id: businessId
            }
        });

        if (!branch) {
            throw new Error("Sucursal no encontrada");
        }
    }

    await employee.update({
        employee_code: data.employee_code ?? employee.employee_code,
        first_name: data.first_name ?? employee.first_name,
        last_name: data.last_name ?? employee.last_name,
        identification: data.identification ?? employee.identification,
        phone: data.phone ?? employee.phone,
        email: data.email ?? employee.email,
        address: data.address ?? employee.address,
        branch_id: employeeBranchId,
        updated_by: userId ?? employee.updated_by
    });
    return employee;
};

export const changeStatus = async ( id, status, userId, businessId, branchId, rol) => {
    const isPrivilegedRole = ["admin", "superAdmin"].includes(rol);

    const where = {
        id,
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

    await employee.update({
        status,
        updated_by: userId ?? employee.updated_by
    });

    const updatedEmployee = await Employee.findOne({
        where,
        include: [
            {
                model: EmployeeEmployment,
                as: "employments",
                attributes: [
                    "position",
                    "department"
                ],
                where: {
                    start_date: {
                        [Op.lte]: new Date()
                    },
                    [Op.or]: [
                        {
                            end_date: null
                        },
                        {
                            end_date: {
                                [Op.gte]: new Date()
                            }
                        }
                    ]
                },
                required: false,
                separate: true,
                limit: 1,
                order: [["start_date", "DESC"]]
            }
        ]
    });

    if (!updatedEmployee) {
        throw new Error("Empleado no encontrado");
    }

    const employeeJson = updatedEmployee.toJSON();

    const currentEmployment =
        employeeJson.employments?.[0] ?? null;

    delete employeeJson.employments;

    return {
        ...employeeJson,
        position: currentEmployment?.position ?? null,
        department: currentEmployment?.department ?? null
    };
};

export const getEmployeeSummary = async ( businessId, branchId = null, date = null) => {
    const isBranchFilter = branchId !== null && branchId !== undefined;

    const employeeWhere = {
        business_id: businessId
    };

    if (isBranchFilter) {
        employeeWhere.branch_id = branchId;
    }

    const [totalEmployees, activeEmployees, inactiveEmployees] =
        await Promise.all([
            Employee.count({
                where: employeeWhere
            }),

            Employee.count({
                where: {
                    ...employeeWhere,
                    status: "ACTIVE"
                }
            }),

            Employee.count({
                where: {
                    ...employeeWhere,
                    status: "INACTIVE"
                }
            })
        ]);

    const salarySummary = await getTotalSalaries(
        businessId,
        branchId,
        date
    );

    return {
        employees: {
            total: totalEmployees,
            active: activeEmployees,
            inactive: inactiveEmployees
        },

        salaries: {
            total: salarySummary.total,
            employeesWithSalary: salarySummary.employeesWithSalary
        },

        filters: {
            business_id: businessId,
            branch_id: branchId ?? null,
            date: salarySummary.date
        }
    };
};