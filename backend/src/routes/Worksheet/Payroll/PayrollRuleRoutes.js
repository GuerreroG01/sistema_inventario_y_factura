import express from "express";
import { 
    getRules, getRuleById, createRule, createRuleVersion, deleteRule, activeRule
} from "../../../controllers/Worksheet/Payroll/PayrollRuleController.js";
import licenseMiddleware from "../../../middlewares/licenseMiddleware.js";

const router = express.Router();
router.use(licenseMiddleware);

router.get("/", getRules);
router.get("/:id", getRuleById);
router.post("/", createRule);
router.post( "/:id/version", createRuleVersion);
router.put("/:id/deactivate", deleteRule);
router.put("/:id/activate", activeRule);

export default router;