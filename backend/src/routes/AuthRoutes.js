import { Router } from "express";
import { login, register, getSystemStatus } from "../controllers/authController.js";

const router = Router();

router.get("/status", getSystemStatus);
router.post("/login", login);
router.post("/register", register);
export default router;