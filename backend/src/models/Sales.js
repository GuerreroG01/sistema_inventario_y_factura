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

    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },

    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }
    /*client_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Clients', // nombre de la tabla (o modelo si usas referencia directa)
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    }*/
});

export default Sales;