import sequelize from "./config/database.js";
import models from "./models/index.js";

import "./jobs/schedulers/monthlyBenefitJobs.js";
import "./jobs/schedulers/benefitIssueScheduler.js";

const start = async () => {
    try {
        await sequelize.authenticate();

        console.log("Scheduler database connected");
        console.log("Benefit schedulers started");

    } catch (error) {
        console.error("Scheduler startup error:", error);
        process.exit(1);
    }
};

start();