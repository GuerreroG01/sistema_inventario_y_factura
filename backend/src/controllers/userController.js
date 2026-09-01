import * as userService from "../services/UserService.js";

export const getUsers = async (req, res) => {
    try {
        const result = await userService.getUsers(
            req.query,
            req.user.business_id,
            req.user.rol
        );
        return res.status(200).json(result);

    } catch (error) {
        return res.status(error.statusCode || 500).json({
            error: error.error || "internal_error",
            message: error.message || "Error interno del servidor"
        });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await userService.getUserById(
            req.params.id,
            req.user.business_id,
            req.user.rol
        );
        return res.status(200).json(user);

    } catch (error) {
        return res.status(error.statusCode || 500).json({
            error: error.error || "internal_error",
            message: error.message || "Error interno del servidor"
        });
    }
};

export const updateUserBusiness = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { business_id } = req.body;
        const result = await userService.updateUserBusiness(
            Number(id),
            Number(business_id)
        );
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const updateUserBranch = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { branch_id, business_id } = req.body;

        const result = await userService.updateUserBranch(
            Number(id),
            Number(branch_id),
            Number(business_id),
            req.user.business_id,
            req.user.rol
        );

        return res.status(200).json(result);

    } catch (error) {
        next(error);
    }
};