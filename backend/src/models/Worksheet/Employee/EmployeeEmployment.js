import { DataTypes } from "sequelize"
import sequelize from "../../../config/database.js"

const EmployeeEmployment = sequelize.define("EmployeeEmployment", {
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
    branch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "Branches",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
    },
    position: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    department: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    employment_type: {
        type: DataTypes.ENUM(
            "FULL_TIME",
            "PART_TIME",
            "TEMPORARY",
            "CONTRACTOR"
        ),
        allowNull: false,
        defaultValue: "FULL_TIME"
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM(
            "ACTIVE",
            "INACTIVE",
            "ENDED"
        ),
        allowNull: false,
        defaultValue: "ACTIVE"
    },
});

export default EmployeeEmployment;