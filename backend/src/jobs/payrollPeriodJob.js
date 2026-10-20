import cron from "node-cron";
import Business from "../models/Business.js";
import { ensureCurrentPayrollPeriod } from "../services/Worksheet/Payroll/PayrollPeriodService.js";

export const runPayrollPeriodJob = async () => {
    console.log("Iniciando job de períodos de nómina...");

    const businesses = await Business.findAll({
        where: {
            status: "ACTIVE",
        },
        attributes: ["id", "name"],
    });

    for (const business of businesses) {
        try {
            console.log(`Procesando períodos de nómina para ${business.name} (${business.id})`);

            const result = await ensureCurrentPayrollPeriod(business.id);

            if (result.created) {
                console.log(`Período creado para ${business.name}:`, result.period.id);
            } else {
                console.log(`El período ya existe para ${business.name}:`, result.period.id);
            }
        } catch (error) {
            console.error(`Error procesando nómina para ${business.name} (${business.id}):`, error.message);
        }
    }

    console.log("Job de períodos de nómina finalizado.");
};

cron.schedule(
    "00 16 * * *",
    async () => {
        const startTime = new Date();

        try {
            await runPayrollPeriodJob();

            const endTime = new Date();
            console.log(`[${endTime.toISOString()}] Job de nómina completado en ${endTime - startTime}ms`);
        } catch (error) {
            console.error(`[${new Date().toISOString()}] Error ejecutando job de nómina:`, error.message);
        }
    },
    {
        timezone: "America/Managua",
    }
);