import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ProductUnit = sequelize.define("ProductsUnits",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Products",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },

        unit: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        barcode: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },

        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },

        cost: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },

        stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },

        hasPromotion: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        promotionPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },

        promotionQuantity: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        promotionStart: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        promotionEnd: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        entryDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },

        expirationDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },

        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        tableName: "ProductsUnits",
        timestamps: false
    }
);

export default ProductUnit;