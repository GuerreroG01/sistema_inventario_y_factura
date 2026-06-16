import express from "express";
import productController from "../controllers/productController.js";

const router = express.Router();

router.post("/products", productController.createProduct);
router.get("/products", productController.getProducts);
router.get("/products/getCategories",productController.getCategories)
router.get("/products/dashboardinfo",productController.getProductStats);
router.get("/products/:id", productController.getProductById);
router.put("/products/:id", productController.updateProduct);
router.delete("/products/:id", productController.deleteProduct);

export default router;