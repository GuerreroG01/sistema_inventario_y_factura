import { calculateEmployeeEmployerCosts, calculateTotalEmployerCosts
} from "../../../services/Worksheet/Payroll/EmployerCostService.js";

export const getTotalEmployerCosts = async (req, res) => {
    try {
        const businessId = req.user?.business_id;
        const { date, branchId, hoursPerDay, daysPerWeek } = req.query;
        console.log("getTotalEmployerCosts");
        console.log("params:", req.params);
        console.log("query:", req.query);
        if (!businessId) {
            return res.status(400).json({
                message: "businessId es obligatorio"
            });
        }
        const calculationDate = date || new Date().toISOString().split("T")[0];

        const result =
            await calculateTotalEmployerCosts({
                businessId: Number(businessId),
                date: calculationDate,
                branchId:
                    branchId !== undefined &&
                    branchId !== null &&
                    branchId !== ""
                        ? Number(branchId)
                        : null,
                options: {
                    hoursPerDay: hoursPerDay
                        ? Number(hoursPerDay)
                        : 8,
                    daysPerWeek: daysPerWeek
                        ? Number(daysPerWeek)
                        : 5
                }
            });

        return res.status(200).json({
            message: "Costos patronales calculados correctamente",
            data: result
        });

    } catch (error) {
        console.error(
            "Error al calcular costos patronales:",
            error
        );

        return res.status(500).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Error al calcular los costos patronales"
        });
    }
};

export const getEmployeeEmployerCosts = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const businessId = req.user?.business_id;
        const { date, hoursPerDay, daysPerWeek } = req.query;
        console.log("getEmployeeEmployerCosts");
        console.log("params:", req.params);
        console.log("query:", req.query);
        if (!businessId) {
            return res.status(400).json({
                message: "businessId es obligatorio"
            });
        }

        if (!employeeId) {
            return res.status(400).json({
                message: "employeeId es obligatorio"
            });
        }

        const calculationDate =
            date || new Date().toISOString().split("T")[0];

        const result =
            await calculateEmployeeEmployerCosts({
                employeeId: Number(employeeId),
                businessId: Number(businessId),
                date: calculationDate,
                options: {
                    hoursPerDay: hoursPerDay
                        ? Number(hoursPerDay)
                        : 8,

                    daysPerWeek: daysPerWeek
                        ? Number(daysPerWeek)
                        : 5
                }
            });

        return res.status(200).json({
            message: "Costo patronal del empleado calculado correctamente",
            data: result
        });

    } catch (error) {
        console.error(
            "Error al calcular costo patronal del empleado:",
            error
        );

        return res.status(500).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Error al calcular el costo patronal del empleado"
        });
    }
};