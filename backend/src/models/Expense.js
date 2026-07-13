import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Expense = sequelize.define("Expenses", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },

    category: {
        type: DataTypes.STRING,
        allowNull: false, // renta, salario, servicios, otros
    },

    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },

    payment_method: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },

    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,//Activo, anulado, etc.
        allowNull: false,
        defaultValue: "Activo"
    },
    removal_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    business_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:"Business",
            key:"id"
        },
        onUpdate:"CASCADE",
        onDelete:"RESTRICT"
    }
}, {
    tableName: "Expenses",
    timestamps: false
});
export default Expense;