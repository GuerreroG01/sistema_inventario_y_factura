import { Router } from "express";
import { login, register, getSystemStatus, logout, getUsername } from "../controllers/AuthController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
const router = Router();

router.get("/status", getSystemStatus);
router.get("/username/:id", getUsername);
router.post("/login", login);
//router.post("/register", verifyToken, register);
router.post("/register", register);// Para mientras en producción ya que no ha ejecutado los seeders
router.post("/logout",verifyToken,logout);
export default router;