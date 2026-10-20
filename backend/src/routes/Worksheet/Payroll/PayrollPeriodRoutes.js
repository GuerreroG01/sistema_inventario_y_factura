import { Router } from "express";

import { create, get, getById, update, updateStatus, deletePeriod, calculatePayroll,
    getSummary, getItemsByEmployee
} from "../../../controllers/Worksheet/Payroll/PayrollPeriodController.js";

const router = Router();

router.post("/", create); 
router.post("/:periodId/calculate",calculatePayroll);
router.get("/", get);
router.get("/:periodId/summary",getSummary);
router.get("/:periodId/employees/:payrollEmployeeId/items",getItemsByEmployee);
router.get("/:id", getById);
router.patch("/:id", update);
router.patch("/:id/status", updateStatus);
router.delete("/:id", deletePeriod);

export default router;