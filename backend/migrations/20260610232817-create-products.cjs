'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      barcode: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true,
      },

      category: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      unit: {
        type: Sequelize.STRING,
        defaultValue: 'unit',
      },

      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },

      cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },

      stock: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      entryDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },

      expirationDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },

      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Products');
  },
};