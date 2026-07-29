import { DataTypes } from "sequelize"
import sequelize from "../config/database.js"

const Sales = sequelize.define ("Sales",{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "PENDING"
    },
    client_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },

    payment_type:{
        type: DataTypes.ENUM(
            "CASH",
            "CREDIT",
            "CARD",
            "TRANSFER"
        ),
        defaultValue:"CASH"
    },

    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },

    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
});

export default Sales;