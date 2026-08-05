'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  async up (queryInterface, Sequelize) {

    await queryInterface.createTable('CustomerMarketing', {

      id:{
        type: Sequelize.INTEGER,
        autoIncrement:true,
        primaryKey:true,
        allowNull:false
      },

      customer_id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        unique:true,
        references:{
          model:'Customers',
          key:'id'
        },
        onUpdate:'CASCADE',
        onDelete:'CASCADE'
      },

      business_id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        references:{
          model:'Business',
          key:'id'
        },
        onUpdate:'CASCADE',
        onDelete:'RESTRICT'
      },

      marketing_opt_in:{
        type:Sequelize.BOOLEAN,
        allowNull:false,
        defaultValue:false
      },

      last_marketing_sent_at:{
        type:Sequelize.DATE,
        allowNull:true
      },

      marketing_sent_count:{
        type:Sequelize.INTEGER,
        allowNull:false,
        defaultValue:0
      },

      marketing_disabled:{
        type:Sequelize.BOOLEAN,
        allowNull:false,
        defaultValue:false
      },

      marketing_disabled_reason:{
        type:Sequelize.STRING,
        allowNull:true
      },

      last_purchase_at:{
        type:Sequelize.DATE,
        allowNull:true
      },

      next_marketing_at:{
        type:Sequelize.DATE,
        allowNull:true
      },

      createdAt:{
        type:Sequelize.DATE,
        allowNull:false,
        defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')
      },

      updatedAt:{
        type:Sequelize.DATE,
        allowNull:false,
        defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')
      }

    });

  },

  async down (queryInterface, Sequelize) {

    await queryInterface.dropTable('CustomerMarketing');

  }
};