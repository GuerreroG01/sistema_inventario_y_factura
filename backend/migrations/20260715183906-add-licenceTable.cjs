'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Licenses', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      business_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'Business',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      license_key: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },

      type: {
        type: Sequelize.ENUM(
          'SUBSCRIPTION',
          'LIFETIME',
          'TRIAL_PERIOD'
        ),
        allowNull: false,
        defaultValue: 'TRIAL_PERIOD'
      },

      duration: {
        type: Sequelize.INTEGER,
        allowNull: true
      },

      duration_unit: {
        type: Sequelize.ENUM(
          'DAY',
          'MONTH',
          'YEAR'
        ),
        allowNull: true
      },

      status: {
        type: Sequelize.ENUM(
          'ACTIVE',
          'EXPIRED',
          'SUSPENDED'
        ),
        allowNull: false,
        defaultValue: 'ACTIVE'
      },

      activated_at: {
        type: Sequelize.DATE,
        allowNull: true
      },

      expires_at: {
        type: Sequelize.DATE,
        allowNull: true
      },

      grace_period_days: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 5
      },

      last_validation: {
        type: Sequelize.DATE,
        allowNull: true
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Licenses');

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Licenses_type";'
    );

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Licenses_duration_unit";'
    );

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Licenses_status";'
    );
  }
};