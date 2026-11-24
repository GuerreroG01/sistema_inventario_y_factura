
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const SystemJobError = sequelize.define("SystemJobError", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },

    job_id: {
        type: DataTypes.UUID,
        allowNull: false
    },

    business_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    employee_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    batch_number: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    attempt_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },

    error_code: {
        type: DataTypes.STRING(100),
        allowNull: true
    },

    error_message: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    error_stack: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    error_details: {
        type: DataTypes.JSONB,
        allowNull: true
    },

    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }

}, {
    tableName: "SystemJobErrors",
    timestamps: false,
    indexes: [
        { fields: ["job_id"] },
        { fields: ["business_id"] },
        { fields: ["employee_id"] },
        { fields: ["error_code"] },
        { fields: ["job_id", "attempt_number"] }
    ]
});
export default SystemJobError;