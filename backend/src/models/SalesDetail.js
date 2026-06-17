import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const SaleDetail = sequelize.define("SaleDetail", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    sale_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "Sales",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },

    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "Product",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
    },

    descripcion: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    precio_unitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },

    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },

    tipo_item: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    timestamps: false,
});

export default SaleDetail;