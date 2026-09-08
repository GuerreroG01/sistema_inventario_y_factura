import {
    createEmployee, getAllEmployees, getEmployeeById, updateEmployee, changeStatus, getEmployeeSummary
} from "../../../services/Worksheet/Employee/EmployeeService.js";

export const create = async (req, res) => {
    try {
        const { id, business_id, branch_id, rol } = req.user;
        const employee = await createEmployee(
            req.body,
            id,
            business_id,
            branch_id, rol
        );

        return res.status(201).json({
            message: "Empleado creado correctamente",
            data: employee
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
            limit: req.query.limit,
            search: req.query.search,
            status: req.query.status,
            businessId: business_id,
            branchId: branch_id,
            rol: rol
        };

        const { data, pagination } = await getAllEmployees(filters);

        return res.status(200).json({
            message: "Lista de empleados",
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
        const { business_id, branch_id, rol } = req.user;
        const employee = await getEmployeeById(
            id,
            business_id,
            branch_id, rol
        );

        return res.status(200).json({
            message: "Empleado encontrado",
            data: employee
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
        const { business_id, branch_id, rol } = req.user;
        const employee = await updateEmployee(
            id,
            req.body,
            req.user?.id,
            business_id,
            branch_id,
            rol
        );

        return res.status(200).json({
            message: "Empleado actualizado correctamente",
            data: employee
        });

    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};

export const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const { business_id, branch_id, rol } = req.user;
        const employee = await changeStatus(
            id,
            status,
            req.user?.id,
            business_id,
            branch_id, rol
        );

        return res.status(200).json({
            message: "Estado del empleado actualizado correctamente",
            data: employee
        });

    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};

export const getSummary = async (req, res) => {
    try {
        const { business_id, branch_id } = req.user;
        const { date } = req.query;

        const summary = await getEmployeeSummary(
            business_id,
            branch_id,
            date
        );

        return res.status(200).json({
            message: "Resumen de empleados obtenido correctamente",
            data: summary
        });

    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};