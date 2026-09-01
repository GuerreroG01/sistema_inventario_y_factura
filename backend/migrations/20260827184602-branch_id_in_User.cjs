'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {

    async up(queryInterface, Sequelize) {

        await queryInterface.addColumn('User', 'branch_id', {
            type: Sequelize.INTEGER,
            allowNull: true
        });

        await queryInterface.sequelize.query(`
            UPDATE "User" u
            SET branch_id = (
                SELECT b.id
                FROM "Branches" b
                WHERE b.business_id = u.business_id
                  AND b.type = 'MAIN'
                ORDER BY b.id ASC
                LIMIT 1
            )
            WHERE u.branch_id IS NULL
        `);

        const usersWithoutBranch = await queryInterface.sequelize.query(
            `
            SELECT COUNT(*)::integer AS count
            FROM "User"
            WHERE branch_id IS NULL
            `,
            {
                type: Sequelize.QueryTypes.SELECT
            }
        );

        if (usersWithoutBranch[0].count > 0) {
            throw new Error(
                `No se puede continuar: existen ${usersWithoutBranch[0].count} usuarios sin branch_id.`
            );
        }
        await queryInterface.changeColumn('User', 'branch_id', {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Branches',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        });

    },


    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn(
            'User',
            'branch_id'
        );

    }

};
