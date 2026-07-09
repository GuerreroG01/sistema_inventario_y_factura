'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {

        await queryInterface.createTable("User", {
            Id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            Usuario: {
                type: Sequelize.STRING(30),
                allowNull: false,
            },

            Clave: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },

            Email: {
                type: Sequelize.STRING(50),
                allowNull: false,
            },

            Telefono: {
                type: Sequelize.STRING(20),
                allowNull: false,
            },

            Rol: {
                type: Sequelize.STRING(10),
                allowNull: false,
                defaultValue: "Empleado",
            },

            FechaIngreso: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },

            Activo: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },

            UltimoAcceso: {
                type: Sequelize.DATE,
                allowNull: true,
            }
        });

        await queryInterface.addColumn(
            "Products",
            "created_by",
            {
                type: Sequelize.INTEGER,
                allowNull: true,
            }
        );

        await queryInterface.addColumn(
            "Products",
            "updated_by",
            {
                type: Sequelize.INTEGER,
                allowNull: true,
            }
        );

        await queryInterface.addColumn(
            "Expenses",
            "created_by",
            {
                type: Sequelize.INTEGER,
                allowNull: true,
            }
        );

        await queryInterface.addColumn(
            "Expenses",
            "updated_by",
            {
                type: Sequelize.INTEGER,
                allowNull: true,
            }
        );

        await queryInterface.addColumn(
            "Sales",
            "created_by",
            {
                type: Sequelize.INTEGER,
                allowNull: true,
            }
        );

        await queryInterface.addColumn(
            "Sales",
            "updated_by",
            {
                type: Sequelize.INTEGER,
                allowNull: true,
            }
        );
    },


    async down(queryInterface) {

        await queryInterface.removeColumn(
            "Products",
            "created_by"
        );

        await queryInterface.removeColumn(
            "Products",
            "updated_by"
        );

        await queryInterface.removeColumn(
            "Expenses",
            "created_by"
        );

        await queryInterface.removeColumn(
            "Expenses",
            "updated_by"
        );

        await queryInterface.removeColumn(
            "Sales",
            "created_by"
        );

        await queryInterface.removeColumn(
            "Sales",
            "updated_by"
        );
        await queryInterface.dropTable("User");
    }
};