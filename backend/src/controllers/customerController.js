import { getAllCustomers, getById, createCustomer, updateCustomer, changeCustomerStatus, 
    getCustomerByName, getCustomerSummary, getCustomerSalesHistory, getCustomerIndicators,
    getCustomerPreferences, getCustomerStats
} from "../services/CustomerService.js";
import { getMarketingCustomers, evaluateCustomerMarketingScore, getCustomerMarketingPreferences, generateMarketingCampaign } from "../services/MarketingService.js";

export const getCustomers = async (req, res) => {
    try {
        const customers = await getAllCustomers({
            page: req.query.page,
            limit: req.query.limit,
            name: req.query.name,
            phone: req.query.phone,
            status: req.query.status,
            hasDebt: req.query.hasDebt,
            businessId: req.user.business_id
        });

        return res.status(200).json({
            success: true,
            data: customers
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await getById( id, req.user.business_id);

        return res.status(200).json({
            success: true,
            data: customer
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

export const create = async (req, res) => {
    try {
        const customer = await createCustomer({
            ...req.body,
            created_by: req.user.id,
            businessId: req.user.business_id
        });

        return res.status(201).json({
            success: true,
            message: "Cliente creado correctamente.",
            data: customer
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const update = async (req, res) => {
    try {
        const { id } = req.params;

        const customer = await updateCustomer(
            id,
            {
                ...req.body,
                updated_by: req.user.id,
                businessId: req.user.business_id
            }
        );

        return res.status(200).json({
            success: true,
            message: "Cliente actualizado correctamente.",
            data: customer
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const changeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const customer = await changeCustomerStatus(
            id,
            status,
            req.user.id,
            req.user.business_id
        );

        return res.status(200).json({
            success: true,
            message: "Estado del cliente actualizado correctamente.",
            data: customer
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getCustomerAutocomplete = async (req, res) => {
    try {
        const result = await getCustomerByName(
            req.query,
            req.user.business_id
        );

        return res.json(result);
    } catch (error) {
        console.error("getCustomerAutocomplete error:", error);

        return res.status(500).json({
            error: "internal_error",
            message: error.message
        });
    }
};

export const summaryCustomer = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "El id del cliente es requerido.",
            });
        }

        const result = await getCustomerSummary(
            id,
            req.user.business_id
        );

        return res.status(200).json({
            success: true,
            data: result,
        });

    } catch (error) {
        console.error(
            "[getCustomerSummaryController] Error:",
            error
        );

        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

export const salesHistory = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            page = 1,
            limit = 10
        } = req.query;

        const result = await getCustomerSalesHistory(
            id,
            req.user.business_id,
            page,
            limit
        );

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error(
            "[salesHistory] Error:",
            error
        );

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const indicatorsCustomer = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await getCustomerIndicators(
            id,
            req.user.business_id
        );

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error(
            "[indicatorsCustomer] Error:",
            error
        );

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const customerPreferences = async (req, res) => {
    try {
        const { id } = req.params;
        const businessId = req.user.business_id;
        const preferences =
            await getCustomerPreferences(
                id,
                businessId
            );

        return res.status(200).json({
            ok: true,
            data: preferences
        });
    } catch (error) {
        console.error(
            "Error obteniendo preferencias del cliente:",
            error
        );
        return res.status(404).json({
            ok: false,
            message: error.message
        });
    }
};

export const customersStats = async (req, res) => {
    try {
        const stats = await getCustomerStats({
            businessId: req.user.business_id
        });

        return res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const testMarketingCustomers = async (req, res) => {
    try {
        const evaluation = await generateMarketingCampaign(
            req.user.business_id
        );

        return res.status(200).json({
            success: true,
            evaluation
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};