import sequelize from "../../../config/database.js";
import PayrollPeriod from "../../../models/Worksheet/Payroll/PayrollPeriod.js";
import PayrollEmployee from "../../../models/Worksheet/Payroll/PayrollEmployee.js";
import PayrollItem from "../../../models/Worksheet/Payroll/PayrollItem.js";

const EDITABLE_STATUS = "DRAFT";

class PayrollEmployeeError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.name = "PayrollEmployeeError";
        this.statusCode = statusCode;
    }
}

const fail = (message, statusCode = 400) => {
    throw new PayrollEmployeeError(message, statusCode);
};

const validateId = (value, fieldName = "ID") => {
    const id = Number(value);

    if (!Number.isSafeInteger(id) || id < 1) {
        fail(`${fieldName} no es válido.`);
    }

    return id;
};

const ensureBusinessId = (businessId) => {
    if (!businessId) {
        fail("No se ha identificado la empresa autenticada.", 401);
    }
};

const getPeriodOrFail = async (
    periodId, businessId, transaction, lock = false
) => {
    const options = {
        where: {
        id: periodId,
        business_id: businessId,
        },
        transaction,
    };

    if (lock && transaction) {
        options.lock = transaction.LOCK.UPDATE;
    }

    const period = await PayrollPeriod.findOne(options);

    if (!period) {
        fail("Período de nómina no encontrado.", 404);
    }

    return period;
};

export const createPayrollEmployee = async (
    periodId, employeeId, businessId
) => {
    ensureBusinessId(businessId);

    periodId = validateId(periodId, "ID del período");
    employeeId = validateId(employeeId, "ID del empleado");

    return sequelize.transaction(async (transaction) => {
        const period = await getPeriodOrFail(
            periodId,
            businessId,
            transaction,
            true
        );

        if (period.status !== EDITABLE_STATUS) {
            fail(
                "Solo se pueden agregar empleados a períodos en estado DRAFT.",
                409
            );
        }

        const existing = await PayrollEmployee.findOne({
            where: {
                payrollperiodid: period.id,
                employee_id: employeeId,
            },
        transaction,
        });

        if (existing) {
            fail(
                "Este empleado ya está incluido en el período de nómina.",
                409
            );
        }

        const payrollEmployee = await PayrollEmployee.create(
        {
            payrollperiodid: period.id,
            employeeid: employeeId,
            grosssalary: 0,
            totalearnings: 0,
            totaldeductions: 0,
            netsalary: 0,
            employercost: 0,
        },
        { transaction }
        );

        return payrollEmployee;
    });
};

export const getPayrollEmployeesByPeriod = async (
    periodId, businessId, filters = {}
) => {
    ensureBusinessId(businessId);

    periodId = validateId(periodId, "ID del período");

    const page = Number(filters.page ?? 1);
    const limit = Number(filters.limit ?? 10);

    if (
        !Number.isInteger(page) ||
        page < 1 ||
        !Number.isInteger(limit) ||
        limit < 1 ||
        limit > 100
    ) {
        fail(
        "La paginación no es válida. limit debe estar entre 1 y 100."
        );
    }

    await getPeriodOrFail(periodId, businessId);

    const result = await PayrollEmployee.findAndCountAll({
        where: {
            payrollperiodid: periodId,
        },
        include: [
        {
            model: PayrollItem,
            as: "items",
        },
        ],
        order: [["id", "ASC"]],
        limit,
        offset: (page - 1) * limit,
        distinct: true,
    });

    return {
        data: result.rows,
        pagination: {
            total: result.count,
            page,
            limit,
            totalPages: Math.ceil(result.count / limit),
        },
    };
};

export const getPayrollEmployeeById = async (
    periodId, payrollEmployeeId, businessId
) => {
    ensureBusinessId(businessId);

    periodId = validateId(periodId, "ID del período");
        payrollEmployeeId = validateId(
            payrollEmployeeId,
            "ID del resultado de nómina"
    );

    await getPeriodOrFail(periodId, businessId);

    const payrollEmployee = await PayrollEmployee.findOne({
        where: {
            id: payrollEmployeeId,
            payrollperiodid: periodId,
        },
        include: [
            {
                model: PayrollItem,
                as: "items",
            },
        ],
        order: [
            [
                { model: PayrollItem, as: "items" },
                "id",
                "ASC",
            ],
        ],
    });

    if (!payrollEmployee) {
        fail(
            "El empleado no tiene un resultado de nómina en este período.",
            404
        );
    }

    return payrollEmployee;
};

export const deletePayrollEmployee = async (
    periodId, payrollEmployeeId, businessId
) => {
    ensureBusinessId(businessId);

    periodId = validateId(periodId, "ID del período");
    payrollEmployeeId = validateId(
        payrollEmployeeId,
        "ID del resultado de nómina"
    );

    return sequelize.transaction(async (transaction) => {
        const period = await getPeriodOrFail(
            periodId,
            businessId,
            transaction,
            true
        );

        if (period.status !== EDITABLE_STATUS) {
            fail(
                "Solo se pueden eliminar empleados de períodos en estado DRAFT.",
                409
            );
        }

        const payrollEmployee = await PayrollEmployee.findOne({
            where: {
                id: payrollEmployeeId,
                payrollperiodid: period.id,
            },
            transaction,
        });

        if (!payrollEmployee) {
            fail(
                "El empleado no tiene un resultado de nómina en este período.",
                404
            );
        }

        const itemCount = await PayrollItem.count({
            where: {
                payrollemployeeid: payrollEmployee.id,
            },
            transaction,
        });

        if (itemCount > 0) {
            fail(
                "No se puede eliminar el resultado porque tiene conceptos de nómina asociados.",
                409
            );
        }

        await payrollEmployee.destroy({ transaction });

        return {
            message: "Empleado retirado del período de nómina correctamente.",
            id: payrollEmployee.id,
        };
    });
};