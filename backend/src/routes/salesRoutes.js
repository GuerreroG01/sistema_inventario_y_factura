import express from "express";
import salesController from "../controllers/salesController.js";
import licenseMiddleware from "../middlewares/licenseMiddleware.js";

const router = express.Router();
router.use(licenseMiddleware);

router.post("/",salesController.createSale);
router.get("/",salesController.getSales);
router.get("/categories",salesController.getCategories);
router.patch("/:id/status",salesController.updateSaleStatus);
router.get("/:id",salesController.getSaleById);

export default router;