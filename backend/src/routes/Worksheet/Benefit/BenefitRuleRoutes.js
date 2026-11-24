
import express from "express";
import { 
    getRules, getRuleById, createRule, updateRule, deleteRule, activeRule
} from "../../../controllers/Worksheet/Benefit/BenefitRuleController.js";
import licenseMiddleware from "../../../middlewares/licenseMiddleware.js";

const router = express.Router();
router.use(licenseMiddleware);

router.get("/", getRules);
router.get("/:id", getRuleById);
router.post("/", createRule);
router.patch("/:id", updateRule);
router.put("/:id/deactivate", deleteRule);
router.put("/:id/activate", activeRule);

export default router;
