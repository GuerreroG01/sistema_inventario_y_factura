'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.removeConstraint(
      'Licenses',
      'Licenses_business_id_key'
    );

  },

  async down(queryInterface, Sequelize) {

    await queryInterface.addConstraint(
      'Licenses',
      {
        fields: ['business_id'],
        type: 'unique',
        name: 'Licenses_business_id_key'
      }
    );

  }
};