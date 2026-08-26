import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Product = sequelize.define( "Products",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        category: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        type_item: {
            type: DataTypes.ENUM("Producto", "Servicio"),
            defaultValue: "Producto",
        },

        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },

        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
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
    },
    {
        tableName: "Products",
    }
);

export default Product;