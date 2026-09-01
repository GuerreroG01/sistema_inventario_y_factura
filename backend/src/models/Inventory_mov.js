import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import ProductUnit from "./ProductsUnits.js";

const Inventory_mov = sequelize.define( "Inventory_mov",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        product_unit_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: ProductUnit,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },

        tipo: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        cantidad: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },

        fecha: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },

        referencia: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "Sales",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },

        observacion: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        business_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Business",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
        branch_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Branches",
                key: "id"
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT"
        }
    },
    {
        tableName: "Inventory_mov",
        freezeTableName: true,
    }
);
export default Inventory_mov;