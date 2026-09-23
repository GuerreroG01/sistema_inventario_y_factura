import express from "express";
import { getTotalEmployerCosts, getEmployeeEmployerCosts } from "../../../controllers/Worksheet/Employee/EmployerCostController.js";
import licenseMiddleware from "../../../middlewares/licenseMiddleware.js";

const router = express.Router();
router.use(licenseMiddleware);

/* Hay un problema en el flujo de getTotalEmployerCosts porque algo esta pasando que parece entrar en algún lado en el metodo 
de getEmployeeEmployerCosts porque pide un id y también falta reflejar los resultados de forma visual en el frontend */
router.get("/total", getTotalEmployerCosts);
router.get("/:employeeId", getEmployeeEmployerCosts);

export default router;