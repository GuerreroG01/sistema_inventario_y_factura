import dotenv from "dotenv";
dotenv.config();

import app, { startServer } from "./app.js";

const PORT = process.env.PORT || 5000;

startServer(PORT);