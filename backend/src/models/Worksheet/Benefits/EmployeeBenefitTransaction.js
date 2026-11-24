import { DataTypes } from "sequelize";
import sequelize from "../../../config/database.js";

const EmployeeBenefitTransaction = sequelize.define("EmployeeBenefitTransaction",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        employee_benefit_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "EmployeeBenefits",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
        transaction_type: {
            type: DataTypes.ENUM(
                "ACCRUAL",
                "USAGE",
                "PAYMENT",
                "ADJUSTMENT",
                "REVERSAL"
            ),
            allowNull: false,
        },
        amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            validate: {
                notZero(value) {
                    if (Number(value) === 0) {
                        throw new Error(
                            "El importe del movimiento no puede ser cero."
                        );
                    }
                },
            },
        },
        balance_before: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },
        balance_after: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        reference_type: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        reference_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        idempotency_key: {
            type: DataTypes.STRING(150),
            allowNull: true,
            unique: true,
        },
        reverses_transaction_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "BenefitTransactions",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
        period_start_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        period_end_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            validate: {
                isAfterOrEqual(value) {
                    if (
                        value &&
                        this.period_start_date &&
                        value < this.period_start_date
                    ) {
                        throw new Error(
                            "La fecha final del período no puede ser anterior a la inicial."
                        );
                    }
                },
            },
        },
        description: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        tableName: "BenefitTransactions",
        timestamps: true,
        underscored: true,
        indexes: [
            {
                fields: ["employee_benefit_id", "date"],
            },
            {
                fields: ["reference_type", "reference_id"],
            },
        ],
    }
);
export default EmployeeBenefitTransaction;