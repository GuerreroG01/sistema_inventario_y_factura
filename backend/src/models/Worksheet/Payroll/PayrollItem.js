import { DataTypes } from "sequelize";
import sequelize from "../../../config/database.js"

const PayrollItem = sequelize.define("PayrollItem", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    payroll_employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "PayrollEmployees",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
    },

    payroll_rule_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "PayrollRules",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
    },

    concept: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    type: {
        type: DataTypes.ENUM(
            "EARNING",
            "DEDUCTION",
            "EMPLOYER_COST"
        ),
        allowNull: false,
    },

    amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
    },

    calculation_base: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },

    applied_percentage: {
        type: DataTypes.DECIMAL(7, 4),
        allowNull: true,
    },

    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});

export default PayrollItem;