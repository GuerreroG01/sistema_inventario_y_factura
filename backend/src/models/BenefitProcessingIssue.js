
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const BenefitProcessingIssue = sequelize.define("BenefitProcessingIssue", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },

    business_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    benefit_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "Tipo de beneficio: AGUINALDO o INDEMNIZACION"
    },

    period: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: "Periodo del beneficio, por ejemplo 2026"
    },

    issue_code: {
        type: DataTypes.STRING(100),
        allowNull: false
    },

    issue_message: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    status: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: "PENDING",
        comment: "PENDING, READY, PROCESSING, RESOLVED, IGNORED"
    },

    attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },

    processing_job_id: {
        type: DataTypes.UUID,
        allowNull: true
    },

    detected_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },

    resolved_at: {
        type: DataTypes.DATE,
        allowNull: true
    },

    last_attempt_at: {
        type: DataTypes.DATE,
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
    tableName: "BenefitProcessingIssues",
    timestamps: false,

    indexes: [
        {
            fields: ["business_id", "employee_id"]
        },
        {
            fields: ["employee_id", "benefit_type", "period"]
        },
        {
            fields: ["status", "detected_at"]
        },
        {
            fields: ["issue_code"]
        },
        {
            fields: ["business_id", "status", "benefit_type", "period"]
        },
        {
            fields: ["processing_job_id"]
        }
    ]
});

export default BenefitProcessingIssue;