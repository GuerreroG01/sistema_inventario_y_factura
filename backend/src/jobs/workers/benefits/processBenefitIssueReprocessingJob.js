
import sequelize from "../../../config/database.js";
import BenefitProcessingIssue from "../../../models/BenefitProcessingIssue.js";
import { isBenefitCalculationWarning } from "../../../constants/benefitCalculationWarnings.js";
import { registerBenefitProcessingIssue } from "../../system/services/systemJobService.js";
import { registerJobError } from "../../system/services/systemJobErrorService.js";
import { calculateBenefit } from "./processBenefitJob.js";
const ISSUE_JOB_TYPE = "BENEFIT_ISSUE_REPROCESS";

export const processBenefitIssueReprocessingJob = async ({ job }) => {
    const { business_id, id: job_id, attempt_number } = job;
    const payload = job.payload || {};
    const { benefit_type, period, issue_ids, processing_mode } = payload;

    const now = new Date();
    const calculationDate = now.toISOString().split("T")[0];

    if (job.job_type !== ISSUE_JOB_TYPE) {
        throw new Error("invalid_benefit_issue_job_type");
    }

    if (!business_id) {
        throw new Error("business_id_required");
    }

    if (!benefit_type || !period) {
        throw new Error("benefit_issue_payload_incomplete");
    }

    if (
        processing_mode !== "ISSUE_REPROCESSING" ||
        !Array.isArray(issue_ids) ||
        issue_ids.length === 0
    ) {
        throw new Error("invalid_benefit_issue_payload");
    }

    const result = {
        job_id,
        business_id,
        benefit_type,
        period,
        total_received: issue_ids.length,
        total_processed: 0,
        total_resolved: 0,
        total_pending: 0,
        total_failed: 0
    };

    const issues = await BenefitProcessingIssue.findAll({
        where: {
            id: issue_ids,
            business_id,
            benefit_type,
            period,
            status: "PROCESSING",
            processing_job_id: job_id
        },
        order: [
            ["detected_at", "ASC"]
        ]
    });

    if (issues.length !== issue_ids.length) {
        throw new Error("benefit_issue_job_integrity_error");
    }

    for (const issue of issues) {

        try {
            await calculateBenefit({
                business_id: issue.business_id,
                employee_id: issue.employee_id,
                benefit_type: issue.benefit_type,
                calculationDate
            });
            await sequelize.transaction(async (transaction) => {
                const [updated] =
                    await BenefitProcessingIssue.update(
                        {
                            status: "RESOLVED",
                            resolved_at: new Date(),
                            last_attempt_at: new Date(),
                            attempts: sequelize.literal('"attempts" + 1')
                        },
                        {
                            where: {
                                id: issue.id,
                                business_id,
                                status: "PROCESSING",
                                processing_job_id: job_id
                            },
                            transaction
                        }
                    );

                if (!updated) {
                    throw new Error(
                        "benefit_issue_resolution_conflict"
                    );
                }

            });
            result.total_resolved++;
        } catch (error) {
            if (isBenefitCalculationWarning(error.message)) {
                try {
                    await sequelize.transaction(async (transaction) => {
                        await registerBenefitProcessingIssue({
                            business_id,
                            employee_id: issue.employee_id,
                            benefit_type: issue.benefit_type,
                            period: issue.period,
                            issue_code: error.message,
                            issue_message: error.message,
                            transaction
                        });
                        const [updated] =
                            await BenefitProcessingIssue.update(
                                {
                                    status: "PENDING",
                                    processing_job_id: null,
                                    last_attempt_at: new Date(),
                                    attempts: sequelize.literal('"attempts" + 1')
                                },
                                {
                                    where: {
                                        id: issue.id,
                                        business_id,
                                        status: "PROCESSING",
                                        processing_job_id: job_id
                                    },
                                    transaction
                                }
                            );

                        if (!updated) {
                            throw new Error(
                                "benefit_issue_pending_update_conflict"
                            );
                        }

                    });
                    result.total_pending++;

                    console.warn(
                        "[BENEFIT ISSUE STILL PENDING]",
                        {
                            job_id,
                            issue_id: issue.id,
                            employee_id: issue.employee_id,
                            warning: error.message
                        }
                    );

                } catch (issueError) {

                    result.total_failed++;

                    await registerJobError({
                        job_id,
                        business_id,
                        employee_id: issue.employee_id,
                        error_code: "BENEFIT_ISSUE_UPDATE_ERROR",
                        error_message: issueError.message,
                        error_stack: issueError.stack || null,
                        error_details: {
                            issue_id: issue.id,
                            original_warning: error.message
                        }
                    });

                }

                continue;
            }
            result.total_failed++;
            await registerJobError({
                job_id,
                business_id,
                employee_id: issue.employee_id,
                error_code: error.code || "BENEFIT_ISSUE_REPROCESS_ERROR",
                error_message: error.message,
                error_stack: error.stack || null,
                error_details: {
                    issue_id: issue.id,
                    benefit_type,
                    period,
                    attempt_number
                }
            });
            console.error(
                "[BENEFIT ISSUE REPROCESS ERROR]",
                {
                    job_id,
                    issue_id: issue.id,
                    employee_id: issue.employee_id,
                    error: error.message
                }
            );
        }
        result.total_processed++;
    }

    return result;
};