import { validateLicense } from "../services/licenseService.js";

const licenseMiddleware = async (req, res, next) => {
    try {

        if (!req.user?.business_id) {
            return res.status(401).json({
                message: "Negocio no identificado."
            });
        }
        const result = await validateLicense(req.user.business_id);
        req.license = result.license;
        next();

    } catch (error) {

        return res.status(403).json({
            message: error.message
        });

    }
};

export default licenseMiddleware;