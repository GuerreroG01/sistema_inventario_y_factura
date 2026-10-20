"use client";

import { usePayrollPeriods } from "./hooks/usePayrollPeriods";
import PayrollPeriodManager from "./components/PayrollPeriodManager";

export default function PayrollPeriodsPage() {
    const payrollData = usePayrollPeriods();

    return <PayrollPeriodManager {...payrollData} />;
}