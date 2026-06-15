import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Product = sequelize.define("Product", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    barcode: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },

    category: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    unit: {
        type: DataTypes.STRING,
        defaultValue: "unit",
    },

    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },

    cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },

    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },

    entryDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },

    expirationDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },

    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
});

export default Product;