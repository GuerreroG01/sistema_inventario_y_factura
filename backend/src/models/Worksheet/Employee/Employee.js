import { DataTypes } from "sequelize"
import sequelize from "../../../config/database.js"

const Employee = sequelize.define("Employee", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    business_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "Business",
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
    employee_code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    identification: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    position: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    department: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    hire_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    termination_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "ACTIVE",
    },
});

export default Employee;