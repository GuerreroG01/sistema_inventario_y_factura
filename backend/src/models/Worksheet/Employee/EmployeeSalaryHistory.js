import { DataTypes } from "sequelize"
import sequelize from "../../../config/database.js"

const EmployeeSalaryHistory = sequelize.define("EmployeeSalaryHistory", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "Employee",
            key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
    },
    salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    salary_type: {
        type: DataTypes.ENUM(
            "MONTHLY",
            "WEEKLY",
            "DAILY",
            "HOURLY"
        ),
        allowNull: false,
        defaultValue: "MONTHLY"
    },
    effective_from: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    effective_to: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});

export default EmployeeSalaryHistory;