import { createExpense, getAllExpenses, getExpenseById, updateExpense, deleteExpense, getAllCategories, getCurrentMonthTotalExpenses } from "../services/ExpenseService.js";

export const create = async (req, res) => {
    try {
        const expense = await createExpense(
            req.body,
            req.user?.id,
            req.user.business_id
        );

        return res.status(201).json({
            message: "Egreso creado correctamente",
            data: expense
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

export const getAll = async (req, res) => {
    try {

        const filters = {
            page: req.query.page,
            category: req.query.category,
            from: req.query.from,
            to: req.query.to,
            businessId: req.user.business_id
        };

        const { data, pagination } = await getAllExpenses(filters);

        return res.status(200).json({
            message: "Lista de expenses",
            data,
            pagination
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

export const getById = async (req, res) => {
    try {
        const { id } = req.params;

        const expense = await getExpenseById(id,req.user.business_id);

        return res.status(200).json({
            message: "Egreso encontrado",
            data: expense
        });

    } catch (error) {
        return res.status(404).json({
            message: error.message
        });
    }
};

export const update = async (req, res) => {
    try {
        const { id } = req.params;

        const updated = await updateExpense(
            id,
            req.body,
            req.user?.id,
            req.user.business_id
        );

        return res.status(200).json({
            message: "Egreso actualizado correctamente",
            data: updated
        });

    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};

export const deleteValue = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await deleteExpense(id,req.user.business_id);

        return res.status(200).json(result);

    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};
export const getCategories = async (req, res) => {
    try {
        const categories = await getAllCategories(req.user.business_id);
        return res.status(200).json({
            message: "Categorías de egresos encontradas",
            data: categories
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};
export const getCurrentMonthTotal = async (req, res) => {
    try {
        const total = await getCurrentMonthTotalExpenses(req.user.business_id);

        return res.status(200).json({
            message: "Total de egresos del mes actual",
            data: total
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};