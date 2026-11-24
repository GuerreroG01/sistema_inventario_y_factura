import { DataTypes } from "sequelize";
import sequelize from "../../../config/database.js";

const BenefitRule = sequelize.define("BenefitRule",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        business_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: "Business", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
        type: {
            type: DataTypes.ENUM(
                "VACATION",
                "THIRTEENTH_MONTH",
                "SEVERANCE",
                "TRANSPORT",
                "FOOD",
                "OTHER"
            ),
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        scope: {
            type: DataTypes.ENUM("GLOBAL", "EMPLOYEE"),
            allowNull: false,
            defaultValue: "GLOBAL",
        },

        // Cómo se otorga el beneficio.
        benefit_mode: {
            type: DataTypes.ENUM("RECURRING", "ONE_TIME"),
            allowNull: false,
            defaultValue: "RECURRING",
        },
        frequency: {
            type: DataTypes.ENUM(
                "NONE",
                "MONTHLY",
                "BIWEEKLY",
                "YEARLY",
                "ON_DEMAND"
            ),
            allowNull: false,
            defaultValue: "NONE",
        },
        unit: {
            type: DataTypes.ENUM("DAYS", "CURRENCY"),
            allowNull: false,
        },
        amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            validate: {
                min: 0,
            },
        },
        formula: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        start_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        end_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            validate: {
                isAfterOrEqual(value) {
                    if (value && this.start_date && value < this.start_date) {
                        throw new Error(
                            "La fecha final no puede ser anterior a la inicial."
                        );
                    }
                },
            },
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        conditions: {
            type: DataTypes.JSON,
            allowNull: true,
        },
    },
    {
        tableName: "BenefitRules",
        timestamps: true,
        underscored: true,
        indexes: [
            { fields: ["business_id", "type"] },
            { fields: ["business_id", "scope", "is_active"] },
        ],
    }
);

export default BenefitRule;