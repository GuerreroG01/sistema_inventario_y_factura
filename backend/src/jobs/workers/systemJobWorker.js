
import { claimNextJob, completeJob, failJob, recoverJobs } from "../system/services/systemJobService.js";
import { JOB_TYPES, JOB_DEFAULTS } from "../system/constants/systemJob.js";
import { processBenefitCalculationJob } from "./benefits/processBenefitJob.js";
import { processBenefitIssueReprocessingJob } from "./benefits/processBenefitIssueReprocessingJob.js";

const WORKER_ID = `system-worker-${process.pid}`;

const jobHandlers = {
    [JOB_TYPES.BENEFIT_CALCULATION]: processBenefitCalculationJob,
    [JOB_TYPES.BENEFIT_ISSUE_REPROCESS]: processBenefitIssueReprocessingJob
};

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const processJob = async (job) => {
    console.log(`Processing job: ${job.id}`);
    try {
        const handler = jobHandlers[job.job_type];

        if (!handler) {
            throw new Error(`unsupported_job_type: ${job.job_type}`);
        }

        const result = await handler({
            job,
            worker_id: WORKER_ID
        });

        const completed = await completeJob({
            job_id: job.id,
            worker_id: WORKER_ID
        });

        if (!completed) {
            throw new Error("job_completion_failed");
        }
        console.log("Job completed successfully:", result);
    } catch (error) {
        console.error(
            `Job ${job.id} failed:`,
            error.message
        );
        await failJob({
            job_id: job.id,
            worker_id: WORKER_ID
        });
    }
};

export const startSystemJobWorker = async () => {
    console.log(`System worker started: ${WORKER_ID}`);
    await recoverJobs();
    while (true) {
        try {
            const job = await claimNextJob(WORKER_ID);
            if (!job) {
                await sleep(JOB_DEFAULTS.POLLING_INTERVAL);
                continue;
            }
            await processJob(job);
        } catch (error) {
            console.error("System worker error:", error);
            await sleep(JOB_DEFAULTS.POLLING_INTERVAL);
        }
    }
};