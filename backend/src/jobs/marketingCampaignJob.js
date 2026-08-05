import cron from "node-cron";
import { generateMarketingCampaign, registerMarketingSent } from "../services/marketingService.js";
import Business from "../models/Business.js";
import { emailService } from "../services/email/EmailServices.js";

export const runMarketingCampaignJob = async () => {
    try {
        console.log("Iniciando job de marketing...");

        const businesses = await Business.findAll({
            where: {
                status: "ACTIVE"
            },
            attributes: ["id", "name"]
        });

        for (const business of businesses) {
            console.log(`Procesando negocio ${business.id}`);

            const campaign = await generateMarketingCampaign(
                business.id
            );
            console.dir(campaign, { depth: null });

            if (!campaign.length) {
                console.log(
                    `Sin clientes para campaña en negocio ${business.id}`
                );
                continue;
            }

            for(const customer of campaign){
                await emailService.sendMarketingCampaign({
                    customer,
                    businessName:
                        business.name
                });

                await registerMarketingSent(
                    customer.customerId,
                    business.id
                );
            }
        }
        console.log("Job de marketing finalizado.");
    } catch (error) {
        console.error(
            "Error ejecutando job de marketing:",
            error.message
        );
    }
};

cron.schedule(
    "00 09 * * *",
    async () => {
        const startTime = new Date();

        try {
            await runMarketingCampaignJob();

            const endTime = new Date();
            console.log(
                `[${endTime.toISOString()}] Job completado en ${
                    endTime - startTime
                }ms`
            );
        } catch (error) {
            console.error(
                `[${new Date().toISOString()}] Error ejecutando job de marketing`
            );
            console.error(error);
        }
    },
    {
        timezone: "America/Managua"
    }
);