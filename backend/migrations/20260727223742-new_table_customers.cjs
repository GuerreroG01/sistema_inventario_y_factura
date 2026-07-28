'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('Customers', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },

      email: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      address: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      identification: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      credit_limit: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false,
        defaultValue: 0,
      },

      balance: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false,
        defaultValue: 0,
      },

      status: {
        type: Sequelize.ENUM(
          "ACTIVE",
          "INACTIVE"
        ),
        defaultValue: "ACTIVE",
      },

      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      business_id: {
        type: Sequelize.INTEGER,
        allowNull:false,
        references:{
          model:"Business",
          key:"id"
        },
        onUpdate:"CASCADE",
        onDelete:"RESTRICT"
      },

      createdAt:{
        type: Sequelize.DATE,
        allowNull:false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      updatedAt:{
        type: Sequelize.DATE,
        allowNull:false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }

    });

    await queryInterface.addConstraint('Sales',{
      fields:['client_id'],
      type:'foreign key',
      name:'sales_customer_fk',
      references:{
        table:'Customers',
        field:'id'
      },
      onUpdate:'CASCADE',
      onDelete:'SET NULL'
    });

    await queryInterface.addColumn('Sales','payment_type',{
      type: Sequelize.ENUM(
        "CASH",
        "CREDIT",
        "CARD",
        "TRANSFER"
      ),
      allowNull:false,
      defaultValue:"CASH"
    });

  },


  async down(queryInterface, Sequelize) {

    await queryInterface.removeColumn(
      'Sales',
      'payment_type'
    );

    await queryInterface.removeConstraint(
      'Sales',
      'sales_customer_fk'
    );

    await queryInterface.dropTable('Customers');

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Sales_payment_type";'
    );

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Customers_status";'
    );
  }
};