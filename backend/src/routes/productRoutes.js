import express from "express";
import productController from "../controllers/productController.js";
import licenseMiddleware from "../middlewares/licenseMiddleware.js";

const router = express.Router();
router.use(licenseMiddleware);

router.post("/", productController.createProduct);
router.get("/", productController.getProducts);
router.get("/getCategories",productController.getCategories)
router.get("/dashboardinfo",productController.getProductStats);
router.get("/autocompleteProd",productController.getProductsAutocomplete);
router.get("/getStockAlerts",productController.getStockAlerts);
router.get("/:id", productController.getProductById);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

export default router;