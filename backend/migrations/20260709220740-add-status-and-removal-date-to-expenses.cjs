'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn("Expenses", "status", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "Activo",
    });

    await queryInterface.addColumn("Expenses", "removal_date", {
      type: Sequelize.DATE,
      allowNull: true,
    });

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Expenses", "status");
    await queryInterface.removeColumn("Expenses", "removal_date");
  }
};