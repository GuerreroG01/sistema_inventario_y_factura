import { DataTypes } from "sequelize";
import sequelize from "../../../../config/database.js";

const PayrollRuleTier = sequelize.define("PayrollRuleTier", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    payroll_rule_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    min_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
    },

    max_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },

    fixed_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
    },

    percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
    }
});
export default PayrollRuleTier;