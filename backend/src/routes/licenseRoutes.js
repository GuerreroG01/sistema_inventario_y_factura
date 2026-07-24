import { Router } from "express";
import * as licenseController from "../controllers/licenseController.js";

const router = Router();

router.get("/Test", licenseController.methodTest);
router.get("/pending", licenseController.checkPendingLicense);
router.get("/:businessId", licenseController.getLicense);
router.get("/:businessId/status", licenseController.getStatus);
router.post("/", licenseController.createTrialLicense)
router.post("/activate", licenseController.activatePendings);
router.put("/:businessId/renew", licenseController.renew);
router.put("/:businessId/extend", licenseController.extend);
router.put("/:businessId/suspend", licenseController.suspend);
router.put("/:businessId/reactivate", licenseController.reactivate);
router.put("/:businessId/lifetime", licenseController.createLifetime);
router.put("/:businessId/type", licenseController.changeType);
router.delete("/:businessId/revoke", licenseController.revoke);

export default router;