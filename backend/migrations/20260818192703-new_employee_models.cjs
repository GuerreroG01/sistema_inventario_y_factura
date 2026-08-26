'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('Employees', {

      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      business_id: {
        type: Sequelize.INTEGER,
        allowNull: false,

        references: {
          model: 'Business',
          key: 'id'
        },

        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },

      employee_code: {
        type: Sequelize.STRING,
        allowNull: false
      },

      first_name: {
        type: Sequelize.STRING,
        allowNull: false
      },

      last_name: {
        type: Sequelize.STRING,
        allowNull: false
      },

      identification: {
        type: Sequelize.STRING,
        allowNull: false
      },

      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },

      email: {
        type: Sequelize.STRING,
        allowNull: true
      },

      address: {
        type: Sequelize.STRING,
        allowNull: true
      },

      position: {
        type: Sequelize.STRING,
        allowNull: true
      },

      department: {
        type: Sequelize.STRING,
        allowNull: true
      },

      hire_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },

      termination_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },

      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'ACTIVE'
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

    await queryInterface.createTable('EmployeeEmployments', {

      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,

        references: {
          model: 'Employees',
          key: 'id'
        },

        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },

      position: {
        type: Sequelize.STRING,
        allowNull: false
      },

      department: {
        type: Sequelize.STRING,
        allowNull: true
      },

      employment_type: {
        type: Sequelize.ENUM(
          'FULL_TIME',
          'PART_TIME',
          'TEMPORARY',
          'CONTRACTOR'
        ),
        allowNull: false,
        defaultValue: 'FULL_TIME'
      },

      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },

      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },

      status: {
        type: Sequelize.ENUM(
          'ACTIVE',
          'INACTIVE',
          'ENDED'
        ),
        allowNull: false,
        defaultValue: 'ACTIVE'
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

    await queryInterface.createTable('EmployeeSalaryHistories', {

      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,

        references: {
          model: 'Employees',
          key: 'id'
        },

        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },

      salary: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },

      salary_type: {
        type: Sequelize.ENUM(
          'MONTHLY',
          'WEEKLY',
          'DAILY',
          'HOURLY'
        ),
        allowNull: false,
        defaultValue: 'MONTHLY'
      },

      effective_from: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },

      effective_to: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },

      reason: {
        type: Sequelize.STRING,
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

    await queryInterface.dropTable('EmployeeSalaryHistories');

    await queryInterface.dropTable('EmployeeEmployments');

    await queryInterface.dropTable('Employees');

  }

};