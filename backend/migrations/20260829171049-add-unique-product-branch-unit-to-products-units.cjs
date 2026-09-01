'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('ProductsUnits', {
      fields: ['product_id', 'branch_id', 'unit'],
      unique: true,
      name: 'unique_product_branch_unit',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      'ProductsUnits',
      'unique_product_branch_unit'
    );
  },
};