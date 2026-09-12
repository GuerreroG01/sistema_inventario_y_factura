import {
    createEmployment, getEmploymentHistory, getCurrentEmployment, getEmploymentAtDate, endEmployment
} from "../../../services/Worksheet/Employee/EmploymentService.js";

export const create = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { business_id, branch_id, rol } = req.user;
        const employment = await createEmployment(
            employeeId,
            req.body,
            business_id,
            branch_id, rol
        );

        return res.status(201).json({
            message: "Relación laboral creada correctamente",
            data: employment
        });

    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};

export const getHistory = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { business_id, branch_id, rol } = req.user;
        const employments = await getEmploymentHistory(
            employeeId,
            business_id,
            branch_id,
            rol
        );

        return res.status(200).json({
            message: "Historial laboral encontrado",
            data: employments
        });

    } catch (error) {
        return res.status(404).json({
            message: error.message
        });
    }
};

export const getCurrent = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { business_id, branch_id, rol } = req.user;
        const employment = await getCurrentEmployment(
            employeeId,
            business_id,
            branch_id,
            rol
        );

        return res.status(200).json({
            message: "Relación laboral actual encontrada",
            data: employment
        });

    } catch (error) {
        return res.status(404).json({
            message: error.message
        });
    }
};

export const getAtDate = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { business_id, branch_id, rol } = req.user;
        const { date } = req.query;

        const employment = await getEmploymentAtDate(
            employeeId,
            date,
            business_id,
            branch_id,
            rol
        );

        return res.status(200).json({
            message: "Relación laboral encontrada para la fecha indicada",
            data: employment
        });

    } catch (error) {
        return res.status(404).json({
            message: error.message
        });
    }
};

export const end = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { end_date } = req.body;
        const { business_id, branch_id, rol } = req.user;
        const employment = await endEmployment(
            employeeId,
            end_date,
            business_id,
            branch_id,
            rol
        );

        return res.status(200).json({
            message: "Relación laboral finalizada correctamente",
            data: employment
        });

    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};