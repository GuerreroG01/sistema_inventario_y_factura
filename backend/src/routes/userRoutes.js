import express from "express";
import { getUsers, getUserById, updateUserBusiness, updateUserBranch } from "../controllers/userController.js";
import { requireRole } from "../middlewares/roleMiddleware.js"

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUserById);
router.patch("/:id/business",requireRole("superAdmin"),updateUserBusiness);
router.patch("/:id/branch",updateUserBranch);

export default router;