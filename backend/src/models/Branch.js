import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Branch = sequelize.define("Branches", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    business_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "Business",
            key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    type: {
        type: DataTypes.ENUM(
            "MAIN",
            "SECONDARY",
            "WAREHOUSE",
            "OFFICE"
        ),
        allowNull: false,
        defaultValue: "SECONDARY"
    },

    country: {
        type: DataTypes.STRING,
        allowNull: false
    },

    city: {
        type: DataTypes.STRING,
        allowNull: false
    },

    address: {
        type: DataTypes.STRING,
        allowNull: true
    },

    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },

    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "ACTIVE"
    }
}, {
    tableName: "Branches",
    timestamps: true
});
export default Branch;