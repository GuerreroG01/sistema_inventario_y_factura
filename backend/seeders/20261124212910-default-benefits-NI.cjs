
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const businesses = await queryInterface.sequelize.query(
      `SELECT id FROM "Business"`,
      {
        type: Sequelize.QueryTypes.SELECT
      }
    );

    const defaultBenefits = [
      {
        type: "THIRTEENTH_MONTH",
        name: "Decimo Tercer Mes (Aguinaldo)",
        description: "Beneficio laboral anual calculado segun las reglas legales aplicables en Nicaragua.",
        scope: "GLOBAL",
        benefit_mode: "RECURRING",
        frequency: "YEARLY",
        unit: "CURRENCY"
      },
      {
        type: "VACATION",
        name: "Vacaciones Pagadas",
        description: "Acumulacion y liquidacion de vacaciones remuneradas.",
        scope: "GLOBAL",
        benefit_mode: "RECURRING",
        frequency: "MONTHLY",
        unit: "DAYS"
      },
      {
        type: "SEVERANCE",
        name: "Indemnización por antigüedad",
        description: "Indemnización laboral por terminación de la relación de trabajo, calculada según la antigüedad, la causa de terminación y los límites legales aplicables en Nicaragua.",
        scope: "GLOBAL",
        benefit_mode: "ONE_TIME",
        frequency: "ON_DEMAND",
        unit: "CURRENCY"
      }
    ];

    let createdCount = 0;

    for (const business of businesses) {

      for (const benefit of defaultBenefits) {
        const existing = await queryInterface.sequelize.query(
          `SELECT id
           FROM "BenefitRules"
           WHERE business_id = :businessId
           AND type = :type
           AND scope = 'GLOBAL'`,
          {
            replacements: {
              businessId: business.id,
              type: benefit.type
            },
            type: Sequelize.QueryTypes.SELECT
          }
        );

        if (existing.length === 0) {

          await queryInterface.bulkInsert("BenefitRules", [
            {
              business_id: business.id,
              type: benefit.type,
              name: benefit.name,
              description: benefit.description,
              scope: benefit.scope,
              benefit_mode: benefit.benefit_mode,
              frequency: benefit.frequency,
              unit: benefit.unit,
              amount: null,
              formula: null,
              start_date: "2026-01-01",
              end_date: null,
              is_active: true,
              conditions: null,
              created_at: new Date(),
              updated_at: new Date()
            }
          ]);

          createdCount++;

          console.log(
            `Beneficio ${benefit.type} creado para negocio ${business.id}`
          );

        } else {
          console.log(
            `Beneficio ${benefit.type} ya existe para negocio ${business.id}`
          );
        }
      }
    }

    console.log(
      `Seeder finalizado. Total de beneficios creados: ${createdCount}`
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "BenefitRules",
      {
        type: {
          [Sequelize.Op.in]: [
            "THIRTEENTH_MONTH",
            "VACATION",
            "SEVERANCE"
          ]
        },
        scope: "GLOBAL"
      }
    );

    console.log("Beneficios predeterminados eliminados.");
  }
};
