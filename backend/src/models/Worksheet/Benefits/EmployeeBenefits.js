import { DataTypes } from "sequelize";
import sequelize from "../../../config/database.js";

const EmployeeBenefit = sequelize.define("EmployeeBenefit",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        employee_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: "Employees", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
        business_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: "Business", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
        benefit_rule_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: "BenefitRules", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
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
        benefit_mode: {
            type: DataTypes.ENUM("RECURRING", "ONE_TIME"),
            allowNull: false,
            defaultValue: "RECURRING",
        },
        balance: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0,
            },
        },
        unit: {
            type: DataTypes.ENUM("DAYS", "CURRENCY"),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("ACTIVE", "PAUSED", "CLOSED"),
            allowNull: false,
            defaultValue: "ACTIVE",
        },
        start_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        end_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
    },
    {
        tableName: "EmployeeBenefits",
        timestamps: true,
        underscored: true,
        indexes: [
            { fields: ["employee_id", "type", "status"] },
            { fields: ["business_id", "employee_id"] },
            { fields: ["benefit_rule_id"] },
        ],
    }
);

export default EmployeeBenefit;