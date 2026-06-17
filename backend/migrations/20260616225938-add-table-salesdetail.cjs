'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('SaleDetails', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      sale_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Sales',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Products',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },

      descripcion: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      precio_unitario: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },

      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },

      tipo_item: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('SaleDetails');
  }
};