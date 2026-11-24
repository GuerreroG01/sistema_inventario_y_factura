export const BENEFIT_TYPES = [
    "VACATION",
    "THIRTEENTH_MONTH",
    "SEVERANCE",
    "TRANSPORT",
    "FOOD",
    "OTHER",
];

export const BENEFIT_SCOPES = ["GLOBAL", "EMPLOYEE"];

export const BENEFIT_MODES = ["RECURRING", "ONE_TIME"];

export const BENEFIT_FREQUENCIES = [
    "NONE",
    "MONTHLY",
    "BIWEEKLY",
    "YEARLY",
    "ON_DEMAND",
];

export const BENEFIT_UNITS = ["DAYS", "CURRENCY"];

export const RULE_FIELDS = [
    "type",
    "name",
    "description",
    "scope",
    "benefit_mode",
    "frequency",
    "unit",
    "amount",
    "formula",
    "start_date",
    "end_date",
    "conditions",
];

export const EMPLOYEE_BENEFIT_STATUSES = [
    "ACTIVE",
    "PAUSED",
    "CLOSED",
];

export const VACATION_DAYS_PER_PERIOD = 15;
export const MONTHS_PER_PERIOD = 6;
export const VACATION_DAYS_PER_MONTH = VACATION_DAYS_PER_PERIOD / MONTHS_PER_PERIOD;