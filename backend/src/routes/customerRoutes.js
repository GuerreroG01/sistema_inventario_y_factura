import { Router } from "express";
import * as customerController from "../controllers/customerController.js";

const router = Router();

router.post("/", customerController.create);
router.get("/", customerController.getCustomers);
router.get("/autocomplete",customerController.getCustomerAutocomplete);
router.get("/:id", customerController.getCustomerById);
router.get("/:id/summary", customerController.summaryCustomer);
router.get("/:id/sales",customerController.salesHistory);
router.get("/:id/indicators",customerController.indicatorsCustomer);
router.put("/:id", customerController.update);
router.patch("/:id/status", customerController.changeStatus);
router.get("/:id/preferences", customerController.customerPreferences);

export default router;