import dotenv from "dotenv";
dotenv.config();

import { Sequelize } from "sequelize";

console.log("DATABASE_URL =", process.env.DATABASE_URL);

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    client_encoding: "UTF8",
  },
});

export default sequelize;