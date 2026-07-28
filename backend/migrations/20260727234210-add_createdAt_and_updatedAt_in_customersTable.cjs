'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "Customers",
      "createdAt",
      {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      }
    );
    await queryInterface.addColumn(
      "Customers",
      "updatedAt",
      {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      }
    );

  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      "Customers",
      "createdAt"
    );
    await queryInterface.removeColumn(
      "Customers",
      "updatedAt"
    );
  }
};