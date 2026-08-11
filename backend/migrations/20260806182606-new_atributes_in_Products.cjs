'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Products', 'hasPromotion', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('Products', 'promotionPrice', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
    await queryInterface.addColumn('Products', 'promotionStart', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('Products', 'promotionEnd', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Products', 'hasPromotion');
    await queryInterface.removeColumn('Products', 'promotionPrice');
    await queryInterface.removeColumn('Products', 'promotionStart');
    await queryInterface.removeColumn('Products', 'promotionEnd');
  }
};