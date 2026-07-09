import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Product = sequelize.define("Products", {
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
        type: DataTypes.DECIMAL(10, 2), // Este valor de costo servirá solo para en el frontend
        allowNull: true, // ver el margen de ganancia en base al costo y precio del producto.
    }, // Lo mejor es que los costos sean manejados desde la tabla de egresos.

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

    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },

    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }
},
{
    tableName:"Products"
});

export default Product;