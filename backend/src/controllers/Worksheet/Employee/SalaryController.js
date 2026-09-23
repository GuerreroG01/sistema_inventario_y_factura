import {
    saveSalary, getSalaryHistory, getCurrentSalary, getSalaryAtDate, getTotalSalaries, calculateEmployeePayroll
} from "../../../services/Worksheet/Employee/SalaryService.js";

export const save = async (req, res) => {
    try {
        const { employeeId } = req.params;

        const salary = await saveSalary(
            employeeId,
            req.body,
            req.user.business_id
        );

        return res.status(201).json({
            message: salary.isChange
                ? "Salario actualizado correctamente"
                : "Historial salarial creado correctamente",
            data: salary.data
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

        const salaryHistory = await getSalaryHistory(
            employeeId,
            req.user.business_id
        );

        return res.status(200).json({
            message: "Historial salarial encontrado",
            data: salaryHistory
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

        const salary = await getCurrentSalary(
            employeeId,
            req.user.business_id
        );

        return res.status(200).json({
            message: "Salario actual encontrado",
            data: salary
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
        const { date } = req.query;

        const salary = await getSalaryAtDate(
            employeeId,
            date,
            req.user.business_id
        );

        return res.status(200).json({
            message: "Salario encontrado para la fecha indicada",
            data: salary
        });

    } catch (error) {
        return res.status(404).json({
            message: error.message
        });
    }
};

export const getTotal = async (req, res) => {
    try {
        const { branchId, date } = req.query;
        const totalSalaries = await getTotalSalaries(
            req.user.business_id,
            branchId,
            date
        );

        return res.status(200).json({
            message: "Total de salarios encontrado",
            data: totalSalaries
        });

    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};

export const calculatePayroll = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { periodStart, periodEnd } = req.query;
        const payroll = await calculateEmployeePayroll(
            employeeId,
            req.user.business_id,
            {
                periodStart,
                periodEnd
            }
        );
        return res.status(200).json({
            message: "Nómina calculada correctamente",
            data: payroll
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};