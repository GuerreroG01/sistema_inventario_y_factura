import { Op } from "sequelize";
import sequelize from "../../../config/database.js";
import Employee from "../../../models/Worksheet/Employee/Employee.js";
import PayrollPeriod from "../../../models/Worksheet/Payroll/PayrollPeriod.js";
import PayrollEmployee from "../../../models/Worksheet/Payroll/PayrollEmployee.js";
import PayrollItem from "../../../models/Worksheet/Payroll/PayrollItem.js";
import { calculatePayrollForPeriod } from "./PayrollCalculationService.js";

const EDITABLE_STATUS = "DRAFT";
const CANCELLED_STATUS = "CANCELLED";

const ALLOWED_STATUSES = [
    "DRAFT",
    "CALCULATED",
    "APPROVED",
    "PAID",
    "CANCELLED",
];

class PayrollPeriodError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.name = "PayrollPeriodError";
        this.statusCode = statusCode;
    }
}

const fail = (message, statusCode = 400) => {
    throw new PayrollPeriodError(message, statusCode);
};

const isValidDate = (value) => {
    if (typeof value !== "string") return false;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
    );
};

const validateDates = ({
    start_date, end_date, payment_date
}) => {
    if (!isValidDate(start_date)) {
        fail("start_date debe ser una fecha válida YYYY-MM-DD.");
    }

    if (!isValidDate(end_date)) {
        fail("end_date debe ser una fecha válida YYYY-MM-DD.");
    }

    if (start_date > end_date) {
        fail("La fecha inicial no puede ser posterior a la fecha final.");
    }

    if (payment_date !== undefined && !isValidDate(payment_date)) {
        fail("payment_date debe ser una fecha válida YYYY-MM-DD.");
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

const ensureNoOverlap = async ({
    businessId, startDate, endDate, excludePeriodId, transaction,
}) => {
    const where = {
        business_id: businessId,
        status: {
            [Op.ne]: CANCELLED_STATUS,
        },
        start_date: {
            [Op.lte]: endDate,
        },
        end_date: {
            [Op.gte]: startDate,
        },
    };

    if (excludePeriodId !== undefined) {
        where.id = {
            [Op.ne]: excludePeriodId,
        };
    }

    const existingPeriod = await PayrollPeriod.findOne({
        where,
        transaction,
    });

    if (existingPeriod) {
        fail(
            `El período se solapa con otro período de nómina (ID: ${existingPeriod.id}).`,
            409
        );
    }
};

export const createPayrollPeriod = async (data, businessId) => {
    if (!businessId) {
        fail("No se ha identificado la empresa autenticada.", 401);
    }

    if (!data || typeof data !== "object") {
        fail("Debes proporcionar los datos del período.");
    }

    const { start_date, end_date, payment_date } = data;

    validateDates({
        start_date,
        end_date,
        payment_date,
    });

    return sequelize.transaction(async (transaction) => {
        await ensureNoOverlap({
            businessId,
            startDate: start_date,
            endDate: end_date,
            transaction,
        });

        const period = await PayrollPeriod.create(
            {
                business_id: businessId,
                start_date,
                end_date,
                payment_date,
                status: "DRAFT",
            },
            { transaction }
        );

        return period;
    });
};

export const getPayrollPeriods = async (
    businessId, filters = {}
) => {
    if (!businessId) {
        fail("No se ha identificado la empresa autenticada.", 401);
    }

    const page = Number(filters.page ?? 1);
    const limit = Number(filters.limit ?? 10);

    if (
        !Number.isInteger(page) ||
        page < 1 ||
        !Number.isInteger(limit) ||
        limit < 1 ||
        limit > 100
    ) {
        fail("La paginación no es válida. limit debe estar entre 1 y 100.");
    }

    const where = {
        business_id: businessId,
    };

    if (filters.status !== undefined) {
        if (!ALLOWED_STATUSES.includes(filters.status)) {
            fail("El estado solicitado no es válido.");
        }

        where.status = filters.status;
    }

    if (filters.start_date !== undefined) {
        if (!isValidDate(filters.start_date)) {
            fail("El filtro start_date no es válido.");
        }

        where.start_date = {
            [Op.gte]: filters.start_date,
        };
    }

    if (filters.end_date !== undefined) {
        if (!isValidDate(filters.end_date)) {
            fail("El filtro end_date no es válido.");
        }

        where.end_date = {
            [Op.lte]: filters.end_date,
        };
    }

    const result = await PayrollPeriod.findAndCountAll({
        where,
        order: [
            ["start_date", "DESC"],
            ["id", "DESC"],
        ],
        limit,
        offset: (page - 1) * limit,
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

export const getPayrollPeriodById = async (
    periodId, businessId
) => {
    if (!businessId) {
        fail("No se ha identificado la empresa autenticada.", 401);
    }

    if (!Number.isInteger(Number(periodId)) || Number(periodId) < 1) {
        fail("El ID del período no es válido.");
    }

    const period = await PayrollPeriod.findOne({
        where: {
            id: Number(periodId),
            business_id: businessId,
        },
        include: [
            {
                model: PayrollEmployee,
                as: "employees",
                include: [
                    {
                        model: PayrollItem,
                        as: "items",
                    },
                ],
            },
        ],
        order: [
            [{ model: PayrollEmployee, as: "employees" }, "id", "ASC"],
            [
                { model: PayrollEmployee, as: "employees" },
                { model: PayrollItem, as: "items" },
                "id",
                "ASC",
            ],
        ],
    });

    if (!period) {
        fail("Período de nómina no encontrado.", 404);
    }

    return period;
};

export const updatePayrollPeriod = async (
    periodId, data, businessId
) => {
    if (!businessId) {
        fail("No se ha identificado la empresa autenticada.", 401);
    }

    if (!data || typeof data !== "object") {
        fail("Debes proporcionar los datos que deseas actualizar.");
    }

    const allowedFields = [
        "start_date",
        "end_date",
        "payment_date",
    ];

    const receivedFields = Object.keys(data);

    if (
        receivedFields.length === 0 ||
        receivedFields.some((field) => !allowedFields.includes(field))
    ) {
        fail(
            "Solo puedes actualizar start_date, end_date y payment_date."
        );
    }

    return sequelize.transaction(async (transaction) => {
        const period = await getPeriodOrFail(
            periodId,
            businessId,
            transaction,
            true
        );

        if (period.status !== EDITABLE_STATUS) {
            fail(
                "Solo se pueden modificar períodos en estado DRAFT.",
                409
            );
        }

        const newDates = {
            start_date: data.start_date ?? period.start_date,
            end_date: data.end_date ?? period.end_date,
            payment_date: data.payment_date ?? period.payment_date,
        };

        validateDates(newDates);

        await ensureNoOverlap({
            businessId,
            startDate: newDates.start_date,
            endDate: newDates.end_date,
            excludePeriodId: period.id,
            transaction,
        });

        await period.update(newDates, { transaction });

        return period;
    });
};

export const deletePayrollPeriod = async (
    periodId, businessId
) => {
    if (!businessId) {
        fail("No se ha identificado la empresa autenticada.", 401);
    }

    if (!Number.isInteger(Number(periodId)) || Number(periodId) < 1) {
        fail("El ID del período no es válido.");
    }

    return sequelize.transaction(async (transaction) => {
        const period = await getPeriodOrFail(
            Number(periodId),
            businessId,
            transaction,
            true
        );

        if (period.status !== EDITABLE_STATUS) {
            fail(
                "Solo se pueden eliminar períodos en estado DRAFT.",
                409
            );
        }

        const payrollEmployeeCount = await PayrollEmployee.count({
            where: {
                payroll_period_id: period.id,
            },
            transaction,
        });

        if (payrollEmployeeCount > 0) {
            fail(
                "No se puede eliminar el período porque ya tiene resultados de nómina.",
                409
            );
        }
        await period.destroy({ transaction });
        return {
            message: "Período de nómina eliminado correctamente.",
            id: period.id,
        };
    });
};

export const ensureCurrentPayrollPeriod = async (businessId) => {
    if (!businessId) {
        fail("No se ha identificado la empresa autenticada.", 401);
    }

    const now = new Date();

    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Managua",
        year: "numeric",
        month: "2-digit",
    }).formatToParts(now);

    const year = Number(
        parts.find((part) => part.type === "year").value
    );

    const month = Number(
        parts.find((part) => part.type === "month").value
    );

    const start_date =
        `${year}-${String(month).padStart(2, "0")}-01`;

    const lastDay = new Date(
        Date.UTC(year, month, 0)
    ).getUTCDate();

    const end_date =
        `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

    const existingPeriod = await PayrollPeriod.findOne({
        where: {
            business_id: businessId,
            start_date,
            end_date,
        },
    });

    if (existingPeriod) {
        return {
            created: false,
            period: existingPeriod,
        };
    }

    const period = await createPayrollPeriod(
        {
            start_date,
            end_date,
            payment_date: end_date
        },
        businessId
    );

    return {
        created: true,
        period,
    };
};

export const updatePayrollPeriodStatus = async (
    periodId, newStatus, businessId
) => {
    if (!businessId) {
        fail("No se ha identificado la empresa autenticada.", 401);
    }

    if (!Number.isInteger(Number(periodId)) || Number(periodId) < 1) {
        fail("El ID del período no es válido.");
    }

    if (!ALLOWED_STATUSES.includes(newStatus)) {
        fail("El estado solicitado no es válido.");
    }

    return sequelize.transaction(async (transaction) => {
        const period = await getPeriodOrFail(
            Number(periodId),
            businessId,
            transaction,
            true
        );

        const currentStatus = period.status;

        if (currentStatus === newStatus) {
            return period;
        }

        if (currentStatus === "CANCELLED") {
            fail("No se puede modificar un período que ya ha sido cancelado.", 409);
        }

        if (currentStatus === "PAID") {
            fail("No se puede modificar un período que ya ha sido pagado.", 409);
        }

        const validTransitions = {
            DRAFT: ["CALCULATED", "CANCELLED"],
            CALCULATED: ["DRAFT", "APPROVED", "CANCELLED"],
            APPROVED: ["CALCULATED", "PAID", "CANCELLED"],
            PAID: [],
            CANCELLED: [],
        };

        const allowedNextStates = validTransitions[currentStatus] || [];

        if (!allowedNextStates.includes(newStatus)) {
            fail(
                `No está permitido cambiar el estado del período de ${currentStatus} a ${newStatus}.`,
                409
            );
        }

        await period.update({ status: newStatus }, { transaction });

        return period;
    });
};

export const processAndSavePayrollForPeriod = async ({
    payrollPeriodId,
    businessId,
} = {}) => {
    // 1. Validar y obtener el período (ya valida business_id + existencia)
    const period = await getPayrollPeriodById(payrollPeriodId, businessId);

    // Opcional pero recomendado: validar estado
    if (!["DRAFT", "CALCULATED"].includes(period.status)) {
        fail("Solo se puede calcular nómina en períodos en estado DRAFT o CALCULATED.");
    }

    const startDate = period.start_date;
    const endDate = period.end_date;

    // 2. Calcular (reutilizamos el método puro)
    // Nota: si en el futuro el período tiene branch_id, se puede pasar aquí
    const calculationResult = await calculatePayrollForPeriod({
        businessId,
        startDate,
        endDate,
        // branchId: period.branch_id || null,  // descomentar si lo agregas
    });

    // 3. Guardar todo en una sola transacción
    const transaction = await sequelize.transaction();

    try {
        const savedEmployees = [];

        for (const empCalc of calculationResult.employees) {
            // Opción A: saltar errores
            if (empCalc.status === "ERROR") {
                continue;
            }

            // Upsert del empleado de nómina
            const [payrollEmployee] = await PayrollEmployee.upsert(
                {
                    payroll_period_id: period.id,
                    employee_id: empCalc.employee_id,
                    employment_id: empCalc.employment_id,
                    gross_salary: empCalc.gross_salary,
                    total_earnings: empCalc.total_earnings,
                    total_deductions: empCalc.total_deductions,
                    net_salary: empCalc.net_salary,
                    employer_cost: empCalc.employer_cost,
                    status: "CALCULATED",
                },
                {
                    transaction,
                    returning: true, // importante en PostgreSQL
                }
            );

            // Eliminar items anteriores (por si es un recálculo)
            await PayrollItem.destroy({
                where: { payroll_employee_id: payrollEmployee.id },
                transaction,
            });

            // Crear los nuevos items
            if (empCalc.items?.length > 0) {
                const itemsToCreate = empCalc.items.map((item) => ({
                    payroll_employee_id: payrollEmployee.id,
                    payroll_rule_id: item.payroll_rule_id,
                    concept: item.concept,
                    type: item.type,
                    amount: item.amount,
                    calculation_base: item.calculation_base,
                    applied_percentage: item.applied_percentage,
                    description: item.description,
                }));

                await PayrollItem.bulkCreate(itemsToCreate, { transaction });
            }

            savedEmployees.push({
                ...empCalc,
                payroll_employee_id: payrollEmployee.id,
            });
        }

        // Actualizar el estado del período
        await period.update(
            { status: "CALCULATED" },
            { transaction }
        );

        await transaction.commit();

        return {
            period: {
                id: period.id,
                start_date: period.start_date,
                end_date: period.end_date,
                payment_date: period.payment_date,
                status: "CALCULATED",
            },
            totalEmployees: savedEmployees.length,
            employees: savedEmployees,
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};


export const getPayrollPeriodSummary = async (payrollPeriodId) => {
    if (
        payrollPeriodId === undefined ||
        payrollPeriodId === null ||
        String(payrollPeriodId).trim() === "" ||
        !Number.isInteger(Number(payrollPeriodId)) ||
        Number(payrollPeriodId) <= 0
    ) {
        throw new Error("payroll_period_id_required");
    }

    const period = await PayrollPeriod.findByPk(
        Number(payrollPeriodId),
        {
            attributes: [
                "id",
                "start_date",
                "end_date",
                "status",
            ],
            include: [
                {
                    model: PayrollEmployee,
                    as: "employees",
                    attributes: [
                        "id",
                        "employee_id",
                        "gross_salary",
                        "total_earnings",
                        "total_deductions",
                        "net_salary",
                        "employer_cost",
                        "status",
                    ],
                    include: [
                        {
                            model: Employee,
                            as: "employee",
                            attributes: [
                                "id",
                                "first_name",
                                "last_name",
                            ],
                            required: true,
                        },
                    ],
                },
            ],
        }
    );

    if (!period) {
        throw new Error("payroll_period_not_found");
    }

    // La asociación PayrollPeriod.hasMany utiliza el alias "employees".
    const payrollEmployees = period.employees ?? [];

    const toMoney = (value) => {
        const number = Number(value ?? 0);
        return Number.isFinite(number) ? number : 0;
    };

    const roundMoney = (value) =>
        Math.round((value + Number.EPSILON) * 100) / 100;

    const sum = (field) =>
        roundMoney(
            payrollEmployees.reduce(
                (total, payrollEmployee) =>
                    total + toMoney(payrollEmployee[field]),
                0
            )
        );

    const employees = payrollEmployees.map((payrollEmployee) => {
        const employee = payrollEmployee.employee;

        return {
            employee_id: employee.id,
            payroll_employee_id: payrollEmployee.id,
            employee_name: [
                employee.first_name,
                employee.last_name,
            ]
                .filter(Boolean)
                .join(" "),
            gross_salary: Number(payrollEmployee.gross_salary),
            net_salary: Number(payrollEmployee.net_salary),
        };
    });

    return {
        period: {
            id: period.id,
            start_date: period.start_date,
            end_date: period.end_date,
            status: period.status,
        },

        summary: {
            total_employees: payrollEmployees.length,
            total_gross_salary: sum("gross_salary"),
            total_earnings: sum("total_earnings"),
            total_deductions: sum("total_deductions"),
            total_net_salary: sum("net_salary"),
            total_employer_cost: sum("employer_cost"),
        },

        employees,
    };
};


export const getPayrollItemsByEmployee = async ( payrollPeriodId, payrollEmployeeId ) => {
    if (
        !payrollPeriodId ||
        !Number.isInteger(Number(payrollPeriodId)) ||
        Number(payrollPeriodId) <= 0
    ) {
        throw new Error("payroll_period_id_required");
    }

    if (
        !payrollEmployeeId ||
        !Number.isInteger(Number(payrollEmployeeId)) ||
        Number(payrollEmployeeId) <= 0
    ) {
        throw new Error("payroll_employee_id_required");
    }

    // Verificar que el registro de nómina pertenezca al período indicado.
    const payrollEmployee = await PayrollEmployee.findOne({
        where: {
            id: Number(payrollEmployeeId),
            payroll_period_id: Number(payrollPeriodId),
        },
        attributes: ["id"],
    });

    if (!payrollEmployee) {
        throw new Error("payroll_employee_not_found");
    }

    // Obtener únicamente los conceptos de ese registro de nómina.
    const payrollItems = await PayrollItem.findAll({
        where: {
            payroll_employee_id: payrollEmployee.id,
        },
        attributes: [
            "id",
            "payroll_employee_id",
            "payroll_rule_id",
            "concept",
            "type",
            "amount",
            "calculation_base",
            "applied_percentage",
            "description",
        ],
        order: [["id", "ASC"]],
    });

    return payrollItems;
};