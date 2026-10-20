import { DataTypes } from "sequelize";
import sequelize from "../../../config/database.js"

const PayrollEmployee = sequelize.define("PayrollEmployee", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    payroll_period_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "PayrollPeriods",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
    },

    employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "Employees",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
    },

    employment_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "EmployeeEmployments",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
    },

    gross_salary: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
    },

    total_earnings: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
    },

    total_deductions: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
    },

    net_salary: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
    },

    employer_cost: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
    },

    status: {
        type: DataTypes.ENUM(
            "PENDING",
            "CALCULATED",
            "APPROVED",
            "PAID",
            "CANCELLED"
        ),
        allowNull: false,
        defaultValue: "PENDING",
    },
}, {
    indexes: [
        {
            unique: true,
            fields: ["payroll_period_id", "employee_id"],
        },
    ],
});
export default PayrollEmployee;