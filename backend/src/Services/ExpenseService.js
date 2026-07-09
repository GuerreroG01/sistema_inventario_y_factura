import Expense from "../models/Expense.js";
import { Op } from "sequelize";
import { cacheService, CacheKeys, CacheTTL } from "./cache/index.js";

export const createExpense = async (data) => {
    const expense = await Expense.create({
        description: data.description,
        amount: data.amount,
        category: data.category,
        date: data.date,
        payment_method: data.payment_method,
        created_by: req.user.id,
        updated_by: req.user.id
    });
    cacheService.del(CacheKeys.CATEGORIESEXP);
    cacheService.del(CacheKeys.PROFITABILITY);

    return expense;
};

export const getAllExpenses = async ({ page = 1, limit = 10, category, from, to } = {}) => {
    page = Number(page);
    limit = Number(limit);

    const offset = (page - 1) * limit;
    const where = {};

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

export const getExpenseById = async (id) => {
    const expense = await Expense.findByPk(id);
    if (!expense) {
        throw new Error("Egreso no encontrado");
    }

    return expense;
};

export const updateExpense = async (id, data) => {
    const expense = await Expense.findByPk(id);
    if (!expense) {
        throw new Error("Egreso no encontrado");
    }

    await expense.update({
        description: data.description ?? expense.description,
        amount: data.amount ?? expense.amount,
        category: data.category ?? expense.category,
        date: data.date ?? expense.date,
        payment_method: data.payment_method ?? expense.payment_method,
        updated_by: req.user.id
    });
    cacheService.del(CacheKeys.CATEGORIESEXP);
    cacheService.del(CacheKeys.PROFITABILITY);
    return expense;
};

export const deleteExpense = async (id) => {
    const expense = await Expense.findByPk(id);
    if (!expense) {
        throw new Error("Egreso no encontrado");
    }
    await expense.destroy();
    cacheService.del(CacheKeys.CATEGORIESEXP);
    cacheService.del(CacheKeys.PROFITABILITY);
    return {
        message: "Egreso eliminado correctamente"
    };
};
export const getAllCategories = async () => {
    return cacheService.remember(
        CacheKeys.CATEGORIESEXP,
        async () => {
            const categories = await Expense.findAll({
                attributes: ["category"],
                group: ["category"],
                raw: true,
            });

            return categories.map((c) => c.category);
        },
        CacheTTL.ONE_DAY
    );
};
export const getCurrentMonthTotalExpenses = async () => {
    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const total = await Expense.sum("amount", {
        where: {
            date: {
                [Op.between]: [startOfMonth, endOfMonth]
            }
        }
    });

    return {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        total: total || 0
    };
};