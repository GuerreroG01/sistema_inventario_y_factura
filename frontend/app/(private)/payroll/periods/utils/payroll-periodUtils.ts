import type { PayrollPeriodStatus } from "@/types/worksheet/payroll/PayrollPeriod";
import { PAYROLL_PERIOD_STATUSES, PAYROLL_PERIOD_VALID_TRANSITIONS } from "../constants/payroll-period";

export function getAvailablePayrollPeriodStatuses(
    currentStatus: PayrollPeriodStatus
): PayrollPeriodStatus[] {
    const allowedTransitions =
        PAYROLL_PERIOD_VALID_TRANSITIONS[currentStatus];

    return PAYROLL_PERIOD_STATUSES.filter(
        (status) =>
            status === currentStatus ||
            allowedTransitions.includes(status)
    );
}