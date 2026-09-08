import express from "express";
import { create, getAll, getById, update, updateStatus, getSummary } from "../../../controllers/Worksheet/Employee/EmployeeController.js";
import licenseMiddleware from "../../../middlewares/licenseMiddleware.js";

const router = express.Router();
router.use(licenseMiddleware);

router.post("/", create);
router.get("/", getAll);
router.get("/summary", getSummary);
router.put("/:id/updateStatus", updateStatus);
router.get("/:id", getById);
router.put("/:id", update);

export default router;