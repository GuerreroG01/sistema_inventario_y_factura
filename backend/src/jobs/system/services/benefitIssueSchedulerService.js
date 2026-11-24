import { Op } from "sequelize";
import sequelize from "../../../config/database.js";
import BenefitProcessingIssue from "../../../models/BenefitProcessingIssue.js";
import { createJob } from "../../system/services/systemJobService.js";

const ISSUE_JOB_TYPE = "BENEFIT_ISSUE_REPROCESS";
const MAX_ISSUES_PER_JOB = 50;

export const scheduleBenefitIssueJobs = async ({ max_issues = 500, created_by = null } = {}) => {

    if (!Number.isInteger(max_issues) || max_issues <= 0) {
        throw new Error("invalid_max_issues");
    }

    return await sequelize.transaction(async (transaction) => {

        const issues = await BenefitProcessingIssue.findAll({
            where: {
                status: "READY",
                processing_job_id: null
            },
            attributes: [
                "id",
                "business_id",
                "employee_id",
                "benefit_type",
                "period"
            ],
            order: [
                ["detected_at", "ASC"],
                ["id", "ASC"]
            ],
            limit: max_issues,
            transaction,
            lock: transaction.LOCK.UPDATE,
            skipLocked: true
        });

        console.log("[BENEFIT ISSUE JOB SCHEDULER]", {
            total_found: issues.length,
            issues: issues.map(issue => ({
                id: issue.id,
                business_id: issue.business_id,
                employee_id: issue.employee_id,
                benefit_type: issue.benefit_type,
                period: issue.period,
                status: issue.status
            }))
        });

        if (!issues.length) {
            return {
                total_found: 0,
                total_jobs_created: 0,
                total_assigned: 0,
                jobs: []
            };
        }

        const groups = new Map();

        for (const issue of issues) {

            const key = [
                issue.business_id,
                issue.benefit_type,
                issue.period
            ].join("_");

            if (!groups.has(key)) {
                groups.set(key, {
                    business_id: issue.business_id,
                    benefit_type: issue.benefit_type,
                    period: issue.period,
                    issues: []
                });
            }

            groups.get(key).issues.push(issue);
        }

        const result = {
            total_found: issues.length,
            total_jobs_created: 0,
            total_assigned: 0,
            jobs: []
        };

        for (const group of groups.values()) {
            for ( let i = 0; i < group.issues.length; i += MAX_ISSUES_PER_JOB ) {

                const issueBatch = group.issues.slice(
                    i,
                    i + MAX_ISSUES_PER_JOB
                );

                const issueIds = issueBatch.map(
                    issue => issue.id
                );

                const job = await createJob({
                    business_id: group.business_id,
                    job_type: ISSUE_JOB_TYPE,
                    job_category: group.benefit_type,
                    batch_size: MAX_ISSUES_PER_JOB,
                    max_attempts: 3,
                    created_by,
                    transaction,
                    payload: {
                        benefit_type: group.benefit_type,
                        period: group.period,
                        issue_ids: issueIds,
                        processing_mode: "ISSUE_REPROCESSING"
                    }
                });

                const [updated] =
                    await BenefitProcessingIssue.update(
                        {
                            status: "PROCESSING",
                            processing_job_id: job.id
                        },
                        {
                            where: {
                                id: {
                                    [Op.in]: issueIds
                                },
                                status: "READY",
                                processing_job_id: null
                            },
                            transaction
                        }
                    );

                if (updated !== issueIds.length) {
                    throw new Error(
                        "benefit_issue_assignment_mismatch"
                    );
                }

                result.total_jobs_created++;
                result.total_assigned += updated;
                result.jobs.push({
                    job_id: job.id,
                    business_id: group.business_id,
                    benefit_type: group.benefit_type,
                    period: group.period,
                    total_issues: updated
                });
            }
        }

        return result;
    });
};