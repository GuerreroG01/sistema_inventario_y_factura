export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                message: "Usuario no autenticado"
            });
        }

        if (!req.user.activo) {
            return res.status(403).json({
                message: "Usuario desactivado"
            });
        }

        if (!allowedRoles.includes(req.user.rol)) {
            return res.status(403).json({
                message: "No tiene permisos suficientes"
            });
        }
        next();
    };
};