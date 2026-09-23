import { DataTypes } from "sequelize";
import sequelize from "../../../../config/database.js";

const PayrollRule = sequelize.define("PayrollRule", {
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
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
    },

    branch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "Branches",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
    },

    code: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    type: {
        type: DataTypes.ENUM(
            "DEDUCTION",
            "EMPLOYER_COST",
            "EARNING"
        ),
        allowNull: false,
    },

    calculation_type: {
        type: DataTypes.ENUM(
            "FIXED",
            "PERCENTAGE",
            "PROGRESSIVE"
        ),
        allowNull: false,
    },

    base_type: {
        type: DataTypes.ENUM(
            "GROSS_SALARY",
            "NET_SALARY",
            "ANNUAL_NET_SALARY",
            "ANNUAL_GROSS_SALARY",
            "CUSTOM"
        ),
        allowNull: false,
    },

    value: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },

    percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
    },

    effective_from: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },

    effective_to: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },

    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
});

export default PayrollRule;