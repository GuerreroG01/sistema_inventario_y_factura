import express from "express";
import {
    createEmployeeBenefit, assignBenefitRuleToEmployee, bulkAssignBenefitRule,
    getEmployeeBenefits, getEmployeeBenefitById, updateEmployeeBenefit,
    changeEmployeeBenefitStatus
} from "../../../controllers/Worksheet/Benefit/EmployeeBenefitController.js";


import licenseMiddleware from "../../../middlewares/licenseMiddleware.js";

const router = express.Router();
router.use(licenseMiddleware);

router.get("/employee/:employeeId", getEmployeeBenefits);
router.get("/:id", getEmployeeBenefitById);
router.post("/", createEmployeeBenefit);
router.post("/assign", assignBenefitRuleToEmployee);
router.post("/bulk-assign", bulkAssignBenefitRule);
router.patch("/:id", updateEmployeeBenefit);
router.put("/:id/status", changeEmployeeBenefitStatus);

export default router;