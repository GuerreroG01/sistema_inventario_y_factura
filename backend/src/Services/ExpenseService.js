import Expense from "../models/Expense.js";
import { Op } from "sequelize";
import { cacheService, CacheKeys, CacheTTL } from "./cache/index.js";

export const createExpense = async (data) => {
    const expense = await Expense.create({
        description: data.description,
        amount: data.amount,
        category: data.category,
        date: data.date,
        payment_method: data.payment_method
    });
    cacheService.del(CacheKeys.CATEGORIESEXP);

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
        order: [["date", "DESC"]],
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
        payment_method: data.payment_method ?? expense.payment_method
    });
    cacheService.del(CacheKeys.CATEGORIESEXP);
    return expense;
};

export const deleteExpense = async (id) => {
    const expense = await Expense.findByPk(id);
    if (!expense) {
        throw new Error("Egreso no encontrado");
    }
    await expense.destroy();
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