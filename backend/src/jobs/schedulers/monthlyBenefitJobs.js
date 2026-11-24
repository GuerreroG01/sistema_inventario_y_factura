import cron from "node-cron";
import { scheduleMonthlyBenefitJobs } from "./scheduleMonthlyBenefitJobs.js"; // ajusta la ruta

cron.schedule(
    "00 12 * * *", // Todos los días a las 12:00 MD si esta en producción si es local puede ser 09:00 AM
    async () => {
        const startTime = new Date();
        console.log(`[${startTime.toISOString()}] Iniciando programación de jobs de beneficios mensuales`);

        try {
            await scheduleMonthlyBenefitJobs();

            const endTime = new Date();
            console.log(
                `[${endTime.toISOString()}] Jobs de beneficios programados. Tiempo: ${endTime - startTime}ms`
            );
        } catch (error) {
            console.error(`[${new Date().toISOString()}] Error programando jobs de beneficios:`, error);
        }
    },
    {
        timezone: "America/Managua"
    }
);