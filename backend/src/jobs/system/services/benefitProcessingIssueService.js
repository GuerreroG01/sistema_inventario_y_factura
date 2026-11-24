import sequelize from "../../../config/database.js";
import BenefitProcessingIssue from "../../../models/BenefitProcessingIssue.js";
import { BENEFIT_ISSUE_RESOLVERS } from "../../../constants/benefitIssueResolvers.js";

export const resolveBenefitProcessingIssues = async ({ business_id, employee_id, transaction = null }) => {
    if (!business_id) {
        throw new Error("business_id_required");
    }
    if (!employee_id) {
        throw new Error("employee_id_required");
    }
    const execute = async (t) => {
        const issues = await BenefitProcessingIssue.findAll({
            where: {
                business_id,
                employee_id,
                status: "PENDING"
            },
            order: [
                ["detected_at", "ASC"]
            ],
            transaction: t,
            lock: t.LOCK.UPDATE,
            skipLocked: true
        });

        const result = {
            business_id,
            employee_id,
            total_found: issues.length,
            total_ready: 0,
            total_pending: 0,
            total_unsupported: 0,
            ready_issues: []
        };

        for (const issue of issues) {
            const resolver = BENEFIT_ISSUE_RESOLVERS[issue.issue_code];
            if (!resolver) {
                result.total_unsupported++;
                continue;
            }

            const canResolve = await resolver({
                business_id,
                employee_id,
                benefit_type: issue.benefit_type,
                period: issue.period,
                transaction: t
            });

            if (!canResolve) {

                result.total_pending++;

                continue;
            }

            const [updated] =
                await BenefitProcessingIssue.update(
                    {
                        status: "READY"
                    },
                    {
                        where: {
                            id: issue.id,
                            business_id,
                            employee_id,
                            status: "PENDING"
                        },
                        transaction: t
                    }
                );

            if (updated) {

                result.total_ready++;

                result.ready_issues.push({
                    id: issue.id,
                    benefit_type: issue.benefit_type,
                    period: issue.period,
                    issue_code: issue.issue_code
                });
            }
        }

        return result;
    };

    if (transaction) {
        return await execute(transaction);
    }

    return await sequelize.transaction(async (t) => {
        return await execute(t);
    });

};