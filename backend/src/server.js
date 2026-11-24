import dotenv from "dotenv";
dotenv.config();
import models from "./models/index.js";
import app, { startServer } from "./app.js";
import "./jobs/licenseJob.js";
import "./jobs/marketingCampaignJob.js";
import "./jobs/payrollPeriodJob.js"
import "./jobs/schedulers/monthlyBenefitJobs.js ";

const PORT = process.env.PORT || 5000;

startServer(PORT);