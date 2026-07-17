import { Router } from "express";
import * as businessController from "../controllers/businessController.js";

const router = Router();

router.post("/",businessController.createBusiness);
router.get("/",businessController.getBusinesses);
router.get("/businessByName", businessController.getBusinessAutocomplete);
router.get("/:id",businessController.getBusinessById);
router.put("/:id",businessController.updateBusiness);
router.patch("/:id/status",businessController.changeBusinessStatus);
router.delete("/:id",businessController.deleteBusiness);

export default router;