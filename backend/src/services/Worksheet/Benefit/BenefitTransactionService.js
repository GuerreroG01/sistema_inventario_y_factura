import { Op, literal } from "sequelize";
import sequelize from "../../../config/database.js";
import EmployeeBenefit from "../../../models/Worksheet/Benefits/EmployeeBenefits.js";
import EmployeeBenefitTransaction from "../../../models/Worksheet/Benefits/EmployeeBenefitTransaction.js";
import { validateBusinessId, isValidDate } from "../../../utils/benefitRule.js";
import { TRANSACTION_TYPES } from "../../../constants/benefitTransaction.js";

const findEmployeeBenefit = async ({ id, businessId, employeeId = null, transaction = null, lock = false }) => {
    const where = {
        id: Number(id),
        business_id: Number(businessId),
    };

    if (employeeId !== null) {
        where.employee_id = Number(employeeId);
    }

    const options = {
        where,
        transaction,
    };

    if (lock && transaction) {
        options.lock = transaction.LOCK.UPDATE;
    }

    const benefit = await EmployeeBenefit.findOne(options);

    if (!benefit) {
        throw new Error("employee_benefit_not_found");
    }

    return benefit;
};

const findTransaction = async ({ id, businessId = null, transaction = null, lock = false }) => {
    const options = {
        where: { id: Number(id) },
        transaction,
        include: [
            {
                model: EmployeeBenefit,
                as: "benefit",
                required: true,
                ...(businessId
                    ? { where: { business_id: Number(businessId) } }
                    : {}),
            },
        ],
    };

    if (lock && transaction) {
        options.lock = transaction.LOCK.UPDATE;
    }

    const tx = await EmployeeBenefitTransaction.findOne(options);

    if (!tx) {
        throw new Error("benefit_transaction_not_found");
    }

    return tx;
};

const validateAmount = (amount, { allowNegative = false } = {}) => {
    if (amount === undefined || amount === null) {
        throw new Error("benefit_transaction_amount_required");
    }

    const num = Number(amount);

    if (Number.isNaN(num)) {
        throw new Error("benefit_transaction_invalid_amount");
    }

    if (!allowNegative && num <= 0) {
        throw new Error("benefit_transaction_amount_must_be_positive");
    }

    if (allowNegative && num === 0) {
        throw new Error("benefit_transaction_amount_cannot_be_zero");
    }

    return num;
};

const validateIdempotencyKey = async (idempotencyKey, transaction = null) => {
    if (!idempotencyKey) return;

    if (typeof idempotencyKey !== "string" || idempotencyKey.length > 150) {
        throw new Error("benefit_transaction_invalid_idempotency_key");
    }

    const existing = await EmployeeBenefitTransaction.findOne({
        where: { idempotency_key: idempotencyKey },
        transaction,
    });

    if (existing) {
        throw new Error("benefit_transaction_idempotency_key_already_used");
    }
};

const createTransactionRecord = async (
    {
        employeeBenefitId,
        transactionType,
        amount,
        balanceBefore,
        balanceAfter,
        date,
        referenceType = null,
        referenceId = null,
        idempotencyKey = null,
        reversesTransactionId = null,
        periodStartDate = null,
        periodEndDate = null,
        description = null,
        createdBy = null,
    },
    transaction
) => {
    return EmployeeBenefitTransaction.create(
        {
            employee_benefit_id: Number(employeeBenefitId),
            transaction_type: transactionType,
            amount: Number(amount),
            balance_before: Number(balanceBefore),
            balance_after: Number(balanceAfter),
            date,
            reference_type: referenceType,
            reference_id: referenceId
                ? Number(referenceId)
                : null,
            idempotency_key: idempotencyKey || null,
            reverses_transaction_id: reversesTransactionId
                ? Number(reversesTransactionId)
                : null,
            period_start_date: periodStartDate,
            period_end_date: periodEndDate,
            description: description || null,
            created_by: createdBy
                ? Number(createdBy)
                : null,
        },
        { transaction }
    );
};

// Aumentar el saldo por una acumulación (ACCRUAL).
export const accrueBenefit = async ({
    employeeBenefitId,
    businessId,
    amount,
    date = null,
    description = null,
    referenceType = null,
    referenceId = null,
    idempotencyKey = null,
    periodStartDate = null,
    periodEndDate = null,
    createdBy = null,
    transaction: externalTransaction = null,
}) => {
    validateBusinessId(businessId);

    if (
        !employeeBenefitId ||
        !Number.isInteger(Number(employeeBenefitId)) ||
        Number(employeeBenefitId) <= 0
    ) {
        throw new Error("employee_benefit_invalid_id");
    }

    const numericAmount = validateAmount(amount);
    const movementDate =
        date || new Date().toISOString().slice(0, 10);

    if (!isValidDate(movementDate)) {
        throw new Error("benefit_transaction_invalid_date");
    }

    const execute = async (transaction) => {
        await validateIdempotencyKey(idempotencyKey, transaction);

        const benefit = await findEmployeeBenefit({
            id: Number(employeeBenefitId),
            businessId: Number(businessId),
            transaction,
            lock: true,
        });

        if (benefit.status !== "ACTIVE") {
            throw new Error("employee_benefit_not_active");
        }

        const balanceBefore = Number(benefit.balance);
        const balanceAfter = balanceBefore + numericAmount;

        const txRecord = await createTransactionRecord(
            {
                employeeBenefitId: benefit.id,
                transactionType: "ACCRUAL",
                amount: numericAmount,
                balanceBefore,
                balanceAfter,
                date: movementDate,
                referenceType,
                referenceId,
                idempotencyKey,
                periodStartDate,
                periodEndDate,
                description,
                createdBy,
            },
            transaction
        );

        await benefit.update(
            { balance: balanceAfter },
            { transaction }
        );

        return {
            benefit,
            transaction: txRecord,
        };
    };

    if (externalTransaction) {
        return execute(externalTransaction);
    }
    return sequelize.transaction(execute);
};

//Descontar días o dinero del saldo (USAGE).
export const consumeBenefit = async ({
    employeeBenefitId,
    businessId,
    amount,
    date = null,
    description = null,
    referenceType = null,
    referenceId = null,
    idempotencyKey = null,
    createdBy = null,
    allowNegativeBalance = false,
}) => {
    validateBusinessId(businessId);

    if (!employeeBenefitId || !Number.isInteger(Number(employeeBenefitId)) || Number(employeeBenefitId) <= 0) {
        throw new Error("employee_benefit_invalid_id");
    }

    const numericAmount = validateAmount(amount);
    const movementDate = date || new Date().toISOString().slice(0, 10);

    if (!isValidDate(movementDate)) {
        throw new Error("benefit_transaction_invalid_date");
    }

    const transaction = await sequelize.transaction();

    try {
        await validateIdempotencyKey(idempotencyKey, transaction);

        const benefit = await findEmployeeBenefit({
            id: Number(employeeBenefitId),
            businessId: Number(businessId),
            transaction,
            lock: true,
        });

        if (benefit.status !== "ACTIVE") {
            throw new Error("employee_benefit_not_active");
        }

        const balanceBefore = Number(benefit.balance);
        const balanceAfter = balanceBefore - numericAmount;

        if (!allowNegativeBalance && balanceAfter < 0) {
            throw new Error("employee_benefit_insufficient_balance");
        }

        await benefit.update({ balance: balanceAfter }, { transaction });

        const txRecord = await createTransactionRecord(
            {
                employeeBenefitId: benefit.id,
                transactionType: "USAGE",
                amount: -numericAmount,
                balanceBefore,
                balanceAfter,
                date: movementDate,
                referenceType,
                referenceId,
                idempotencyKey,
                description,
                createdBy,
            },
            transaction
        );

        await transaction.commit();

        return {
            benefit,
            transaction: txRecord,
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

//Registrar el pago de un beneficio monetario (PAYMENT).
//Normalmente reduce el saldo (igual que un USAGE, pero semánticamente distinto).
export const payBenefit = async ({
    employeeBenefitId, businessId, date = null, description = null, referenceType = null, referenceId = null,
    idempotencyKey = null, createdBy = null,
}) => {
    validateBusinessId(businessId);

    if (
        !employeeBenefitId ||
        !Number.isInteger(Number(employeeBenefitId)) ||
        Number(employeeBenefitId) <= 0
    ) {
        throw new Error("employee_benefit_invalid_id");
    }

    const movementDate =
        date || new Date().toISOString().slice(0, 10);

    if (!isValidDate(movementDate)) {
        throw new Error("benefit_transaction_invalid_date");
    }

    const transaction = await sequelize.transaction();

    try {
        await validateIdempotencyKey(
            idempotencyKey,
            transaction
        );

        const benefit = await findEmployeeBenefit({
            id: Number(employeeBenefitId),
            businessId: Number(businessId),
            transaction,
            lock: true,
        });

        if (benefit.status !== "ACTIVE") {
            throw new Error("employee_benefit_not_active");
        }

        if (benefit.unit !== "CURRENCY") {
            throw new Error(
                "benefit_transaction_payment_only_for_currency"
            );
        }

        // El importe se obtiene del saldo disponible.
        const balanceBefore = Number(benefit.balance);

        if (
            !Number.isFinite(balanceBefore) ||
            balanceBefore <= 0
        ) {
            throw new Error(
                "employee_benefit_no_pending_payment"
            );
        }

        // PAYMENT liquida todo el saldo pendiente.
        const numericAmount = balanceBefore;
        const balanceAfter = 0;

        await benefit.update(
            { balance: balanceAfter },
            { transaction }
        );

        const txRecord = await createTransactionRecord(
            {
                employeeBenefitId: benefit.id,
                transactionType: "PAYMENT",
                amount: -numericAmount,
                balanceBefore,
                balanceAfter,
                date: movementDate,
                referenceType,
                referenceId,
                idempotencyKey,
                description,
                createdBy,
            },
            transaction
        );

        await transaction.commit();

        return {
            benefit,
            transaction: txRecord,
            paidAmount: numericAmount,
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

//Corregir el saldo con una justificación (ADJUSTMENT).
//amount puede ser positivo o negativo.
export const adjustBenefitBalance = async ({
    employeeBenefitId,
    businessId,
    amount,
    date = null,
    description,
    referenceType = null,
    referenceId = null,
    idempotencyKey = null,
    createdBy = null,
    allowNegativeBalance = false,
}) => {
    validateBusinessId(businessId);

    if (!employeeBenefitId || !Number.isInteger(Number(employeeBenefitId)) || Number(employeeBenefitId) <= 0) {
        throw new Error("employee_benefit_invalid_id");
    }

    if (!description || typeof description !== "string" || description.trim().length === 0) {
        throw new Error("benefit_transaction_description_required");
    }

    const numericAmount = validateAmount(amount, { allowNegative: true });
    const movementDate = date || new Date().toISOString().slice(0, 10);

    if (!isValidDate(movementDate)) {
        throw new Error("benefit_transaction_invalid_date");
    }

    const transaction = await sequelize.transaction();

    try {
        await validateIdempotencyKey(idempotencyKey, transaction);

        const benefit = await findEmployeeBenefit({
            id: Number(employeeBenefitId),
            businessId: Number(businessId),
            transaction,
            lock: true,
        });

        if (benefit.status === "CLOSED") {
            throw new Error("employee_benefit_closed");
        }

        const balanceBefore = Number(benefit.balance);
        const balanceAfter = balanceBefore + numericAmount;

        if (!allowNegativeBalance && balanceAfter < 0) {
            throw new Error("employee_benefit_insufficient_balance");
        }

        await benefit.update({ balance: balanceAfter }, { transaction });

        const txRecord = await createTransactionRecord(
            {
                employeeBenefitId: benefit.id,
                transactionType: "ADJUSTMENT",
                amount: numericAmount,
                balanceBefore,
                balanceAfter,
                date: movementDate,
                referenceType,
                referenceId,
                idempotencyKey,
                description: description.trim(),
                createdBy,
            },
            transaction
        );

        await transaction.commit();

        return {
            benefit,
            transaction: txRecord,
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

//Revertir un movimiento anterior (REVERSAL).
export const reverseBenefitTransaction = async ({
    transactionId,
    businessId,
    date = null,
    description = null,
    idempotencyKey = null,
    createdBy = null,
    allowNegativeBalance = false,
}) => {
    validateBusinessId(businessId);

    if (!transactionId || !Number.isInteger(Number(transactionId)) || Number(transactionId) <= 0) {
        throw new Error("benefit_transaction_invalid_id");
    }

    const movementDate = date || new Date().toISOString().slice(0, 10);

    if (!isValidDate(movementDate)) {
        throw new Error("benefit_transaction_invalid_date");
    }

    const transaction = await sequelize.transaction();

    try {
        await validateIdempotencyKey(idempotencyKey, transaction);

        const originalTx = await findTransaction({
            id: Number(transactionId),
            businessId: Number(businessId),
            transaction,
            lock: true,
        });

        if (originalTx.transaction_type === "REVERSAL") {
            throw new Error("benefit_transaction_cannot_reverse_a_reversal");
        }

        const alreadyReversed = await EmployeeBenefitTransaction.findOne({
            where: {
                reverses_transaction_id: originalTx.id,
                transaction_type: "REVERSAL",
            },
            transaction,
        });

        if (alreadyReversed) {
            throw new Error("benefit_transaction_already_reversed");
        }

        const benefit = await findEmployeeBenefit({
            id: originalTx.employee_benefit_id,
            businessId: Number(businessId),
            transaction,
            lock: true,
        });

        if (benefit.status === "CLOSED") {
            throw new Error("employee_benefit_closed");
        }

        const reverseAmount = -Number(originalTx.amount);
        const balanceBefore = Number(benefit.balance);
        const balanceAfter = balanceBefore + reverseAmount;

        if (!allowNegativeBalance && balanceAfter < 0) {
            throw new Error("employee_benefit_insufficient_balance");
        }

        await benefit.update({ balance: balanceAfter }, { transaction });

        const txRecord = await createTransactionRecord(
            {
                employeeBenefitId: benefit.id,
                transactionType: "REVERSAL",
                amount: reverseAmount,
                balanceBefore,
                balanceAfter,
                date: movementDate,
                referenceType: "BENEFIT_TRANSACTION",
                referenceId: originalTx.id,
                idempotencyKey,
                reversesTransactionId: originalTx.id,
                description:
                    description ||
                    `Reversión de transacción #${originalTx.id}`,
                createdBy,
            },
            transaction
        );

        await transaction.commit();

        return {
            benefit,
            transaction: txRecord,
            originalTransaction: originalTx,
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const getBenefitBalance = async ({ employeeBenefitId, businessId, employeeId = null }) => {
    validateBusinessId(businessId);

    if (!employeeBenefitId || !Number.isInteger(Number(employeeBenefitId)) || Number(employeeBenefitId) <= 0) {
        throw new Error("employee_benefit_invalid_id");
    }

    const benefit = await findEmployeeBenefit({
        id: Number(employeeBenefitId),
        businessId: Number(businessId),
        employeeId: employeeId ? Number(employeeId) : null,
    });

    return {
        employee_benefit_id: benefit.id,
        employee_id: benefit.employee_id,
        type: benefit.type,
        unit: benefit.unit,
        balance: Number(benefit.balance),
        status: benefit.status,
        start_date: benefit.start_date,
        end_date: benefit.end_date,
    };
};

export const getBenefitTransactions = async ({
    employeeBenefitId, businessId, page = 1, limit = 20, transactionType = null, from = null,
    to = null, order = "DESC",
}) => {
    validateBusinessId(businessId);

    if (!employeeBenefitId || !Number.isInteger(Number(employeeBenefitId)) || Number(employeeBenefitId) <= 0) {
        throw new Error("employee_benefit_invalid_id");
    }

    page = Number(page);
    limit = Number(limit);

    if (
        !Number.isInteger(page) || page < 1 ||
        !Number.isInteger(limit) || limit < 1 || limit > 100
    ) {
        throw new Error("invalid_pagination");
    }

    await findEmployeeBenefit({
        id: Number(employeeBenefitId),
        businessId: Number(businessId),
    });

    const where = {
        employee_benefit_id: Number(employeeBenefitId),
    };

    if (transactionType) {
        if (!TRANSACTION_TYPES.includes(transactionType)) {
            throw new Error("benefit_transaction_invalid_type");
        }
        where.transaction_type = transactionType;
    }

    if (from && !isValidDate(from)) {
        throw new Error("benefit_transaction_invalid_from_date");
    }

    if (to && !isValidDate(to)) {
        throw new Error("benefit_transaction_invalid_to_date");
    }

    if (from && to && from > to) {
        throw new Error("benefit_transaction_invalid_date_range");
    }

    if (from || to) {
        where.date = {};
        if (from) where.date[Op.gte] = from;
        if (to) where.date[Op.lte] = to;
    }

    const offset = (page - 1) * limit;
    const sortOrder = order?.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const { count, rows } = await EmployeeBenefitTransaction.findAndCountAll({
        attributes: {
            include: [
                [
                    literal(`(
                        EXISTS (
                            SELECT 1
                            FROM "BenefitTransactions" AS reversal
                            WHERE reversal.reverses_transaction_id = "EmployeeBenefitTransaction".id
                            AND reversal.transaction_type = 'REVERSAL'
                        )
                    )`),
                    "isReversed",
                ],
            ],
        },
        where,
        order: [
            ["date", sortOrder],
            ["id", sortOrder],
        ],
        limit,
        offset,
        distinct: true,
    });

    return {
        data: rows,
        pagination: {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
        },
    };
};
// Comprobar si un empleado ya tiene un historial de transacciones para el beneficio de décimo tercer mes.
export async function employeeHasThirteenthMonthTransactions({ employee_id, business_id }) {
    const transactionExists =
        await EmployeeBenefitTransaction.findOne({
            attributes: ["id"],
            include: [
                {
                    model: EmployeeBenefit,
                    as: "benefit",
                    attributes: [],
                    where: {
                        employee_id: Number(employee_id),
                        business_id: Number(business_id),
                        type: "THIRTEENTH_MONTH",
                    },
                    required: true,
                },
            ],
            raw: true,
        });

    return Boolean(transactionExists);
}

// Comprobar si un empleado ya tiene un historial de transacciones para el beneficio de décimo tercer mes.
export async function employeeHasIndemnificationTransactions({ employee_id, business_id }) {
    const transactionExists =
        await EmployeeBenefitTransaction.findOne({
            attributes: ["id"],
            include: [
                {
                    model: EmployeeBenefit,
                    as: "benefit",
                    attributes: [],
                    where: {
                        employee_id: Number(employee_id),
                        business_id: Number(business_id),
                        type: "SEVERANCE",
                    },
                    required: true,
                },
            ],
            raw: true,
        });

    return Boolean(transactionExists);
}