'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {

    async up(queryInterface, Sequelize) {
        const tables = await queryInterface.showAllTables();
        const branchesTableExists = tables.some(
            table => table === 'Branches'
        );
        if (!branchesTableExists) {
            console.log('[MIGRATION] Creando tabla Branches...');

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

        } else {
            console.log('[MIGRATION] Branches ya existe. Se omite creación.');
        }
        const tablesWithBranch = [
            'Expenses',
            'Inventory_mov',
            'ProductsUnits',
            'Sales',
            'SaleDetails'
        ];

        for (const table of tablesWithBranch) {

            console.log(
                `[MIGRATION] Asignando sucursales en ${table}...`
            );
            if (
                table === 'Expenses' ||
                table === 'Inventory_mov' ||
                table === 'Sales' || table === 'SaleDetails'
            ) {

                await queryInterface.sequelize.query(
                    `
                    UPDATE "${table}" t
                    SET branch_id = (
                        SELECT b.id
                        FROM "Branches" b
                        WHERE b.business_id = t.business_id
                        AND b.type = 'MAIN'
                        LIMIT 1
                    )
                    WHERE t.branch_id IS NULL
                    `
                );

                continue;
            }

            if (table === 'ProductsUnits') {

                await queryInterface.sequelize.query(
                    `
                    UPDATE "ProductsUnits" pu
                    SET branch_id = (
                        SELECT b.id
                        FROM "Branches" b
                        INNER JOIN "Products" p
                            ON p.business_id = b.business_id
                        WHERE p.id = pu.product_id
                        AND b.type = 'MAIN'
                        LIMIT 1
                    )
                    WHERE pu.branch_id IS NULL
                    `
                );
                continue;
            }
        }

        const businesses = await queryInterface.sequelize.query(
            `SELECT id, name FROM "Business"`,
            {
                type: Sequelize.QueryTypes.SELECT
            }
        );

        for (const business of businesses) {
            const [existingBranch] =
                await queryInterface.sequelize.query(
                    `
                    SELECT id
                    FROM "Branches"
                    WHERE business_id = :business_id
                    AND type = 'MAIN'
                    LIMIT 1
                    `,
                    {
                        replacements: {
                            business_id: business.id
                        },
                        type: Sequelize.QueryTypes.SELECT
                    }
                );
            if (!existingBranch) {
                console.log(
                    `[MIGRATION] Creando sucursal principal para Business ${business.id}...`
                );

                await queryInterface.sequelize.query(
                    `
                    INSERT INTO "Branches"
                    (
                        business_id,
                        name,
                        type,
                        country,
                        city,
                        address,
                        phone,
                        status,
                        "createdAt",
                        "updatedAt"
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
            } else {
                console.log(
                    `[MIGRATION] Business ${business.id} ya tiene sucursal principal.`
                );
            }

        }
        for (const table of tablesWithBranch) {            console.log(
                `[MIGRATION] Asignando sucursales en ${table}...`
            );

            await queryInterface.sequelize.query(
                `
                UPDATE "${table}" t
                SET branch_id = (
                    SELECT b.id
                    FROM "Branches" b
                    WHERE b.business_id = t.business_id
                    AND b.type = 'MAIN'
                    LIMIT 1
                )
                WHERE t.branch_id IS NULL
                `
            );

        }

        for (const table of tablesWithBranch) {
            const columns = await queryInterface.describeTable(table);
            if (!columns.branch_id) {
                console.log(
                    `[MIGRATION] ERROR: ${table}.branch_id no existe.`
                );
                continue;
            }
            console.log(
                `[MIGRATION] Configurando ${table}.branch_id...`
            );

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
        console.log('[MIGRATION] new_table_branch completada.');
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
            const columns = await queryInterface.describeTable(table);
            if (columns.branch_id) {

                await queryInterface.removeColumn(
                    table,
                    'branch_id'
                );

            }

        }

        const tables = await queryInterface.showAllTables();

        const branchesTableExists = tables.some(
            table => table === 'Branches'
        );

        if (branchesTableExists) {

            await queryInterface.dropTable('Branches');

        }
        if (queryInterface.sequelize.options.dialect === 'postgres') {

            await queryInterface.sequelize.query(
                `DROP TYPE IF EXISTS "enum_Branches_type";`
            );

        }

    }
};