'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Products', 'type_item', {
      type: Sequelize.ENUM('Producto', 'Servicio'),
      allowNull: false,
      defaultValue: 'Producto'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Products', 'type_item');

    if (queryInterface.sequelize.getDialect() === 'postgres') {
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_Products_type_item";'
      );
    }
  }
};