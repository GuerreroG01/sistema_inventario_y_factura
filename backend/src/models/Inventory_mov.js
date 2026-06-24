import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Product from "./Products.js";
const Inventory_mov = sequelize.define("Inventory_mov", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Product,
            key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    },

    tipo: {
        type: DataTypes.STRING,
        allowNull: false
    },

    cantidad: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },

    fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },

    referencia: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "Sales",
            key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
    },

    observacion: {
        type: DataTypes.STRING,
        allowNull: true
    } 
},
{
    tableName: "Inventory_mov",
    freezeTableName: true
}
);
export default Inventory_mov;