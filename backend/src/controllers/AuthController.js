import * as authService from "../services/AuthService.js";

export const register = async (req, res) => {
    try {
        const usuario = await authService.register(req.body);
        res.status(201).json({
            success: true,
            message: "Usuario registrado correctamente",
            usuario
        });

    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Error interno del servidor"
        });
    }
};

export const login = async (req, res) => {
    try {
        const { usuario, clave } = req.body;
        const data = await authService.login(
            usuario,
            clave
        );
        res.status(200).json({
            success: true,
            ...data
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Error interno del servidor"
        });
    }
};

export const getSystemStatus = async (req, res) => {
    try {
        const status = await authService.getSystemStatus();
        res.status(200).json({
            success: true,
            ...status
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Error interno del servidor"
        });
    }
};
export const logout = async (req, res, next) => {
    try {
        const result = await authService.logout(req.user.id);

        res.json(result);
    } catch (error) {
        next(error);
    }
};
export const getUsername = async (req, res, next) => {
    try {
        const { id } = req.params;
        const username = await authService.getUsernameById(id);
        res.json({ Usuario: username });
    } catch (error) {
        next(error);
    }
};