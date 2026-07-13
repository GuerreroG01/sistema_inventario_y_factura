'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  async up(queryInterface, Sequelize) {
    const tables = [
      "User",
      "Products",
      "Sales",
      "SaleDetails",
      "Expenses",
      "Inventory_mov"
    ];

    for (const table of tables) {

      await queryInterface.addColumn(
        table,
        'business_id',
        {
          type: Sequelize.INTEGER,
          allowNull:true,
          references:{
            model:'Business',
            key:'id'
          },
          onUpdate:'CASCADE',
          onDelete:'RESTRICT'
        }
      );

    }
    for (const table of tables) {

      await queryInterface.sequelize.query(`
        UPDATE "${table}"
        SET business_id = 1
      `);

    }
    for (const table of tables) {
      await queryInterface.changeColumn(
        table,
        'business_id',
        {
          type: Sequelize.INTEGER,
          allowNull:false,
          references:{
            model:'Business',
            key:'id'
          },
          onUpdate:'CASCADE',
          onDelete:'RESTRICT'
        }
      )
    }
  },

  async down(queryInterface, Sequelize) {
    const tables = [
      "User",
      "Products",
      "Sales",
      "SaleDetails",
      "Expenses",
      "Inventory_mov"
    ];

    for (const table of tables) {
      await queryInterface.removeColumn(
        table,
        'business_id'
      );
    }
  }
};