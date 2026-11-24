
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const SystemJob = sequelize.define("SystemJob", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },

    business_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    job_type: {
        type: DataTypes.STRING(100),
        allowNull: false
    },

    job_category: {
        type: DataTypes.STRING(50),
        allowNull: true
    },

    payload: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
    },

    batch_size: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 50
    },

    max_attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3
    },

    status: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: "PENDING"
    },

    total_records: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    total_processed: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    total_failed: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    last_record_id: {
        type: DataTypes.BIGINT,
        defaultValue: 0,
        allowNull: false
    },

    total_batches: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    completed_batches: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    locked_by: {
        type: DataTypes.STRING(100),
        allowNull: true
    },

    locked_until: {
        type: DataTypes.DATE,
        allowNull: true
    },

    last_error_code: {
        type: DataTypes.STRING(100),
        allowNull: true
    },

    last_error_message: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    last_error_at: {
        type: DataTypes.DATE,
        allowNull: true
    },

    error_details: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    
    started_at: {
        type: DataTypes.DATE,
        allowNull: true
    },

    completed_at: {
        type: DataTypes.DATE,
        allowNull: true
    },

    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },

    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }

}, {
    tableName: "SystemJobs",
    timestamps: false,

    indexes: [
        {
            fields: ["business_id", "status"]
        },
        {
            fields: ["job_type"]
        },
        {
            fields: ["status", "createdAt"]
        }
    ]
});
export default SystemJob;