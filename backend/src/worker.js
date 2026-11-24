import sequelize from "./config/database.js";
import models from "./models/index.js";
import { startSystemJobWorker } from "./jobs/index.js";

const start = async () => {
    try {
        await sequelize.authenticate();
        console.log("Worker database connected");
        await startSystemJobWorker();

    } catch (error) {
        console.error( "Worker startup error:", error );
        process.exit(1);
    }
};

start();