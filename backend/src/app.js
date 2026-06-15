import express from "express";
import cors from "cors";
import sequelize from "./config/database.js";
import Product from "./models/Product.js";
import productRoutes from "./routes/productRoutes.js";
import { syncSequence } from "./utils/syncSequence.js";

const app = express();

app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());
app.use("/api", productRoutes);

export default app;

export const startServer = async (PORT = 5000) => {
    try {
        await sequelize.sync();

        await syncSequence("Products");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("❌ Error starting server:", error);
        process.exit(1);
    }
};