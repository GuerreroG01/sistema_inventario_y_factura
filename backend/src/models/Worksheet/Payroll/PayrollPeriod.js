import { DataTypes } from "sequelize";
import sequelize from "../../../config/database.js"

const PayrollPeriod = sequelize.define("PayrollPeriod", {
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

    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },

    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },

    payment_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },

    status: {
        type: DataTypes.ENUM(
            "DRAFT",
            "CALCULATED",
            "APPROVED",
            "PAID",
            "CANCELLED"
        ),
        allowNull: false,
        defaultValue: "DRAFT",
    },
});

export default PayrollPeriod;