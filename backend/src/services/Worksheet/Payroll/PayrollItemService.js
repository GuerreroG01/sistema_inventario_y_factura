import sequelize from "../../../config/database.js";
import PayrollPeriod from "../../../models/Worksheet/Payroll/PayrollPeriod.js";
import PayrollEmployee from "../../../models/Worksheet/Payroll/PayrollEmployee.js";
import PayrollItem from "../../../models/Worksheet/Payroll/PayrollItem.js";

const EDITABLE_STATUS = "DRAFT";

const ALLOWED_TYPES = [
    "BASESALARY",
    "EARNING",
    "DEDUCTION",
    "EMPLOYER_COST",
];

class PayrollItemError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.name = "PayrollItemError";
        this.statusCode = statusCode;
    }
}

const fail = (message, statusCode = 400) => {
    throw new PayrollItemError(message, statusCode);
};

const ensureBusinessId = (businessId) => {
    if (!businessId) {
        fail("No se ha identificado la empresa autenticada.", 401);
    }
};

const validateId = (value, fieldName = "ID") => {
    const id = Number(value);

    if (!Number.isSafeInteger(id) || id < 1) {
        fail(`${fieldName} no es válido.`);
    }

    return id;
};

const validateItemData = (data) => {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        fail("Debes proporcionar los datos del concepto.");
    }

    const allowedFields = ["concept", "amount", "type"];
    const receivedFields = Object.keys(data);

    if (
        receivedFields.length === 0 ||
        receivedFields.some((field) => !allowedFields.includes(field))
    ) {
        fail("Solo puedes proporcionar concept, amount y type.");
    }

    if (
        Object.hasOwn(data, "concept") &&
        (typeof data.concept !== "string" ||
        !data.concept.trim() ||
        data.concept.trim().length > 150)
    ) {
        fail("El concepto debe ser un texto de entre 1 y 150 caracteres.");
    }

    if (Object.hasOwn(data, "amount")) {
        const amount = Number(data.amount);

        if (
            data.amount === null ||
            data.amount === "" ||
            !Number.isFinite(amount) ||
            amount < 0 ||
            Math.round(amount * 100) !== amount * 100
        ) {
            fail("El importe debe ser un número válido con máximo dos decimales.");
        }
    }

    if (
        Object.hasOwn(data, "type") &&
        !ALLOWED_TYPES.includes(data.type)
    ) {
        fail("El tipo de concepto no es válido.");
    }
};

const getPayrollEmployeeOrFail = async (
    payrollEmployeeId, businessId, transaction, lock = false
) => {
    const employeeOptions = {
            where: {
            id: payrollEmployeeId,
        },
        transaction,
    };

    if (lock && transaction) {
        employeeOptions.lock = transaction.LOCK.UPDATE;
    }

    const payrollEmployee = await PayrollEmployee.findOne(
        employeeOptions
    );

    if (!payrollEmployee) {
        fail("Resultado de nómina del empleado no encontrado.", 404);
    }

    const periodOptions = {
        where: {
            id: payrollEmployee.payrollperiodid,
            business_id: businessId,
        },
        transaction,
    };

    if (lock && transaction) {
        periodOptions.lock = transaction.LOCK.UPDATE;
    }

    const period = await PayrollPeriod.findOne(periodOptions);

    if (!period) {
        fail("Resultado de nómina del empleado no encontrado.", 404);
    }

    return { payrollEmployee, period };
};

const getPayrollItemOrFail = async (
    itemId, payrollEmployeeId, transaction, lock = false
) => {
    const options = {
        where: {
            id: itemId,
            payrollemployeeid: payrollEmployeeId,
        },
        transaction,
    };

    if (lock && transaction) {
        options.lock = transaction.LOCK.UPDATE;
    }

    const item = await PayrollItem.findOne(options);

    if (!item) {
        fail("Concepto de nómina no encontrado.", 404);
    }
    return item;
};

const recalculatePayrollEmployee = async (
    payrollEmployee, transaction
) => {
    const items = await PayrollItem.findAll({
        where: {
            payrollemployeeid: payrollEmployee.id,
        },
        attributes: ["type", "amount"],
        transaction,
    });

    let grossSalaryCents = 0;
    let totalEarningsCents = 0;
    let totalDeductionsCents = 0;
    let employerContributionsCents = 0;

    for (const item of items) {
        const amount = Number(item.amount);

        if (!Number.isFinite(amount)) {
            fail("Se encontró un importe inválido en los conceptos.");
        }

        const cents = Math.round(amount * 100);

        switch (item.type) {
            case "BASESALARY":
                grossSalaryCents += cents;
                totalEarningsCents += cents;
                break;

            case "EARNING":
                totalEarningsCents += cents;
                break;

            case "DEDUCTION":
                totalDeductionsCents += cents;
                break;

            case "EMPLOYER_COST":
                employerContributionsCents += cents;
                break;
        }
    }

    const netSalaryCents = totalEarningsCents - totalDeductionsCents;
    const employerCostCents = totalEarningsCents + employerContributionsCents;

    await payrollEmployee.update(
        {
            grosssalary: grossSalaryCents / 100,
            totalearnings: totalEarningsCents / 100,
            totaldeductions: totalDeductionsCents / 100,
            netsalary: netSalaryCents / 100,
            employer_cost: employerCostCents / 100,
        },
        { transaction }
    );

    return payrollEmployee;
};

export const createPayrollItem = async (
    payrollEmployeeId, data, businessId
) => {
    ensureBusinessId(businessId);

    payrollEmployeeId = validateId(
        payrollEmployeeId,
        "ID del resultado de nómina"
    );

    validateItemData(data);

    if (
        !Object.hasOwn(data, "concept") ||
        !Object.hasOwn(data, "amount") ||
        !Object.hasOwn(data, "type")
    ) {
        fail("Debes proporcionar concept, amount y type.");
    }

    return sequelize.transaction(async (transaction) => {
        const { payrollEmployee, period } =
        await getPayrollEmployeeOrFail(
            payrollEmployeeId,
            businessId,
            transaction,
            true
        );

        if (period.status !== EDITABLE_STATUS) {
            fail(
                "Solo puedes agregar conceptos a períodos en estado DRAFT.",
                409
            );
        }

        const item = await PayrollItem.create(
        {
            payrollemployeeid: payrollEmployee.id,
            concept: data.concept.trim(),
            amount: Number(data.amount),
            type: data.type,
        },
        { transaction }
        );

        await recalculatePayrollEmployee(payrollEmployee, transaction);

        return item;
    });
};

export const getPayrollItems = async (
    payrollEmployeeId, businessId
) => {
    ensureBusinessId(businessId);

    payrollEmployeeId = validateId(
        payrollEmployeeId,
        "ID del resultado de nómina"
    );

    const { payrollEmployee } = await getPayrollEmployeeOrFail(
        payrollEmployeeId,
        businessId
    );

    return PayrollItem.findAll({
        where: {
            payrollemployeeid: payrollEmployee.id,
        },
        order: [["id", "ASC"]],
    });
};

export const getPayrollItemById = async (
    payrollEmployeeId,
    itemId,
    businessId
) => {
    ensureBusinessId(businessId);

    payrollEmployeeId = validateId(
        payrollEmployeeId,
        "ID del resultado de nómina"
    );

    itemId = validateId(itemId, "ID del concepto");

    await getPayrollEmployeeOrFail(payrollEmployeeId, businessId);

    return getPayrollItemOrFail(itemId, payrollEmployeeId);
};

export const updatePayrollItem = async (
    payrollEmployeeId, itemId, data, businessId
) => {
    ensureBusinessId(businessId);

    payrollEmployeeId = validateId(
        payrollEmployeeId,
        "ID del resultado de nómina"
    );

    itemId = validateId(itemId, "ID del concepto");

    validateItemData(data);

    return sequelize.transaction(async (transaction) => {
        const { payrollEmployee, period } =
        await getPayrollEmployeeOrFail(
            payrollEmployeeId,
            businessId,
            transaction,
            true
        );

        if (period.status !== EDITABLE_STATUS) {
            fail(
                "Solo puedes modificar conceptos de períodos en estado DRAFT.",
                409
            );
        }

        const item = await getPayrollItemOrFail(
            itemId,
            payrollEmployee.id,
            transaction,
            true
        );

        const changes = {};

        if (Object.hasOwn(data, "concept")) {
            changes.concept = data.concept.trim();
        }

        if (Object.hasOwn(data, "amount")) {
            changes.amount = Number(data.amount);
        }

        if (Object.hasOwn(data, "type")) {
            changes.type = data.type;
        }

        await item.update(changes, { transaction });
        await recalculatePayrollEmployee(payrollEmployee, transaction);

        return item;
    });
};

export const deletePayrollItem = async (
    payrollEmployeeId, itemId, businessId
) => {
    ensureBusinessId(businessId);

    payrollEmployeeId = validateId(
        payrollEmployeeId,
        "ID del resultado de nómina"
    );

    itemId = validateId(itemId, "ID del concepto");

    return sequelize.transaction(async (transaction) => {
        const { payrollEmployee, period } =
        await getPayrollEmployeeOrFail(
            payrollEmployeeId,
            businessId,
            transaction,
            true
        );

        if (period.status !== EDITABLE_STATUS) {
            fail(
                "Solo puedes eliminar conceptos de períodos en estado DRAFT.",
                409
            );
        }

        const item = await getPayrollItemOrFail(
            itemId,
            payrollEmployee.id,
            transaction,
            true
        );

        await item.destroy({ transaction });
        await recalculatePayrollEmployee(payrollEmployee, transaction);

        return {
            message: "Concepto de nómina eliminado correctamente.",
            id: item.id,
        };
    });
};