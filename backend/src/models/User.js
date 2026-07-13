import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const User = sequelize.define("User", {
    Id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    Usuario: {
        type: DataTypes.STRING(30),
        allowNull: false,
    },

    Clave: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },

    Email: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },

    Telefono: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },

    Rol: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: "Empleado",
    },

    FechaIngreso: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },

    Activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },

    UltimoAcceso: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    business_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:"Business",
            key:"id"
        }
    }

}, {
    tableName: "User",
    timestamps: false,
});

export default User;