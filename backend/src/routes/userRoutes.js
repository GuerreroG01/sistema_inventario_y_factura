import express from "express";
import { getUsers, getUserById, updateUserBusiness } from "../controllers/userController.js";
import { requireRole } from "../middlewares/roleMiddleware.js"

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUserById);
router.patch("/:id/business",requireRole("superAdmin"),updateUserBusiness);

export default router;