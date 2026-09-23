'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();

    const payrollRulesExists = tables.some(
      (table) =>
        table === "PayrollRules" ||
        table.tableName === "PayrollRules"
    );

    if (!payrollRulesExists) {
      await queryInterface.createTable("PayrollRules", {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },

        business_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "Business",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },

        branch_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "Branches",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },

        code: {
          type: Sequelize.STRING,
          allowNull: false,
        },

        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },

        type: {
          type: Sequelize.ENUM(
            "DEDUCTION",
            "EMPLOYER_COST",
            "EARNING"
          ),
          allowNull: false,
        },

        calculation_type: {
          type: Sequelize.ENUM(
            "FIXED",
            "PERCENTAGE",
            "PROGRESSIVE"
          ),
          allowNull: false,
        },

        base_type: {
          type: Sequelize.ENUM(
            "GROSS_SALARY",
            "NET_SALARY",
            "ANNUAL_NET_SALARY",
            "ANNUAL_GROSS_SALARY",
            "CUSTOM"
          ),
          allowNull: true,
        },

        value: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: true,
        },

        percentage: {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: true,
        },

        effective_from: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },

        effective_to: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },

        active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },

        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("NOW"),
        },

        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("NOW"),
        },
      });
    } else {
      const columns = await queryInterface.describeTable("PayrollRules");

      if (!columns.calculation_type) {
        await queryInterface.addColumn(
          "PayrollRules",
          "calculation_type",
          {
            type: Sequelize.ENUM(
              "FIXED",
              "PERCENTAGE",
              "PROGRESSIVE"
            ),
            allowNull: true,
          }
        );
      }

      if (!columns.base_type) {
        await queryInterface.addColumn(
          "PayrollRules",
          "base_type",
          {
            type: Sequelize.ENUM(
              "GROSS_SALARY",
              "NET_SALARY",
              "ANNUAL_NET_SALARY",
              "ANNUAL_GROSS_SALARY",
              "CUSTOM"
            ),
            allowNull: true,
          }
        );
      }

      await queryInterface.sequelize.query(`
        UPDATE "PayrollRules"
        SET "calculation_type" = 'PERCENTAGE'
        WHERE "percentage" IS NOT NULL
          AND ("calculation_type" IS NULL OR "calculation_type" = '');
      `);

      await queryInterface.sequelize.query(`
        UPDATE "PayrollRules"
        SET "calculation_type" = 'FIXED'
        WHERE "value" IS NOT NULL
          AND "percentage" IS NULL
          AND ("calculation_type" IS NULL OR "calculation_type" = '');
      `);

      await queryInterface.sequelize.query(`
        UPDATE "PayrollRules"
        SET "calculation_type" = 'PERCENTAGE'
        WHERE "calculation_type" IS NULL;
      `);

      await queryInterface.sequelize.query(`
        UPDATE "PayrollRules"
        SET "base_type" = 'GROSS_SALARY'
        WHERE "base_type" IS NULL;
      `);

      await queryInterface.changeColumn(
        "PayrollRules",
        "calculation_type",
        {
          type: Sequelize.ENUM(
            "FIXED",
            "PERCENTAGE",
            "PROGRESSIVE"
          ),
          allowNull: false,
        }
      );

      await queryInterface.changeColumn(
        "PayrollRules",
        "base_type",
        {
          type: Sequelize.ENUM(
            "GROSS_SALARY",
            "NET_SALARY",
            "ANNUAL_NET_SALARY",
            "ANNUAL_GROSS_SALARY",
            "CUSTOM"
          ),
          allowNull: false,
        }
      );
    }

    const tablesAfter = await queryInterface.showAllTables();

    const payrollRuleTiersExists = tablesAfter.some(
      (table) =>
        table === "PayrollRuleTiers" ||
        table.tableName === "PayrollRuleTiers"
    );

    if (!payrollRuleTiersExists) {
      await queryInterface.createTable("PayrollRuleTiers", {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },

        payroll_rule_id: {
          type: Sequelize.INTEGER,
          allowNull: false,

          references: {
            model: "PayrollRules",
            key: "id",
          },

          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },

        min_amount: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: false,
        },

        max_amount: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: true,
        },

        fixed_amount: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: false,
          defaultValue: 0,
        },

        percentage: {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: false,
          defaultValue: 0,
        },

        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("NOW"),
        },

        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("NOW"),
        },
      });
    }
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();

    const payrollRuleTiersExists = tables.some(
      (table) =>
        table === "PayrollRuleTiers" ||
        table.tableName === "PayrollRuleTiers"
    );

    if (payrollRuleTiersExists) {
      await queryInterface.dropTable("PayrollRuleTiers");
    }

    const payrollRulesExists = tables.some(
      (table) =>
        table === "PayrollRules" ||
        table.tableName === "PayrollRules"
    );

    if (payrollRulesExists) {
      await queryInterface.dropTable("PayrollRules");
    }
  },
};