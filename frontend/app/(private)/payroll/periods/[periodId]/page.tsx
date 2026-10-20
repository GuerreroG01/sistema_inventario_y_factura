"use client";

import { useParams } from "next/navigation";

import { usePayrollPeriodDetails } from "./hooks/usePayrollPeriodDetails";
import PayrollPeriodDetailsManager from "./components/DetailsManager";

export default function PayrollPeriodDetailsPage() {
    const params = useParams<{ periodId: string }>();
    const periodId = Number(params.periodId);

    const payrollDetails = usePayrollPeriodDetails(
        Number.isSafeInteger(periodId) && periodId > 0
            ? periodId
            : null
    );

    return <PayrollPeriodDetailsManager {...payrollDetails} />;
}