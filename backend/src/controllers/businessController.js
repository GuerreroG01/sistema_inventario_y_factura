import * as businessService from "../services/businessService.js";

export const createBusiness = async (req, res) => {
    try {

        const business = await businessService.createBusiness(
            req.body
        );

        return res.status(201).json({
            message: "Empresa creada correctamente",
            business
        });

    } catch (error) {

        return res.status(400).json({
            message: error.message
        });

    }
};

export const getBusinesses = async (req, res) => {
    try {

        const businesses = await businessService.getBusinesses();

        return res.json(businesses);

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });

    }
};

export const getBusinessById = async (req, res) => {
    try {

        const business = await businessService.getBusinessById(
            req.params.id
        );

        return res.json(business);

    } catch (error) {

        return res.status(404).json({
            message: error.message
        });

    }
};

export const updateBusiness = async (req, res) => {
    try {

        const business = await businessService.updateBusiness(
            req.params.id,
            req.body
        );

        return res.json({
            message: "Empresa actualizada correctamente",
            business
        });

    } catch (error) {

        return res.status(400).json({
            message: error.message
        });

    }
};

export const changeBusinessStatus = async (req, res) => {
    try {

        const business = await businessService.changeBusinessStatus(
            req.params.id,
            req.body.status
        );

        return res.json({
            message: "Estado actualizado correctamente",
            business
        });

    } catch (error) {

        return res.status(400).json({
            message: error.message
        });

    }
};

export const deleteBusiness = async (req, res) => {
    try {

        const response = await businessService.deleteBusiness(
            req.params.id
        );

        return res.json(response);

    } catch (error) {

        return res.status(404).json({
            message: error.message
        });

    }
};

export const getBusinessAutocomplete = async (req, res) => {
    try {
        const result = await businessService.getBusinessByName(req.query);
        return res.json(result);
    } catch (error) {
        console.error("getBusinesses error:", error);
        return res.status(500).json({
            error: "internal_error",
            message: error.message
        });
    }
};