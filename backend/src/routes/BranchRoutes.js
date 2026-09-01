import { Router } from "express";
import { create, getAll, getById, update, changeStatus, deleteMethod, getByName, getStats } from "../controllers/BranchController.js";

const router = Router();

router.post("/:businessId",create);
router.get("/:businessId",getAll);
router.get("/:businessId/search",getByName);
router.get("/:businessId/stats", getStats);
router.get("/:businessId/:branchId",getById);
router.put("/:businessId/:branchId",update);
router.patch("/:businessId/:branchId/status",changeStatus);
router.delete("/:businessId/:branchId",deleteMethod);

export default router;