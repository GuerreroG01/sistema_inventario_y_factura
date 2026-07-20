'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Licenses_status"
      ADD VALUE IF NOT EXISTS 'PENDING';
    `);
  },

  async down(queryInterface, Sequelize) {
  }
};