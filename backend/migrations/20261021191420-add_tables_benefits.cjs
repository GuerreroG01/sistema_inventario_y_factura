"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      const tableExists = async (tableName) => {
        return await queryInterface.tableExists(tableName);
      };

      const addColumnIfMissing = async (tableName, columnName, definition) => {
        const columns = await queryInterface.describeTable(tableName);
        if (!columns[columnName]) {
          await queryInterface.addColumn(tableName, columnName, definition, {
            transaction,
          });
        }
      };

      const ensureIndex = async (tableName, fields, options = {}) => {
        const indexes = await queryInterface.showIndex(tableName);

        const exists = indexes.some((index) => {
          const existingFields = index.fields.map(
            (field) => field.attribute || field.name || field.field
          );

          return (
            existingFields.length === fields.length &&
            fields.every((field, i) => existingFields[i] === field) &&
            (!options.unique || index.unique)
          );
        });

        if (!exists) {
          await queryInterface.addIndex(tableName, fields, {
            ...options,
            transaction,
          });
        }
      };
      if (!(await tableExists("BenefitRules"))) {
        await queryInterface.createTable(
          "BenefitRules",
          {
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
            type: {
              type: Sequelize.ENUM(
                "VACATION",
                "THIRTEENTH_MONTH",
                "SEVERANCE",
                "TRANSPORT",
                "FOOD",
                "OTHER"
              ),
              allowNull: false,
            },
            name: {
              type: Sequelize.STRING(150),
              allowNull: false,
            },
            description: {
              type: Sequelize.STRING(500),
              allowNull: true,
            },
            scope: {
              type: Sequelize.ENUM("GLOBAL", "EMPLOYEE"),
              allowNull: false,
              defaultValue: "GLOBAL",
            },
            benefit_mode: {
              type: Sequelize.ENUM("RECURRING", "ONE_TIME"),
              allowNull: false,
              defaultValue: "RECURRING",
            },
            frequency: {
              type: Sequelize.ENUM(
                "NONE",
                "MONTHLY",
                "BIWEEKLY",
                "YEARLY",
                "ON_DEMAND"
              ),
              allowNull: false,
              defaultValue: "NONE",
            },
            unit: {
              type: Sequelize.ENUM("DAYS", "CURRENCY"),
              allowNull: false,
            },
            amount: {
              type: Sequelize.DECIMAL(12, 2),
              allowNull: true,
            },
            formula: {
              type: Sequelize.STRING(255),
              allowNull: true,
            },
            start_date: {
              type: Sequelize.DATEONLY,
              allowNull: false,
            },
            end_date: {
              type: Sequelize.DATEONLY,
              allowNull: true,
            },
            is_active: {
              type: Sequelize.BOOLEAN,
              allowNull: false,
              defaultValue: true,
            },
            conditions: {
              type: Sequelize.JSON,
              allowNull: true,
            },
            created_at: {
              type: Sequelize.DATE,
              allowNull: false,
            },
            updated_at: {
              type: Sequelize.DATE,
              allowNull: false,
            },
          },
          { transaction }
        );

        await queryInterface.addIndex(
          "BenefitRules",
          ["business_id", "type"],
          {
            name: "benefit_rules_business_type_idx",
            transaction,
          }
        );

        await queryInterface.addIndex(
          "BenefitRules",
          ["business_id", "scope", "is_active"],
          {
            name: "benefit_rules_business_scope_active_idx",
            transaction,
          }
        );
      }

      if (!(await tableExists("EmployeeBenefits"))) {
        await queryInterface.createTable(
          "EmployeeBenefits",
          {
            id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              primaryKey: true,
              allowNull: false,
            },
            employee_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: {
                model: "Employees",
                key: "id",
              },
              onUpdate: "CASCADE",
              onDelete: "RESTRICT",
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
            benefit_rule_id: {
              type: Sequelize.INTEGER,
              allowNull: true,
              references: {
                model: "BenefitRules",
                key: "id",
              },
              onUpdate: "CASCADE",
              onDelete: "SET NULL",
            },
            type: {
              type: Sequelize.ENUM(
                "VACATION",
                "THIRTEENTH_MONTH",
                "SEVERANCE",
                "TRANSPORT",
                "FOOD",
                "OTHER"
              ),
              allowNull: false,
            },
            benefit_mode: {
              type: Sequelize.ENUM("RECURRING", "ONE_TIME"),
              allowNull: false,
              defaultValue: "RECURRING",
            },
            balance: {
              type: Sequelize.DECIMAL(12, 2),
              allowNull: false,
              defaultValue: 0,
            },
            unit: {
              type: Sequelize.ENUM("DAYS", "CURRENCY"),
              allowNull: false,
            },
            status: {
              type: Sequelize.ENUM("ACTIVE", "PAUSED", "CLOSED"),
              allowNull: false,
              defaultValue: "ACTIVE",
            },
            start_date: {
              type: Sequelize.DATEONLY,
              allowNull: true,
            },
            end_date: {
              type: Sequelize.DATEONLY,
              allowNull: true,
            },
            created_at: {
              type: Sequelize.DATE,
              allowNull: false,
            },
            updated_at: {
              type: Sequelize.DATE,
              allowNull: false,
            },
          },
          { transaction }
        );
      } else {
        await addColumnIfMissing("EmployeeBenefits", "benefit_rule_id", {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "BenefitRules",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        });

        await addColumnIfMissing("EmployeeBenefits", "benefit_mode", {
          type: Sequelize.ENUM("RECURRING", "ONE_TIME"),
          allowNull: false,
          defaultValue: "RECURRING",
        });

        await addColumnIfMissing("EmployeeBenefits", "status", {
          type: Sequelize.ENUM("ACTIVE", "PAUSED", "CLOSED"),
          allowNull: false,
          defaultValue: "ACTIVE",
        });

        await addColumnIfMissing("EmployeeBenefits", "start_date", {
          type: Sequelize.DATEONLY,
          allowNull: true,
        });

        await addColumnIfMissing("EmployeeBenefits", "end_date", {
          type: Sequelize.DATEONLY,
          allowNull: true,
        });
      }

      await ensureIndex(
        "EmployeeBenefits",
        ["employee_id", "type", "status"],
        {
          name: "employee_benefits_employee_type_status_idx",
        }
      );

      await ensureIndex(
        "EmployeeBenefits",
        ["business_id", "employee_id"],
        {
          name: "employee_benefits_business_employee_idx",
        }
      );

      await ensureIndex(
        "EmployeeBenefits",
        ["benefit_rule_id"],
        {
          name: "employee_benefits_rule_idx",
        }
      );

      if (!(await tableExists("BenefitTransactions"))) {
        await queryInterface.createTable(
          "BenefitTransactions",
          {
            id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              primaryKey: true,
              allowNull: false,
            },
            employee_benefit_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: {
                model: "EmployeeBenefits",
                key: "id",
              },
              onUpdate: "CASCADE",
              onDelete: "RESTRICT",
            },
            transaction_type: {
              type: Sequelize.ENUM(
                "ACCRUAL",
                "USAGE",
                "PAYMENT",
                "ADJUSTMENT",
                "REVERSAL"
              ),
              allowNull: false,
            },
            amount: {
              type: Sequelize.DECIMAL(12, 2),
              allowNull: false,
            },
            balance_before: {
              type: Sequelize.DECIMAL(12, 2),
              allowNull: false,
            },
            balance_after: {
              type: Sequelize.DECIMAL(12, 2),
              allowNull: false,
            },
            date: {
              type: Sequelize.DATEONLY,
              allowNull: false,
            },
            reference_type: {
              type: Sequelize.STRING(50),
              allowNull: true,
            },
            reference_id: {
              type: Sequelize.INTEGER,
              allowNull: true,
            },
            idempotency_key: {
              type: Sequelize.STRING(150),
              allowNull: true,
            },
            reverses_transaction_id: {
              type: Sequelize.INTEGER,
              allowNull: true,
              references: {
                model: "BenefitTransactions",
                key: "id",
              },
              onUpdate: "CASCADE",
              onDelete: "RESTRICT",
            },
            description: {
              type: Sequelize.STRING(500),
              allowNull: true,
            },
            created_by: {
              type: Sequelize.INTEGER,
              allowNull: true,
            },
            created_at: {
              type: Sequelize.DATE,
              allowNull: false,
            },
            updated_at: {
              type: Sequelize.DATE,
              allowNull: false,
            },
          },
          { transaction }
        );
      } else {
        await addColumnIfMissing("BenefitTransactions", "idempotency_key", {
          type: Sequelize.STRING(150),
          allowNull: true,
        });

        await addColumnIfMissing(
          "BenefitTransactions",
          "reverses_transaction_id",
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: "BenefitTransactions",
              key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
          }
        );
      }

      await ensureIndex(
        "BenefitTransactions",
        ["idempotency_key"],
        {
          name: "benefit_transactions_idempotency_key_uq",
          unique: true,
        }
      );

      await ensureIndex(
        "BenefitTransactions",
        ["employee_benefit_id", "date"],
        {
          name: "benefit_transactions_benefit_date_idx",
        }
      );

      await ensureIndex(
        "BenefitTransactions",
        ["reference_type", "reference_id"],
        {
          name: "benefit_transactions_reference_idx",
        }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.dropTable("BenefitTransactions", { transaction });
      await queryInterface.dropTable("EmployeeBenefits", { transaction });
      await queryInterface.dropTable("BenefitRules", { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};