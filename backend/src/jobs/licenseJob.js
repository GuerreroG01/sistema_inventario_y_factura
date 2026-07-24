import cron from "node-cron";
import { processExpiredLicenses } from "../services/license/LicenseService.js";
import { cacheService, CacheKeys } from "../services/cache/index.js";
import { emailService } from "../services/email/EmailServices.js";

cron.schedule(
    "10 10 * * *",
    async () => {
        const startTime = new Date();
        try {
            const results = await processExpiredLicenses();

            if (results.length > 0) {
                const licensesToSend = [];

                for (const [index, result] of results.entries()) {
                    if (result.license_id) {
                        licensesToSend.push({
                            business_id: result.business_id,
                            business_name: result.business_name,
                            license_id: result.license_id,
                            license_key: result.license_key,
                            expiration_date: result.expiration_date
                        });
                        await cacheService.del(
                            CacheKeys.HAS_PENDING_LICENSE,
                            result.business_id
                        );
                    }
                }

                if (licensesToSend.length > 0) {
                    await emailService.sendLicenseEmail({
                        developerEmail: "guerrerog675@gmail.com",
                        licenses: licensesToSend
                    });
                    console.log(
                        `[${new Date().toISOString()}] Correo enviado con ${licensesToSend.length} licencia(s)`
                    );

                } else {
                    console.log("No se generaron nuevas licencias para enviar.");
                }
            } else {
                console.log("No se encontraron licencias para procesar.");
            }
            const endTime = new Date();
            const executionTime = endTime - startTime;

            console.log(`[${endTime.toISOString()}] Tiempo de ejecución: ${executionTime}ms`);
        } catch (error) {
            console.error(`[${new Date().toISOString()}] Error ejecutando job`);
            console.error(error);
        }
    },
    {
        timezone: "America/Managua"
    }
);