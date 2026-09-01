import Expense from "../models/Expense.js";
import Branch from "../models/Branch.js";
import { Op } from "sequelize";
import { cacheService, CacheKeys, CacheTTL } from "./cache/index.js";
import { canModifyExpense } from "../utils/expensePeriod.js";
export const createExpense = async (data, userId,businessId,branchId) => {
    const expense = await Expense.create({
        description: data.description,
        amount: data.amount,
        category: data.category,
        date: data.date,
        payment_method: data.payment_method,
        created_by: userId ?? null,
        updated_by: userId ?? null,
        business_id: businessId,
        branch_id: branchId
    });
    cacheService.del(CacheKeys.CATEGORIESEXP, businessId);
    cacheService.del(CacheKeys.PROFITABILITY, businessId);

    return expense;
};

export const getAllExpenses = async ({
    page = 1, limit = 10, category, from, to, businessId, branchId, rol
} = {}) => {

    page = Number(page);
    limit = Number(limit);

    const offset = (page - 1) * limit;

    const where = {
        business_id: businessId
    };

    if (rol !== "admin" && rol !== "superAdmin") {
        if (!branchId) {
            throw new Error("branch_required");
        }

        where.branch_id = branchId;
    }

    if (category) {
        where.category = category;
    }

    if (from || to) {
        where.date = {};

        if (from) {
            where.date[Op.gte] = from;
        }

        if (to) {
            where.date[Op.lte] = to;
        }
    }

    const { count, rows } = await Expense.findAndCountAll({
        where,
        include: [
            {
                model: Branch,
                as: "branch",
                attributes: ["id", "name"],
                required: true
            }
        ],
        order: [["id", "DESC"]],
        limit,
        offset
    });

    return {
        data: rows,
        pagination: {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit)
        }
    };
};

export const getExpenseById = async (id, businessId, branchId, rol) => {
    const isAdmin = ["admin", "superAdmin"].includes(rol);
    const expense = await Expense.findOne({
        where: {
            id,
            business_id: businessId
        }
    });
    if (!expense) {
        throw new Error("Egreso no encontrado");
    }
    if (isAdmin) {
        return expense;
    }
    if (expense.branch_id !== branchId) {
        throw new Error("Este egreso forma parte de otra sucursal");
    }

    return expense;
};

export const updateExpense = async (
    id, data, userId, businessId, branchId, rol
) => {
    const expense = await Expense.findOne({
        where: {
            id,
            business_id: businessId
        }
    });

    if (!expense) {
        throw new Error("Egreso no encontrado");
    }
    const isAdmin = ["admin", "superAdmin"].includes(rol);
    if (!isAdmin && expense.branch_id !== branchId) {
        throw new Error("Este egreso forma parte de otra sucursal");
    }

    if (!canModifyExpense(expense.date)) {
        throw new Error("Este egreso pertenece a un período cerrado.");
    }

    await expense.update({
        description: data.description ?? expense.description,
        amount: data.amount ?? expense.amount,
        category: data.category ?? expense.category,
        date: data.date ?? expense.date,
        payment_method: data.payment_method ?? expense.payment_method,
        updated_by: userId ?? expense.updated_by,
    });

    cacheService.del(CacheKeys.CATEGORIESEXP, businessId);
    cacheService.del(CacheKeys.PROFITABILITY, businessId);

    return expense;
};

export const deleteExpense = async ( id, businessId, branchId, rol ) => {
    const expense = await Expense.findOne({
        where: {
            id,
            business_id: businessId
        }
    });
    if (!expense) {
        throw new Error("Egreso no encontrado");
    }
    const isAdmin = ["admin", "superAdmin"].includes(rol);
    if (!isAdmin && expense.branch_id !== branchId) {
        throw new Error("Este egreso forma parte de otra sucursal");
    }

    if (!canModifyExpense(expense.date)) {
        throw new Error("Este egreso pertenece a un período cerrado.");
    }
    await expense.destroy();
    cacheService.del(CacheKeys.CATEGORIESEXP, businessId);
    cacheService.del(CacheKeys.PROFITABILITY, businessId);
    return {
        message: "Egreso eliminado correctamente"
    };
};
export const getAllCategories = async (businessId) => {
    return cacheService.remember(
        CacheKeys.CATEGORIESEXP,
        async () => {
            const categories = await Expense.findAll({
                attributes: ["category"],
                where: {
                    business_id: businessId
                },
                group: ["category"],
                raw: true,
            });

            return categories.map((c) => c.category);
        },
        CacheTTL.ONE_DAY, businessId
    );
};
export const getCurrentMonthTotalExpenses = async ( businessId, branchId, rol ) => {
    const now = new Date();

    const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
    );
    const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
    );

    const isAdmin = ["admin", "superAdmin"].includes(rol);
    const where = {
        business_id: businessId,
        date: {
            [Op.between]: [startOfMonth, endOfMonth]
        }
    };
    if (!isAdmin) {
        where.branch_id = branchId;
    }
    const total = await Expense.sum("amount", {
        where
    });

    return {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        total: total || 0
    };
};