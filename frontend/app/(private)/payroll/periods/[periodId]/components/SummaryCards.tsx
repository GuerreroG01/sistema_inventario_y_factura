
import { formatCurrency } from "../utils/format-currency";
import { PAYROLL_SUMMARY_CARDS } from "../constants/payroll-summary-cards";

import type { usePayrollPeriodDetails } from "../hooks/usePayrollPeriodDetails";

type Totals = NonNullable<
  ReturnType<typeof usePayrollPeriodDetails>["summary"]
>["summary"];

type SummaryKey =
  | "employees"
  | "grossSalary"
  | "earnings"
  | "deductions"
  | "netSalary"
  | "employerCost";

interface Props {
  totals: Totals;
}

export default function SummaryCards({ totals }: Props) {
  const values: Record<SummaryKey, string> = {
    employees: totals.total_employees.toLocaleString("es-NI"),
    grossSalary: formatCurrency(totals.total_gross_salary),
    earnings: formatCurrency(totals.total_earnings),
    deductions: formatCurrency(totals.total_deductions),
    netSalary: formatCurrency(totals.total_net_salary),
    employerCost: formatCurrency(totals.total_employer_cost),
  };

  const cardsByKey = new Map(
    PAYROLL_SUMMARY_CARDS.map((card) => [card.key, card])
  );

  const kpiOrder: SummaryKey[] = [
    "grossSalary",
    "earnings",
    "deductions",
    "netSalary",
    "employerCost",
    "employees",
  ];

  // El salario bruto es la referencia del 100 %.
  const referenceAmount = Math.max(
    0,
    Number(totals.total_gross_salary) || 0
  );

  const comparisonItems = [
    {
      key: "netSalary",
      label: "Salario neto",
      amount: totals.total_net_salary,
      color: "bg-indigo-500",
    },
    {
      key: "deductions",
      label: "Deducciones",
      amount: totals.total_deductions,
      color: "bg-amber-500",
    },
    {
      key: "employerCost",
      label: "Costos patronales",
      amount: totals.total_employer_cost,
      color: "bg-violet-500",
    },
    {
      key: "earnings",
      label: "Ingresos adicionales",
      amount: totals.total_earnings,
      color: "bg-teal-500",
    },
  ];

  return (
    <section
      aria-labelledby="payroll-summary-title"
      className="space-y-8"
    >
      <header className="space-y-1">
        <h2
          id="payroll-summary-title"
          className="text-lg font-bold tracking-tight text-slate-900"
        >
          Resumen financiero
        </h2>

        <p className="text-sm text-slate-500">
          Consolidado del período de nómina.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {kpiOrder.map((key) => {
          const card = cardsByKey.get(key);

          if (!card) return null;

          const Icon = card.icon;
          const isNetSalary = key === "netSalary";
          const isDeduction = key === "deductions";

          return (
            <article
              key={key}
              className={[
                "min-w-0 rounded-xl border p-4 sm:p-5",
                "transition-colors duration-200",
                "hover:border-slate-300 hover:shadow-sm",
                isNetSalary
                  ? "border-indigo-200 bg-indigo-50/60"
                  : "border-slate-200 bg-white",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-medium leading-5 text-slate-500">
                  {card.label}
                </h3>

                <div
                  className={[
                    "flex h-9 w-9 shrink-0 items-center justify-center",
                    "rounded-lg ring-1 ring-inset",
                    card.iconStyle,
                  ].join(" ")}
                  aria-hidden="true"
                >
                  <Icon className="h-[18px] w-[18px]" />
                </div>
              </div>

              <p
                className={[
                  "mt-4 break-words text-2xl font-bold",
                  "leading-tight tracking-tight tabular-nums",
                  "[overflow-wrap:anywhere]",
                  isNetSalary
                    ? "text-indigo-950"
                    : isDeduction
                      ? "text-amber-700"
                      : "text-slate-900",
                ].join(" ")}
              >
                {values[key]}
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                {card.description}
              </p>
            </article>
          );
        })}
      </div>
      <section
        aria-labelledby="payroll-comparison-title"
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="mb-6 space-y-1">
          <h3
            id="payroll-comparison-title"
            className="text-base font-bold tracking-tight text-slate-900"
          >
            Comparación de importes
          </h3>

          <p className="text-sm text-slate-500">
            Comparación de los importes respecto al salario bruto total.
          </p>
        </div>
        <div className="mb-6 rounded-xl bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Salario bruto total
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Referencia de comparación
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">
              100 %
            </span>
          </div>

          <p className="mb-3 break-words text-xl font-bold tabular-nums text-slate-900">
            {values.grossSalary}
          </p>

          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200"
            role="progressbar"
            aria-label="Salario bruto total, referencia del 100 %"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={100}
          >
            <div className="h-full w-full rounded-full bg-slate-500" />
          </div>
        </div>
        <div className="space-y-5">
          {comparisonItems.map((item) => {
            const numericAmount = Number(item.amount) || 0;

            const percentage =
              referenceAmount > 0
                ? (numericAmount / referenceAmount) * 100
                : 0;

            const barWidth = Math.min(
              Math.max(percentage, 0),
              100
            );

            return (
              <div key={item.key} className="space-y-2">
                <div className="flex items-end justify-between gap-3">
                  <span className="text-sm font-medium text-slate-700">
                    {item.label}
                  </span>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold tabular-nums text-slate-900">
                      {formatCurrency(numericAmount)}
                    </p>

                    <p className="text-xs tabular-nums text-slate-500">
                      {percentage.toLocaleString("es-NI", {
                        maximumFractionDigits: 1,
                      })}
                      % de referencia
                    </p>
                  </div>
                </div>

                <div
                  className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-label={`${item.label} respecto al salario bruto`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={barWidth}
                  aria-valuetext={`${percentage.toLocaleString("es-NI", {
                    maximumFractionDigits: 1,
                  })} % del salario bruto`}
                >
                  <div
                    className={[
                      "h-full rounded-full transition-[width] duration-500 ease-out",
                      item.color,
                    ].join(" ")}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
          Los porcentajes muestran la relación de cada importe
          con el salario bruto total. No representan partes de un
          mismo total ni porcentajes de distribución de la nómina.
        </p>
      </section>
    </section>
  );
}
