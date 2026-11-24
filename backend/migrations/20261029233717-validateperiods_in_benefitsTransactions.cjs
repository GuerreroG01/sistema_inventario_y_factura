'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'BenefitTransactions',
      'period_start_date',
      {
        type: Sequelize.DATEONLY,
        allowNull: true,
      }
    );

    await queryInterface.addColumn(
      'BenefitTransactions',
      'period_end_date',
      {
        type: Sequelize.DATEONLY,
        allowNull: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'BenefitTransactions',
      'period_end_date'
    );

    await queryInterface.removeColumn(
      'BenefitTransactions',
      'period_start_date'
    );
  }
};