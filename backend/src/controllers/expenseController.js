import { createExpense, getAllExpenses, getExpenseById, updateExpense, deleteExpense, getAllCategories, getCurrentMonthTotalExpenses } from "../services/ExpenseService.js";

export const create = async (req, res) => {
    try {
        const { id ,business_id, branch_id } = req.user;
        const expense = await createExpense(
            req.body,
            id,
            business_id,
            branch_id
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
        const { business_id, branch_id, rol } = req.user;
        const filters = {
            page: req.query.page,
            category: req.query.category,
            from: req.query.from,
            to: req.query.to,
            businessId: business_id,
            branchId: branch_id,
            rol
        };

        const { data, pagination } = await getAllExpenses(filters);

        return res.status(200).json({
            message: "Lista de expenses",
            data,
            pagination
        });

    } catch (error) {
        if (error.message === "branch_required") {
            return res.status(400).json({
                error: "branch_required",
                message: "El usuario no tiene una sucursal asociada."
            });
        }

        return res.status(500).json({
            error: "internal_error",
            message: error.message
        });
    }
};

export const getById = async (req, res) => {
    try {
        const { business_id, branch_id, rol } = req.user;
        const { id } = req.params;

        const expense = await getExpenseById(id, business_id, branch_id, rol);

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
        const { business_id, branch_id, rol } = req.user;
        const { id } = req.params;

        const updated = await updateExpense(
            id,
            req.body,
            req.user?.id,
            business_id,
            branch_id,
            rol
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
        const { business_id, branch_id, rol } = req.user;
        const { id } = req.params;

        const result = await deleteExpense(id, business_id, branch_id, rol);

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
        const { business_id, branch_id, rol } = req.user;
        const total = await getCurrentMonthTotalExpenses(business_id, branch_id, rol);

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