import SystemJobError from "../../../models/SystemJobError.js"

// REGISTER JOB ERROR
export const registerJobError = async ({
    job_id, business_id = null, employee_id = null, batch_number = null, attempt_number = 1, 
    error_code = null, error_message, error_stack = null, error_details = null
}) => {

    if (!job_id) {
        throw new Error("job_id_required");
    }

    if (!error_message) {
        throw new Error("error_message_required");
    }

    if (!Number.isInteger(attempt_number) || attempt_number <= 0) {
        throw new Error("invalid_attempt_number");
    }

    if ( batch_number !== null && (!Number.isInteger(batch_number) || batch_number <= 0) ) {
        throw new Error("invalid_batch_number");
    }

    return await SystemJobError.create({
        job_id,
        business_id,
        employee_id,
        batch_number,
        attempt_number,
        error_code,
        error_message,
        error_stack,
        error_details,
        created_at: new Date(),
    });
};