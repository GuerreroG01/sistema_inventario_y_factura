"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("PayrollPeriods", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },

            business_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "Business",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "RESTRICT",
            },

            start_date: {
                type: Sequelize.DATEONLY,
                allowNull: false,
            },

            end_date: {
                type: Sequelize.DATEONLY,
                allowNull: false,
            },

            payment_date: {
                type: Sequelize.DATEONLY,
                allowNull: false,
            },

            status: {
                type: Sequelize.ENUM(
                    "DRAFT",
                    "CALCULATED",
                    "APPROVED",
                    "PAID",
                    "CANCELLED"
                ),
                allowNull: false,
                defaultValue: "DRAFT",
            },

            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },

            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });

        await queryInterface.createTable("PayrollEmployees", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },

            payroll_period_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "PayrollPeriods",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "RESTRICT",
            },

            employee_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "Employees",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "RESTRICT",
            },

            employment_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "EmployeeEmployments",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "RESTRICT",
            },

            gross_salary: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0,
            },

            total_earnings: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0,
            },

            total_deductions: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0,
            },

            net_salary: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0,
            },

            employer_cost: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0,
            },

            status: {
                type: Sequelize.ENUM(
                    "PENDING",
                    "CALCULATED",
                    "APPROVED",
                    "PAID",
                    "CANCELLED"
                ),
                allowNull: false,
                defaultValue: "PENDING",
            },

            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },

            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });

        await queryInterface.addConstraint("PayrollEmployees", {
            fields: ["payroll_period_id", "employee_id"],
            type: "unique",
            name: "uq_payroll_employee_period_employee",
        });

        await queryInterface.createTable("PayrollItems", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },

            payroll_employee_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "PayrollEmployees",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "RESTRICT",
            },

            payroll_rule_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "PayrollRules",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "RESTRICT",
            },

            concept: {
                type: Sequelize.STRING,
                allowNull: false,
            },

            type: {
                type: Sequelize.ENUM(
                    "EARNING",
                    "DEDUCTION",
                    "EMPLOYER_COST"
                ),
                allowNull: false,
            },

            amount: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: false,
            },

            calculation_base: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: true,
            },

            applied_percentage: {
                type: Sequelize.DECIMAL(7, 4),
                allowNull: true,
            },

            description: {
                type: Sequelize.STRING,
                allowNull: true,
            },

            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },

            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });

        await queryInterface.addIndex("PayrollPeriods", [
            "business_id",
            "start_date",
            "end_date",
        ], {
            name: "idx_payroll_period_business_dates",
        });

        await queryInterface.addIndex("PayrollEmployees", [
            "employee_id",
        ], {
            name: "idx_payroll_employee_employee",
        });

        await queryInterface.addIndex("PayrollItems", [
            "payroll_employee_id",
        ], {
            name: "idx_payroll_item_employee",
        });

        await queryInterface.addIndex("PayrollItems", [
            "payroll_rule_id",
        ], {
            name: "idx_payroll_item_rule",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("PayrollItems");
        await queryInterface.dropTable("PayrollEmployees");
        await queryInterface.dropTable("PayrollPeriods");

        if (queryInterface.sequelize.getDialect() === "postgres") {
            await queryInterface.sequelize.query(
                'DROP TYPE IF EXISTS "enum_PayrollItems_type";'
            );

            await queryInterface.sequelize.query(
                'DROP TYPE IF EXISTS "enum_PayrollEmployees_status";'
            );

            await queryInterface.sequelize.query(
                'DROP TYPE IF EXISTS "enum_PayrollPeriods_status";'
            );
        }
    },
};