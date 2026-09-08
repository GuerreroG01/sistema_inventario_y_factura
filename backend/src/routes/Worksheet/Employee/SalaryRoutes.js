import express from "express";
import { save, getHistory, getCurrent, getAtDate, getTotal } from "../../../controllers/Worksheet/Employee/SalaryController.js";
import licenseMiddleware from "../../../middlewares/licenseMiddleware.js";

const router = express.Router();
router.use(licenseMiddleware);

router.get("/total", getTotal);
router.post("/:employeeId", save);
router.get("/:employeeId/history", getHistory);
router.get("/:employeeId/current", getCurrent);
router.get("/:employeeId/atDate", getAtDate);

export default router;