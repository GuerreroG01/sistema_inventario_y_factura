
import * as licenseService from "../services/LicenseService.js";

export const getLicense = async (req, res) => {
    try {
        const { businessId } = req.params;
        const license = await licenseService.getLicenseByBusiness(
            businessId
        );
        return res.json(license);

    } catch (error) {
        return res.status(404).json({
            message: error.message
        });
    }
};

export const createTrialLicense = async (req, res) => {
    try {
        const { businessId, days = 14 } = req.body;
        const license = await licenseService.createTrialLicense(
            businessId,
            days
        );

        return res.status(201).json({
            success: true,
            message: "Licencia de prueba creada correctamente.",
            data: license
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getStatus = async (req, res) => {
    try {
        const { businessId } = req.params;
        const status = await licenseService.getLicenseStatus(
            businessId
        );
        return res.json(status);
    } catch (error) {
        return res.status(404).json({
            message: error.message
        });
    }
};

export const renew = async (req, res) => {
    try {
        const { businessId } = req.params;
        const { duration, durationUnit } = req.body;

        const license = await licenseService.renewLicense(
            Number(businessId),
            duration,
            durationUnit
        );

        return res.json({
            message: "Licencia renovada correctamente",
            license
        });

    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};

export const extend = async (req, res) => {
    try {
        const { businessId } = req.params;
        const { duration, durationUnit } = req.body;

        const license = await licenseService.extendLicense(
            Number(businessId),
            duration,
            durationUnit
        );

        return res.json({
            message: "Licencia extendida correctamente",
            license
        });

    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};

export const suspend = async (req, res) => {
    try {
        const { businessId } = req.params;
        const license = await licenseService.suspendLicense(
            Number(businessId)
        );

        return res.json({
            message: "Licencia suspendida correctamente",
            license
        });

    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};

export const reactivate = async (req, res) => {
    try {
        const { businessId } = req.params;
        const license = await licenseService.reactivateLicense(
            Number(businessId)
        );

        return res.json({
            message: "Licencia reactivada correctamente",
            license
        });

    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};

export const createLifetime = async (req, res) => {
    try {
        const { businessId } = req.params;
        const license = await licenseService.createLifetimeLicense(
            Number(businessId)
        );

        return res.json({
            message: "Licencia convertida a Lifetime",
            license
        });

    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};

export const changeType = async (req, res) => {
    try {

        const { type } = req.body;

        const license = await licenseService.changeLicenseType(
            req.user.business_id,
            type
        );

        return res.json({
            message: "Tipo de licencia actualizado",
            license
        });

    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};

export const revoke = async (req, res) => {
    try {
        const { businessId } = req.params;
        const response = await licenseService.revokeLicense(
            Number(businessId)
        );

        return res.json(response);

    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};

//Metodo de prueba que luego será migrado a un job automatico.
export const methodTest = async (req, res) => {
    try {
        const expiredBusinesses = await licenseService.getExpiredLicenses();
        const businessIds = expiredBusinesses.business;
        const response = await licenseService.recreateExpiredLicenses(
            businessIds
        );

        return res.status(200).json(response);

    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};
export const activatePendings = async (req, res) => {
    try {
        const { licenseKey } = req.body;
        const response = await licenseService.activatePendingLicense(licenseKey);
        return res.status(200).json(response);

    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};