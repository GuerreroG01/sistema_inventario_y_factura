import dotenv from "dotenv";
dotenv.config();

import app, { startServer } from "./app.js";
import "./jobs/licenseJob.js";
import "./jobs/marketingCampaignJob.js";
import "./jobs/payrollPeriodJob.js"

const PORT = process.env.PORT || 5000;

startServer(PORT);