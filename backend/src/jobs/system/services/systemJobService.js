import SystemJob from "../../../models/SystemJob.js";
import SystemJobError from "../../../models/SystemJobError.js"
import { QueryTypes, Op, literal } from "sequelize";
import sequelize from "../../../config/database.js";
import { JOB_STATUS, JOB_DEFAULTS } from "../constants/systemJob.js";
import BenefitProcessingIssue from "../../../models/BenefitProcessingIssue.js";

export const initializeJob = async ({ job_id, worker_id, total_records, batch_size }) => {

    if (!Number.isInteger(total_records) || total_records < 0) {
        throw new Error("invalid_total_records");
    }

    if (!Number.isInteger(batch_size) || batch_size <= 0) {
        throw new Error("invalid_batch_size");
    }

    const [updated] = await SystemJob.update(
        {
            total_records,
            total_batches: Math.ceil( total_records / batch_size ),
            total_processed: 0,
            total_failed: 0,
            completed_batches: 0,
            last_record_id: 0,
            updatedAt: new Date(),
        },
        {
            where: {
                id: job_id,
                locked_by: worker_id,
                status: JOB_STATUS.PROCESSING,
                total_records: 0,
                locked_until: {
                    [Op.gt]: literal("NOW()")
                }
            }
        }
    );
    return updated > 0;
};

// CREATE JOB
export const createJob = async ({
    business_id = null, job_type, job_category = null, payload = {}, batch_size = JOB_DEFAULTS.BATCH_SIZE,
    max_attempts = JOB_DEFAULTS.MAX_ATTEMPTS, created_by = null, transaction = null
}) => {

    if (!job_type) {
        throw new Error("job_type_required");
    }

    if (!Number.isInteger(batch_size) || batch_size <= 0) {
        throw new Error("invalid_batch_size");
    }

    if (!Number.isInteger(max_attempts) || max_attempts <= 0) {
        throw new Error("invalid_max_attempts");
    }

    return await SystemJob.create({
        business_id,
        job_type,
        job_category,
        payload,
        batch_size,
        max_attempts,
        created_by,
        status: JOB_STATUS.PENDING,
        total_records: 0,
        total_processed: 0,
        total_failed: 0,
        last_record_id: 0,
        total_batches: 0,
        completed_batches: 0,
        attempts: 0,
        locked_by: null,
        locked_until: null,
        last_error_code: null,
        last_error_message: null,
        last_error_at: null,
        error_details: null,
        started_at: null,
        completed_at: null
    }, {
        transaction
    });
};

// GET JOB BY ID
export const getJobById = async ({ job_id, business_id }) => {
    return await SystemJob.findOne({
        where: {
            id: job_id,
            business_id,
        },
        include: [
            {
                model: SystemJobError,
                as: "errors",
                required: false,
                attributes: [
                    "id",
                    "employee_id",
                    "batch_number",
                    "attempt_number",
                    "error_code",
                    "error_message",
                    "error_stack",
                    "error_details",
                    "created_at",
                ],
                order: [
                    ["created_at", "DESC"]
                ]
            }
        ],
    });
};

// GET JOBS
export const getJobs = async ({ business_id, status, job_type, limit = 20, offset = 0 }) => {

    const where = {};

    if (business_id !== undefined) {
        where.business_id = business_id;
    }

    if (status) {
        where.status = status;
    }

    if (job_type) {
        where.job_type = job_type;
    }

    return await SystemJob.findAndCountAll({
        where,
        attributes: [
            "id",
            "business_id",
            "job_type",
            "job_category",
            "payload",
            "batch_size",
            "max_attempts",
            "status",
            "total_records",
            "total_processed",
            "total_failed",
            "total_batches",
            "completed_batches",
            "last_record_id",
            "attempts",
            "last_error_code",
            "last_error_message",
            "last_error_at",
            "error_details",
            "started_at",
            "completed_at",
            "createdAt",
            "updatedAt",
        ],
        limit,
        offset,
        order: [["createdAt", "DESC"]],
    });
};

// CLAIM NEXT JOB
export const claimNextJob = async (worker_id) => {

    if (!worker_id) {
        throw new Error("worker_id_required");
    }

    const transaction = await sequelize.transaction();

    try {
        const jobs = await sequelize.query(
            `
            SELECT *
            FROM "SystemJobs"
            WHERE
                (
                    status = 'PENDING'
                    OR (
                        status = 'PROCESSING'
                        AND locked_until < NOW()
                    )
                )
                AND attempts < max_attempts
            ORDER BY "createdAt" ASC
            LIMIT 1
            FOR UPDATE SKIP LOCKED
            `,
            {
                transaction,
                type: QueryTypes.SELECT,
            }
        );

        if (!jobs.length) {
            await transaction.commit();
            return null;
        }

        const job = jobs[0];

        const claimedJobs = await sequelize.query(
            `
            UPDATE "SystemJobs"
            SET
                status = 'PROCESSING',
                locked_by = :worker_id,
                locked_until = NOW() + INTERVAL '5 minutes',
                attempts = attempts + 1,
                started_at = COALESCE(started_at, NOW()),
                "updatedAt" = NOW()
            WHERE
                id = :job_id
            RETURNING *
            `,
            {
                replacements: {
                    worker_id,
                    job_id: job.id,
                },
                transaction,
                type: QueryTypes.SELECT,
            }
        );
        if (!claimedJobs.length) {
            throw new Error("job_claim_update_failed");
        }

        const claimedJob = claimedJobs[0];
        await transaction.commit();

        return {
            ...claimedJob,
            status: JOB_STATUS.PROCESSING,
            locked_by: worker_id,
            attempt_number: claimedJob.attempts,
        };
    } catch (error) {
        if (!transaction.finished) {
            await transaction.rollback();
        }
        throw error;
    }
};

// UPDATE JOB PROGRESS
export const updateJobProgress = async ({ job_id, worker_id, last_record_id, processed = 0, failed = 0 }) => {

    if (!job_id) {
        throw new Error("job_id_required");
    }

    if (!worker_id) {
        throw new Error("worker_id_required");
    }

    if ( last_record_id === undefined || last_record_id === null ) {
        throw new Error("last_record_id_required");
    }

    if (!Number.isInteger(processed) || processed < 0) {
        throw new Error("invalid_processed_count");
    }

    if (!Number.isInteger(failed) || failed < 0) {
        throw new Error("invalid_failed_count");
    }

    const [updated] = await SystemJob.update(
        {
            last_record_id,
            total_processed: literal(
                `"total_processed" + ${processed}`
            ),
            total_failed: literal(
                `"total_failed" + ${failed}`
            ),
            completed_batches: literal(
                `"completed_batches" + 1`
            ),
            locked_until: literal(
                `NOW() + INTERVAL '5 minutes'`
            ),
            updatedAt: new Date(),
        },
        {
            where: {
                id: job_id,
                locked_by: worker_id,
                status: JOB_STATUS.PROCESSING,
                locked_until: {
                    [Op.gt]: literal("NOW()")
                }
            }
        }
    );

    if (updated === 0) {
        throw new Error("job_progress_update_failed_or_lock_expired");
    }

    return true;
};

// RENEW JOB LOCK
export const renewJobLock = async ({ job_id, worker_id }) => {

    if (!job_id) {
        throw new Error("job_id_required");
    }

    if (!worker_id) {
        throw new Error("worker_id_required");
    }

    const [updated] = await SystemJob.update(
        {
            locked_until: literal(
                `NOW() + INTERVAL '5 minutes'`
            ),
            updatedAt: new Date(),
        },
        {
            where: {
                id: job_id,
                locked_by: worker_id,
                status: JOB_STATUS.PROCESSING,
                locked_until: {
                    [Op.gt]: literal("NOW()")
                }
            }
        }
    );

    if (updated === 0) {
        throw new Error("job_lock_renewal_failed_or_expired");
    }
    return true;
};

// COMPLETE JOB
export const completeJob = async ({ job_id, worker_id }) => {

    if (!job_id || !worker_id) {
        throw new Error("job_id_and_worker_id_required");
    }

    const [updated] = await SystemJob.update(
        {
            status: literal(`
                CASE
                    WHEN "total_failed" > 0
                    THEN '${JOB_STATUS.COMPLETED_WITH_ERRORS}'
                    ELSE '${JOB_STATUS.COMPLETED}'
                END
            `),
            completed_at: literal("NOW()"),
            locked_by: null,
            locked_until: null,
            updatedAt: new Date(),
        },
        {
            where: {
                id: job_id,
                locked_by: worker_id,
                status: JOB_STATUS.PROCESSING,
                locked_until: {
                    [Op.gt]: literal("NOW()")
                },
                [Op.and]: [
                    literal(`
                        (
                            "total_records" = 0
                            OR
                            "total_processed" + "total_failed" = "total_records"
                        )
                    `)
                ]
            }
        }
    );
    return updated > 0;
};

// FAIL JOB
export const failJob = async ({ job_id, worker_id, error_code = null, error_message = null, error_details = null }) => {

    if (!job_id || !worker_id) {
        throw new Error("job_id_and_worker_id_required");
    }

    const updateData = {
        status: literal(`
            CASE
                WHEN "attempts" < "max_attempts"
                THEN '${JOB_STATUS.PENDING}'
                ELSE '${JOB_STATUS.FAILED}'
            END
        `),
        locked_by: null,
        locked_until: null,
        completed_at: literal(`
            CASE
                WHEN "attempts" >= "max_attempts"
                THEN NOW()
                ELSE NULL
            END
        `),
        updatedAt: new Date(),
    };

    if (error_code || error_message || error_details) {
        updateData.last_error_code = error_code;
        updateData.last_error_message = error_message;
        updateData.last_error_at = new Date();
        updateData.error_details = error_details;
    }

    const [updated] = await SystemJob.update(
        updateData,
        {
            where: {
                id: job_id,
                locked_by: worker_id,
                status: JOB_STATUS.PROCESSING,

                locked_until: {
                    [Op.gt]: literal("NOW()")
                }
            }
        }
    );
    return updated > 0;
};

// PAUSE JOB
export const pauseJob = async (job_id, business_id) => {

    if (!job_id || !business_id) {
        throw new Error("job_id_and_business_id_required");
    }

    const [updated] = await SystemJob.update(
        {
            status: JOB_STATUS.PAUSED,
            locked_by: null,
            locked_until: null,
            updatedAt: new Date(),
        },
        {
            where: {
                id: job_id,
                business_id,
                status: JOB_STATUS.PENDING,
            }
        }
    );
    return updated > 0;
};

// CANCEL JOB
export const cancelJob = async ({ job_id, business_id }) => {

    if (!job_id || !business_id) {
        throw new Error("job_id_and_business_id_required");
    }

    const [updated] = await SystemJob.update(
        {
            status: JOB_STATUS.CANCELLED,
            locked_by: null,
            locked_until: null,
            updatedAt: new Date(),
        },
        {
            where: {
                id: job_id,
                business_id,
                status: {
                    [Op.in]: [
                        JOB_STATUS.PENDING,
                        JOB_STATUS.PROCESSING,
                        JOB_STATUS.PAUSED,
                    ]
                }
            }
        }
    );
    return updated > 0;
};

// RECOVER JOBS
export const recoverJobs = async () => {
    const transaction = await sequelize.transaction();
    try {
        const [failed] = await SystemJob.update(
            {
                status: JOB_STATUS.FAILED,
                last_error_code: "WORKER_LOCK_EXPIRED",
                last_error_message: "Worker lost its lock and maximum attempts were exhausted",
                last_error_at: literal("NOW()"),
                error_details: {
                    reason: "LOCK_EXPIRED",
                    source: "JOB_RECOVERY",
                },
                completed_at: literal("NOW()"),
                locked_by: null,
                locked_until: null,
                updatedAt: new Date(),
            },
            {
                where: {
                    status: JOB_STATUS.PROCESSING,
                    attempts: {
                        [Op.gte]: literal('"max_attempts"')
                    },
                    locked_until: {
                        [Op.lt]: literal("NOW()"),
                    }
                },
                transaction,
            }
        );
        const [pending] = await SystemJob.update(
            {
                status: JOB_STATUS.PENDING,
                last_error_code: "WORKER_LOCK_EXPIRED",
                last_error_message: "Worker lock expired. Job scheduled for retry",
                last_error_at: literal("NOW()"),
                error_details: {
                    reason: "LOCK_EXPIRED",
                    source: "JOB_RECOVERY",
                },
                locked_by: null,
                locked_until: null,
                updatedAt: new Date(),
            },
            {
                where: {
                    status: JOB_STATUS.PROCESSING,
                    attempts: {
                        [Op.lt]: literal('"max_attempts"')
                    },
                    locked_until: {
                        [Op.lt]: literal("NOW()"),
                    }
                },
                transaction,
            }
        );
        await transaction.commit();
        return {
            failed,
            pending,
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const getMonthlyJobStats = async ({ job_type, start_date, end_date, business_id }) => {
    const where = {
        createdAt: {
            [Op.gte]: start_date,
            [Op.lt]: end_date,
        },
    };

    if (job_type) {
        where.job_type = job_type;
    }

    if (business_id !== undefined) {
        where.business_id = business_id;
    }

    return await SystemJob.findAll({
        where,
        attributes: [
            [
                literal('COUNT(*)'),
                "total_jobs",
            ],
            [
                literal('SUM("total_records")'),
                "total_records",
            ],
            [
                literal('SUM("total_processed")'),
                "total_processed",
            ],
            [
                literal('SUM("total_failed")'),
                "total_failed",
            ],
            [
                literal(`
                    COUNT(*) FILTER (
                        WHERE status = '${JOB_STATUS.COMPLETED}'
                    )
                `),
                "completed_jobs",
            ],
            [
                literal(`
                    COUNT(*) FILTER (
                        WHERE status = '${JOB_STATUS.COMPLETED_WITH_ERRORS}'
                    )
                `),
                "completed_with_errors",
            ],
            [
                literal(`
                    COUNT(*) FILTER (
                        WHERE status = '${JOB_STATUS.FAILED}'
                    )
                `),
                "failed_jobs",
            ],
            [
                literal('SUM("attempts")'),
                "total_attempts",
            ],
        ],
        raw: true,
    });
};

// Registrar incidencias de los empleados para warnings controlados
export const registerBenefitProcessingIssue = async ({
    business_id, employee_id, benefit_type, period, issue_code, issue_message
}) => {

    if (!business_id) {
        throw new Error("business_id_required");
    }

    if (!employee_id) {
        throw new Error("employee_id_required");
    }

    if (
        !benefit_type ||
        typeof benefit_type !== "string" ||
        !benefit_type.trim()
    ) {
        throw new Error("benefit_type_required");
    }

    if (!period) {
        throw new Error("period_required");
    }

    if (!issue_code) {
        throw new Error("issue_code_required");
    }

    if (!issue_message) {
        throw new Error("issue_message_required");
    }

    const normalizedBenefitType = benefit_type.trim().toUpperCase();

    // Buscar incidencia abierta existente
    const existingIssue = await BenefitProcessingIssue.findOne({
        where: {
            business_id,
            employee_id,
            benefit_type: normalizedBenefitType,
            period,
            issue_code,
            status: {
                [Op.in]: ["PENDING", "READY", "PROCESSING"]
            }
        }
    });

    if (existingIssue) {
        return {
            created: false,
            issue: existingIssue
        };
    }

    const issue = await BenefitProcessingIssue.create({
        business_id,
        employee_id,
        benefit_type: normalizedBenefitType,
        period,
        issue_code,
        issue_message,
        status: "PENDING",
        attempts: 0,
        detected_at: new Date(),
        resolved_at: null,
        last_attempt_at: null
    });

    return {
        created: true,
        issue
    };
};