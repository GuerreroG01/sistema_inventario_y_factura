import { Op } from "sequelize";
import Employee from "../../../models/Worksheet/Employee/Employee.js";
import { initializeJob, updateJobProgress, renewJobLock, registerBenefitProcessingIssue } from "../../system/services/systemJobService.js";
import { BENEFIT_TYPES } from "../../system/constants/systemJob.js";
import { calculateEmployeeVacationBenefit } from "../../../services/Worksheet/Benefit/Nicaragua/NicaraguaVacationsService.js";
import {
    calculateEmployeeThirteenthMonthBenefit, calculateInitialThirteenthMonthBenefit
} from "../../../services/Worksheet/Benefit/Nicaragua/NicaraguaAguinaldoService,.js";
import {
    employeeHasThirteenthMonthTransactions, employeeHasIndemnificationTransactions
} from "../../../services/Worksheet/Benefit/BenefitTransactionService.js";
import {
    calculateInitialIndemnificationBenefit, calculateEmployeeIndemnificationBenefit
} from "../../../services/Worksheet/Benefit/Nicaragua/NicaraguaIndemnService.js";
import { registerJobError } from "../../system/services/systemJobErrorService.js";
import { isBenefitCalculationWarning } from "../../../constants/benefitCalculationWarnings.js";

export const calculateBenefit = async ({ benefit_type, business_id, employee_id, calculation_date }) => {
    switch (benefit_type) {
        // VACACIONES
        case BENEFIT_TYPES.VACATION:
            return await calculateEmployeeVacationBenefit({
                business_id,
                employee_id,
                calculation_date,
            });
        // DECIMO TERCER MES
        case BENEFIT_TYPES.THIRTEENTH_MONTH: {
            const hasTransactions =
                await employeeHasThirteenthMonthTransactions({
                    employee_id,
                    business_id,
                });
            if (!hasTransactions) {
                return await calculateInitialThirteenthMonthBenefit({
                    business_id,
                    employee_id,
                    calculation_date,
                });
            }
            return await calculateEmployeeThirteenthMonthBenefit({
                business_id,
                employee_id,
                calculation_date,
            });
        }
        // INDEMNIZACION
        case BENEFIT_TYPES.INDEMNIFICATION: {
            const hasTransactions =
                await employeeHasIndemnificationTransactions({
                    employee_id,
                    business_id,
                });

            if (!hasTransactions) {
                return await calculateInitialIndemnificationBenefit({
                    business_id,
                    employee_id,
                    calculation_date,
                });
            }
            return await calculateEmployeeIndemnificationBenefit({
                business_id,
                employee_id,
                calculation_date,
            });
        }

        default:
            throw new Error("unsupported_benefit_type");
    }
};

// PROCESAR JOB DE BENEFICIOS
export const processBenefitCalculationJob = async ({ job, worker_id }) => {
    const { id: job_id, business_id, batch_size, last_record_id, payload} = job;
    const { benefit_type, calculation_date, period } = payload || {};

    if (!business_id) {
        throw new Error("business_id_required");
    }

    if (!Object.values(BENEFIT_TYPES).includes(benefit_type)) {
        throw new Error("invalid_benefit_type");
    }

    if (!job.attempt_number) {
        throw new Error("job_attempt_number_missing");
    }

    let total_records = Number(job.total_records || 0);

    if (total_records === 0) {
        total_records = await Employee.count({
            where: {
                business_id,
                status: "ACTIVE",
            },
        });

        const initialized = await initializeJob({
            job_id,
            worker_id,
            total_records,
            batch_size,
        });

        if (!initialized) {
            throw new Error("job_initialization_failed");
        }

    }

    let cursor = Number(last_record_id || 0);
    let total_processed = 0;
    let total_failed = 0;
    let batchNumber = Number(job.completed_batches || 0) + 1;

    while (true) {
        const employees = await Employee.findAll({
            where: {
                business_id,
                status: "ACTIVE",
                id: {
                    [Op.gt]: cursor,
                },
            },
            attributes: ["id"],
            order: [["id", "ASC"]],
            limit: batch_size,
            raw: true,
        });

        if (!employees.length) {
            break;
        }

        let batch_processed = 0;
        let batch_failed = 0;

        for (const employee of employees) {
            await renewJobLock({ job_id, worker_id });

            try {
                await calculateBenefit({
                    benefit_type,
                    business_id,
                    employee_id: employee.id,
                    calculation_date,
                });
                batch_processed++;
            
            } catch (error) {
                if (isBenefitCalculationWarning(error.message)) {
                    try {
                        await registerBenefitProcessingIssue({
                            business_id,
                            employee_id: employee.id,
                            benefit_type,
                            period: period || new Date(calculation_date).getFullYear().toString(),
                            issue_code: error.message,
                            issue_message: error.message
                        });
                        console.warn(
                            "[BENEFIT CALCULATION WARNING]",
                            {
                                job_id,
                                employee_id: employee.id,
                                benefit_type,
                                warning_code: error.message,
                                issue_registered: true
                            }
                        );
                        batch_processed++;
                    } catch (issueError) {
                        await registerJobError({
                            job_id,
                            business_id,
                            employee_id: employee.id,
                            batch_number: batchNumber,
                            attempt_number: job.attempt_number,
                            error_code: "BENEFIT_ISSUE_REGISTRATION_ERROR",
                            error_message: issueError.message,
                            error_stack: issueError.stack || null,
                            error_details: {
                                original_warning: error.message,
                                benefit_type,
                                calculation_date
                            }
                        });
                        batch_failed++;
                        console.error(
                            "[BENEFIT ISSUE REGISTRATION ERROR]",
                            {
                                employee_id: employee.id,
                                warning: error.message,
                                registration_error: issueError.message
                            }
                        );
                    }
                } else {
                    await registerJobError({
                        job_id,
                        business_id,
                        employee_id: employee.id,
                        batch_number: batchNumber,
                        attempt_number: job.attempt_number,
                        error_code: error.code || "BENEFIT_CALCULATION_ERROR",
                        error_message: error.message || "Unknown benefit calculation error",
                        error_stack: error.stack || null,
                        error_details: {
                            name: error.name,
                            benefit_type,
                            calculation_date
                        }
                    });
                    batch_failed++;

                    console.error(
                        "[BENEFIT CALCULATION ERROR]",
                        {
                            job_id,
                            employee_id: employee.id,
                            error: error.message,
                            stack: error.stack
                        }
                    );
                }
            }
            cursor = employee.id;
        }

        await updateJobProgress({
            job_id,
            worker_id,
            last_record_id: cursor,
            processed: batch_processed,
            failed: batch_failed,
        });
        total_processed += batch_processed;
        total_failed += batch_failed;
        console.log({
            job_id,
            business_id,
            benefit_type,
            attempt_number: job.attempt_number,
            batch_number: batchNumber,
            batch_processed,
            batch_failed,
            total_processed,
            total_failed,
        });
        batchNumber++;
    }

    return {
        job_id,
        business_id,
        benefit_type,
        attempt_number: job.attempt_number,
        total_records,
        total_processed,
        total_failed,
    };
};