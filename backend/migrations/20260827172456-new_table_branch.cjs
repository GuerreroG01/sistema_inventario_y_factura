'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {

    async up(queryInterface, Sequelize) {

        await queryInterface.createTable('Branches', {

            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },

            business_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                model: {
                    tableName: 'Business'
                },
                key: 'id'
            },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },

            name: {
                type: Sequelize.STRING,
                allowNull: false
            },

            type: {
                type: Sequelize.ENUM(
                    'MAIN',
                    'SECONDARY',
                    'WAREHOUSE',
                    'OFFICE'
                ),
                allowNull: false,
                defaultValue: 'SECONDARY'
            },

            country: {
                type: Sequelize.STRING,
                allowNull: false
            },

            city: {
                type: Sequelize.STRING,
                allowNull: false
            },

            address: {
                type: Sequelize.STRING,
                allowNull: true
            },

            phone: {
                type: Sequelize.STRING,
                allowNull: true
            },

            status: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'ACTIVE'
            },

            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('NOW')
            },

            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('NOW')
            }
        });

        const tablesWithBranch = [
            'Expenses',
            'Inventory_mov',
            'ProductsUnits',
            'Sales',
            'SaleDetails'
        ];

        for (const table of tablesWithBranch) {

            await queryInterface.addColumn(table, 'branch_id', {
                type: Sequelize.INTEGER,
                allowNull: true
            });

        }

        const businesses = await queryInterface.sequelize.query(
            `SELECT id, name FROM Business`,
            {
                type: Sequelize.QueryTypes.SELECT
            }
        );

        for (const business of businesses) {

            await queryInterface.sequelize.query(
                `
                INSERT INTO Branches
                (
                    business_id,
                    name,
                    type,
                    country,
                    city,
                    address,
                    phone,
                    status,
                    createdAt,
                    updatedAt
                )
                VALUES
                (
                    :business_id,
                    :name,
                    'MAIN',
                    'Nicaragua',
                    'Pendiente',
                    NULL,
                    NULL,
                    'ACTIVE',
                    NOW(),
                    NOW()
                )
                `,
                {
                    replacements: {
                        business_id: business.id,
                        name: 'Sucursal Principal'
                    }
                }
            );

        }

        for (const table of tablesWithBranch) {

            await queryInterface.sequelize.query(
                `
                UPDATE ${table} t
                SET branch_id = (
                    SELECT b.id
                    FROM Branches b
                    WHERE b.business_id = t.business_id
                    AND b.type = 'MAIN'
                    LIMIT 1
                )
                WHERE t.branch_id IS NULL
                `
            );

        }

        for (const table of tablesWithBranch) {

            await queryInterface.changeColumn(table, 'branch_id', {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Branches',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            });

        }

    },


    async down(queryInterface, Sequelize) {
        const tablesWithBranch = [
            'Expenses',
            'Inventory_mov',
            'ProductsUnits',
            'Sales',
            'SaleDetails'
        ];

        for (const table of tablesWithBranch) {

            await queryInterface.removeColumn(
                table,
                'branch_id'
            );

        }

        await queryInterface.dropTable('Branches');

        if (queryInterface.sequelize.options.dialect === 'postgres') {

            await queryInterface.sequelize.query(
                `DROP TYPE IF EXISTS "enum_Branches_type";`
            );

        }

    }
};