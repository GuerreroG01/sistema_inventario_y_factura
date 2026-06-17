"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Sales", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },

      category: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      status: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "PENDING",
      },

      client_id: {
        type: Sequelize.INTEGER,
        allowNull: true,

        // 🔥 opcional si luego activas relación
        // references: {
        //   model: "Clients",
        //   key: "id",
        // },
        // onUpdate: "CASCADE",
        // onDelete: "SET NULL",
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Sales");
  },
};