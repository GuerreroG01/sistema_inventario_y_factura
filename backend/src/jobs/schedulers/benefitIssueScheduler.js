
import cron from "node-cron";
import BenefitProcessingIssue from "../../models/BenefitProcessingIssue.js";
import { resolveBenefitProcessingIssues } from "../system/services/benefitProcessingIssueService.js";
import { scheduleBenefitIssueJobs } from "../system/services/benefitIssueSchedulerService.js";
console.log("[BENEFIT ISSUE SCHEDULER] Archivo cargado correctamente");
cron.schedule(
    "0 * * * *",
    async () => {

        const startTime = new Date();

        console.log(
            `[${startTime.toISOString()}] Iniciando revisión de incidencias de beneficios`
        );

        try {
            const pendingEmployees = await BenefitProcessingIssue.findAll({
                attributes: [
                    "business_id",
                    "employee_id"
                ],
                where: {
                    status: "PENDING"
                },
                group: [
                    "business_id",
                    "employee_id"
                ],
                order: [
                    ["business_id", "ASC"],
                    ["employee_id", "ASC"]
                ],
                limit: 500
            });

            let totalReady = 0;

            for (const employee of pendingEmployees) {

                try {

                    const result = await resolveBenefitProcessingIssues({
                        business_id: employee.business_id,
                        employee_id: employee.employee_id
                    });

                    totalReady += result.total_ready;

                } catch (error) {
                    console.error(
                        "[BENEFIT ISSUE RESOLUTION ERROR]",
                        {
                            business_id: employee.business_id,
                            employee_id: employee.employee_id,
                            error: error.message
                        }
                    );
                }
            }

            const scheduled = await scheduleBenefitIssueJobs({
                max_issues: 500
            });
            console.log(
                `[${new Date().toISOString()}] Revisión finalizada. Tiempo: ${Date.now() - startTime.getTime()}ms`
            );

        } catch (error) {

            console.error(
                "[BENEFIT ISSUE SCHEDULER ERROR]",
                error
            );
        }

    },
    {
        timezone: "America/Managua"
    }
);