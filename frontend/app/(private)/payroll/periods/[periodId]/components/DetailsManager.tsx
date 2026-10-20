
"use client";

import type { usePayrollPeriodDetails } from "../hooks/usePayrollPeriodDetails";

import PayrollPeriodHeader from "./Header";
import PayrollSummaryCards from "./SummaryCards";
import PayrollEmployeeList from "./EmployeeList";
import PayrollPeriodSkeleton from "./Skeleton";
import PayrollPeriodError from "./PeriodError";

type Props = ReturnType<typeof usePayrollPeriodDetails>;

export default function DetailsManager({
  summary,
  items,
  selectedEmployeeId,
  loadingSummary,
  loadingItems,
  summaryError,
  itemsError,
  fetchSummary,
  fetchEmployeeItems,
  clearEmployeeItems,
}: Props) {
  if (loadingSummary && !summary) {
    return <PayrollPeriodSkeleton />;
  }

  if (summaryError && !summary) {
    return (
      <PayrollPeriodError
        error={summaryError}
        loading={loadingSummary}
        onRetry={fetchSummary}
      />
    );
  }

  if (!summary) return null;

  const { period, summary: totals, employees } = summary;

  return (
    <section className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-b from-slate-50/80 via-white to-white p-4 shadow-sm md:p-6">
      <div className="pointer-events-none absolute -left-32 -top-32 h-72 w-72 rounded-full bg-blue-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-indigo-100/40 blur-3xl" />

      <div className="relative z-10 space-y-7">
        <PayrollPeriodHeader
          period={period}
          loading={loadingSummary}
          error={summaryError}
          onRefresh={fetchSummary}
        />

        <PayrollSummaryCards totals={totals} />

        <PayrollEmployeeList
          employees={employees}
          selectedEmployeeId={selectedEmployeeId}
          items={items}
          loadingItems={loadingItems}
          itemsError={itemsError}
          onSelect={fetchEmployeeItems}
          onClear={clearEmployeeItems}
        />
      </div>
    </section>
  );
}