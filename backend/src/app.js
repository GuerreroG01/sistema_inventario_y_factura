import express from "express";
import cors from "cors";
import sequelize from "./config/database.js";
import Product from "./models/Products.js";
import productRoutes from "./routes/productRoutes.js";
import salesRoutes from "./routes/salesRoutes.js"
import dashboardRoutes from "./routes/dashboardRoutes.js"
import inventoryMovRoutes from "./routes/inventoryMovRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import businessRoutes from "./routes/businessRoutes.js"
import authRoutes from "./routes/AuthRoutes.js";
import licenseRoutes from "./routes/licenseRoutes.js";
import { verifyToken } from "./middlewares/authMiddleware.js";
import { requireRole } from "./middlewares/roleMiddleware.js"
import { syncSequence } from "./utils/syncSequence.js";
import "./models/associations.js";

const app = express();

app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
}));

app.use(express.json());
app.use("/api/products", verifyToken, productRoutes);
app.use("/api/sales", verifyToken, salesRoutes);
app.use("/api/dashboard", verifyToken, dashboardRoutes);
app.use("/api/inventory-movements", verifyToken, inventoryMovRoutes);
app.use("/api/expenses", verifyToken, expenseRoutes);
app.use("/api/business", verifyToken, requireRole("superAdmin"), businessRoutes);
app.use("/api/licenses", verifyToken, licenseRoutes);
app.use("/api/auth", authRoutes);

export default app;

export const startServer = async (PORT = 5000) => {
    try {
        await sequelize.sync();

        await syncSequence("Products");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Error starting server:", error);
        process.exit(1);
    }
};