export type License = {
    id: number;
    business_id: number;
    license_key: string;
    type: "TRIAL_PERIOD" | "SUBSCRIPTION" | "LIFETIME";
    status: "ACTIVE" | "EXPIRED" | "SUSPENDED";
    duration: number | null;
    duration_unit: "DAY" | "MONTH" | "YEAR" | null;
    activated_at: string | null;
    expires_at: string | null;
    grace_period_days: number;
    last_validation: string | null;
};

export type LicenseStatus = {
    type: "TRIAL_PERIOD" | "SUBSCRIPTION" | "LIFETIME";
    status: "ACTIVE" | "EXPIRED" | "SUSPENDED";
    expires_at: string | null;
    days_remaining: number | null;
};