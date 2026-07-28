import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Customer = sequelize.define("Customers", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },

    email: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },

    address: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    identification: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Cédula u otro documento"
    },

    credit_limit: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false,
        defaultValue: 0,
    },

    balance: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false,
        defaultValue: 0,
        comment: "Saldo pendiente del cliente"
    },

    status: {
        type: DataTypes.ENUM(
            "ACTIVE",
            "INACTIVE"
        ),
        defaultValue: "ACTIVE",
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

},{
    tableName:"Customers",
    timestamps:true
});


export default Customer;