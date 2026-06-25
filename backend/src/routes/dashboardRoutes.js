import express from "express";
import { 
    dashboardMetrics, profitabilityMetrics, rankingMetrics, InventoryAlertsMetrics, ExpiringProductsMetrics
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/dashboardMetrics", dashboardMetrics);
router.get("/profitabilityMetrics", profitabilityMetrics);
router.get("/salesRankingMetrics", rankingMetrics);
router.get("/inventoryAlertsMetrics", InventoryAlertsMetrics);
router.get("/expiringProductsMetrics", ExpiringProductsMetrics);

export default router;