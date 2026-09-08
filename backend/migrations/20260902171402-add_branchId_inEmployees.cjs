'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.addColumn(
                'Employees',
                'branch_id',
                {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                },
                { transaction }
            );

            await queryInterface.addColumn(
                'EmployeeEmployments',
                'branch_id',
                {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                },
                { transaction }
            );

            await queryInterface.sequelize.query(`
                UPDATE "Employees" e
                SET "branch_id" = b.id
                FROM "Branches" b
                WHERE b."business_id" = e."business_id"
                  AND b."type" = 'MAIN'
                  AND e."branch_id" IS NULL;
            `, { transaction });

            await queryInterface.sequelize.query(`
                UPDATE "EmployeeEmployments" ee
                SET "branch_id" = e."branch_id"
                FROM "Employees" e
                WHERE ee."employee_id" = e.id
                  AND ee."branch_id" IS NULL;
            `, { transaction });

            const [employeesWithoutBranch] =
                await queryInterface.sequelize.query(`
                    SELECT e.id, e.business_id
                    FROM "Employees" e
                    WHERE e."branch_id" IS NULL;
                `, { transaction });

            if (employeesWithoutBranch.length > 0) {
                throw new Error(
                    `Hay ${employeesWithoutBranch.length} empleados sin sucursal principal.`
                );
            }

            const [employmentsWithoutBranch] =
                await queryInterface.sequelize.query(`
                    SELECT ee.id, ee.employee_id
                    FROM "EmployeeEmployments" ee
                    WHERE ee."branch_id" IS NULL;
                `, { transaction });

            if (employmentsWithoutBranch.length > 0) {
                throw new Error(
                    `Hay ${employmentsWithoutBranch.length} registros EmployeeEmployment sin sucursal.`
                );
            }

            await queryInterface.changeColumn(
                'Employees',
                'branch_id',
                {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                { transaction }
            );

            await queryInterface.changeColumn(
                'EmployeeEmployments',
                'branch_id',
                {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                { transaction }
            );

            await queryInterface.addConstraint(
                'Employees',
                {
                    fields: ['branch_id'],
                    type: 'foreign key',
                    name: 'Employees_branch_id_fkey',
                    references: {
                        table: 'Branches',
                        field: 'id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'RESTRICT',
                    transaction,
                }
            );

            await queryInterface.addConstraint(
                'EmployeeEmployments',
                {
                    fields: ['branch_id'],
                    type: 'foreign key',
                    name: 'EmployeeEmployments_branch_id_fkey',
                    references: {
                        table: 'Branches',
                        field: 'id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'RESTRICT',
                    transaction,
                }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.removeColumn(
                'EmployeeEmployments',
                'branch_id',
                { transaction }
            );

            await queryInterface.removeColumn(
                'Employees',
                'branch_id',
                { transaction }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },
};