import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const License = sequelize.define("License", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    business_id: { //Licencia por negocio
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "Business",
            key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    },

    license_key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    type: { // Tipo de licencia que empieza con periodo de prueba
        type: DataTypes.ENUM(
            "SUBSCRIPTION",
            "LIFETIME",
            "TRIAL_PERIOD"
        ),
        allowNull: false,
        defaultValue: "TRIAL_PERIOD"
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    duration_unit: {
        type: DataTypes.ENUM(
            "DAY",
            "MONTH",
            "YEAR"
        ),
        allowNull: true
    },

    status: { //Estados de la licencia, suspendida en caso de que algo pase
        type: DataTypes.ENUM(
            "ACTIVE",
            "EXPIRED",
            "SUSPENDED",
            "PENDING"
        ),
        defaultValue: "ACTIVE"
    },

    activated_at: {
        type: DataTypes.DATE,
    },

    expires_at: {
        type: DataTypes.DATE,
    },

    grace_period_days: { // Periodo de prórroga luego de que la licencia expire antes de bloquear el sistema
        type: DataTypes.INTEGER,
        defaultValue: 5
    },

    last_validation: { //Para validaciones de licencia
        type: DataTypes.DATE
    }
});
export default License;