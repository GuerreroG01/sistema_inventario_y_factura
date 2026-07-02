import { Router } from "express";
import { showInventoryMovements } from "../controllers/inventoryMovController.js";

const router = Router();

router.get("/", showInventoryMovements);

export default router;