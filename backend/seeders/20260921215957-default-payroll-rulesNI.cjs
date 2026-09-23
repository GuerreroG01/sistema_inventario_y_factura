'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      const businesses = await queryInterface.sequelize.query(
        `
          SELECT id
          FROM "Business"
          ORDER BY id
        `,
        {
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        }
      );

      if (businesses.length === 0) {
        console.log('No existen negocios para crear reglas de nómina.');
        await transaction.commit();
        return;
      }

      console.log(`Procesando reglas de nómina para ${businesses.length} negocio(s)...`);

      for (const business of businesses) {
        const businessId = business.id;

        console.log(`\nProcesando Business ${businessId}...`);

        let existingIR = await queryInterface.sequelize.query(
          `
            SELECT id
            FROM "PayrollRules"
            WHERE business_id = :businessId
              AND code = 'IR'
            LIMIT 1
          `,
          {
            replacements: { businessId },
            type: Sequelize.QueryTypes.SELECT,
            transaction,
          }
        );

        let irRuleId;

        if (existingIR.length === 0) {
          const now = new Date();

          await queryInterface.bulkInsert(
            'PayrollRules',
            [
              {
                business_id: businessId,
                branch_id: null,
                code: 'IR',
                name: 'Impuesto sobre la Renta',
                type: 'DEDUCTION',
                calculation_type: 'PROGRESSIVE',
                base_type: 'ANNUAL_GROSS_SALARY',
                value: null,
                percentage: null,
                effective_from: '2026-09-16',
                effective_to: null,
                active: true,
                createdAt: now,
                updatedAt: now,
              },
            ],
            { transaction }
          );

          existingIR = await queryInterface.sequelize.query(
            `
              SELECT id
              FROM "PayrollRules"
              WHERE business_id = :businessId
                AND code = 'IR'
              LIMIT 1
            `,
            {
              replacements: { businessId },
              type: Sequelize.QueryTypes.SELECT,
              transaction,
            }
          );

          irRuleId = existingIR[0].id;

          console.log(`IR creada. ID: ${irRuleId}`);
        } else {
          irRuleId = existingIR[0].id;
          console.log(`IR ya existe. ID: ${irRuleId}`);
        }
        const existingIRTiers = await queryInterface.sequelize.query(
          `
            SELECT id
            FROM "PayrollRuleTiers"
            WHERE payroll_rule_id = :payrollRuleId
            LIMIT 1
          `,
          {
            replacements: { payrollRuleId: irRuleId },
            type: Sequelize.QueryTypes.SELECT,
            transaction,
          }
        );

        if (existingIRTiers.length === 0) {
          const now = new Date();

          await queryInterface.bulkInsert(
            'PayrollRuleTiers',
            [
              {
                payroll_rule_id: irRuleId,
                min_amount: 100000.01,
                max_amount: 200000.00,
                fixed_amount: 0.00,
                percentage: 15.00,
                createdAt: now,
                updatedAt: now,
              },
              {
                payroll_rule_id: irRuleId,
                min_amount: 200000.01,
                max_amount: 350000.00,
                fixed_amount: 15000.00,
                percentage: 20.00,
                createdAt: now,
                updatedAt: now,
              },
              {
                payroll_rule_id: irRuleId,
                min_amount: 350000.01,
                max_amount: 500000.00,
                fixed_amount: 45000.00,
                percentage: 25.00,
                createdAt: now,
                updatedAt: now,
              },
              {
                payroll_rule_id: irRuleId,
                min_amount: 500000.01,
                max_amount: null,
                fixed_amount: 82500.00,
                percentage: 30.00,
                createdAt: now,
                updatedAt: now,
              },
            ],
            { transaction }
          );

          console.log('4 tiers de IR creados.');
        } else {
          console.log('Los tiers de IR ya existen.');
        }

        const existingINSSLaboral = await queryInterface.sequelize.query(
          `
            SELECT id
            FROM "PayrollRules"
            WHERE business_id = :businessId
              AND code = 'INSS_LABORAL'
            LIMIT 1
          `,
          {
            replacements: { businessId },
            type: Sequelize.QueryTypes.SELECT,
            transaction,
          }
        );

        if (existingINSSLaboral.length === 0) {
          const now = new Date();

          await queryInterface.bulkInsert(
            'PayrollRules',
            [
              {
                business_id: businessId,
                branch_id: null,
                code: 'INSS_LABORAL',
                name: 'INSS Laboral',
                type: 'DEDUCTION',
                calculation_type: 'PERCENTAGE',
                base_type: 'GROSS_SALARY',
                value: null,
                percentage: 7.00,
                effective_from: '2026-09-15',
                effective_to: null,
                active: true,
                createdAt: now,
                updatedAt: now,
              },
            ],
            { transaction }
          );

          console.log('INSS_LABORAL creada.');
        } else {
          console.log('INSS_LABORAL ya existe.');
        }
        const existingINSSPatronal = await queryInterface.sequelize.query(
          `
            SELECT id
            FROM "PayrollRules"
            WHERE business_id = :businessId
              AND code = 'INSS_PATRONAL'
            LIMIT 1
          `,
          {
            replacements: { businessId },
            type: Sequelize.QueryTypes.SELECT,
            transaction,
          }
        );

        if (existingINSSPatronal.length === 0) {
          const now = new Date();

          await queryInterface.bulkInsert(
            'PayrollRules',
            [
              {
                business_id: businessId,
                branch_id: null,
                code: 'INSS_PATRONAL',
                name: 'INSS Patronal',
                type: 'EMPLOYER_COST',
                calculation_type: 'PERCENTAGE',
                base_type: 'GROSS_SALARY',
                value: null,
                percentage: 21.50,
                effective_from: '2026-09-15',
                effective_to: null,
                active: true,
                createdAt: now,
                updatedAt: now,
              },
            ],
            { transaction }
          );

          console.log('INSS_PATRONAL creada.');
        } else {
          console.log('INSS_PATRONAL ya existe.');
        }

        console.log(`Business ${businessId} procesado correctamente.`);
      }

      await transaction.commit();

      console.log('Reglas de nómina predeterminadas creadas.');
    } catch (error) {
      await transaction.rollback();

      console.error('\nError creando las reglas de nómina:');
      console.error(error);

      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      const rules = await queryInterface.sequelize.query(
        `
          SELECT id
          FROM "PayrollRules"
          WHERE code IN (
            'IR',
            'INSS_LABORAL',
            'INSS_PATRONAL'
          )
        `,
        {
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        }
      );

      for (const rule of rules) {
        await queryInterface.bulkDelete(
          'PayrollRuleTiers',
          { payroll_rule_id: rule.id },
          { transaction }
        );
      }

      await queryInterface.bulkDelete(
        'PayrollRules',
        {
          code: [
            'IR',
            'INSS_LABORAL',
            'INSS_PATRONAL',
          ],
        },
        { transaction }
      );

      await transaction.commit();

      console.log('Reglas de nómina predeterminadas eliminadas correctamente.');
    } catch (error) {
      await transaction.rollback();

      console.error('Error eliminando las reglas de nómina:', error);

      throw error;
    }
  },
};