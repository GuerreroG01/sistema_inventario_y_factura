import { Router } from "express";
import * as customerController from "../controllers/customerController.js";

const router = Router();

router.post("/", customerController.create);
router.get("/", customerController.getCustomers);
router.get("/:id", customerController.getCustomerById);
router.put("/:id", customerController.update);
router.patch("/:id/status", customerController.changeStatus);

export default router;