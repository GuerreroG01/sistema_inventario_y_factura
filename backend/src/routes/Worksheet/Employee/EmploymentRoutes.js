import express from "express"
import { create, getHistory, getCurrent, getAtDate, end } from "../../../controllers/Worksheet/Employee/EmploymentController.js";
import licenseMiddleware from "../../../middlewares/licenseMiddleware.js";
const router = express.Router();
router.use(licenseMiddleware);

router.post("/:employeeId", create);
router.get("/:employeeId/history", getHistory);
router.get("/:employeeId/current", getCurrent);
router.get("/:employeeId/atDate", getAtDate);
router.patch("/:employeeId/end", end);
export default router;