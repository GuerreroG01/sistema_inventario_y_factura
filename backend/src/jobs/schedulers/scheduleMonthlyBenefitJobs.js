import Business from "../../models/Business.js";
import SystemJob from "../../models/SystemJob.js";
import { createJob } from "../system/services/systemJobService.js";
import { JOB_TYPES, BENEFIT_TYPES, JOB_STATUS } from "../system/constants/systemJob.js";
import { Op, literal } from "sequelize";

export const scheduleMonthlyBenefitJobs = async () => {

    const now = new Date();
    const day = now.getDate();

    // Ejecutar solamente durante los primeros 7 días del mes
    if (day > 30) {
        console.log("Fuera de la ventana de los primeros 7 días del mes");
        return {
            created: 0,
            skipped: 0,
        };
    }

    const calculationDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
    ).toISOString().split("T")[0];

    const businesses = await Business.findAll({
        where: {
            status: "ACTIVE",
        },
        attributes: ["id"],
        raw: true,
    });

    let createdCount = 0;
    let skippedCount = 0;

    for (const business of businesses) {
        for (const benefitType of Object.values(BENEFIT_TYPES)) {
            const existing = await SystemJob.findOne({
                where: {
                    business_id: business.id,
                    job_type: JOB_TYPES.BENEFIT_CALCULATION,
                    job_category: "monthly_benefits",
                    [Op.and]: [
                        literal(
                            `payload->>'benefit_type' = '${benefitType}'`
                        ),
                        literal(
                            `payload->>'calculation_date' = '${calculationDate}'`
                        ),
                    ],
                },
                attributes: ["id"],
                raw: true,
            });

            if (existing) {
                skippedCount++;
                continue;
            }

            await createJob({
                business_id: business.id,
                job_type: JOB_TYPES.BENEFIT_CALCULATION,
                job_category: "monthly_benefits",
                payload: {
                    benefit_type: benefitType,
                    calculation_date: calculationDate,
                },
            });
            createdCount++;
        }
    }
    console.log(
        `Jobs mensuales programados: ${createdCount} creados, ${skippedCount} omitidos para ${businesses.length} empresas`
    );
    return {
        created: createdCount,
        skipped: skippedCount,
        businesses: businesses.length,
    };
};
/*Hay que comprobar si es capaz de ejecutarse cada mes los calculos por lotes, ya se comprobo que si se
ejecuta una vez al mes según los 7 dias para que haga las operaciones por lotes, pero hay que verfificar
si realmente lo hace periodicamente cada mes o si se da el caso que como ya estan completados en el siguiente
mes lo va ignorar como que fueran de una sola vez */