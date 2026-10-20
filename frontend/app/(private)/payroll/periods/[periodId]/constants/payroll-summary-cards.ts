import { Users, Wallet, TrendingUp, TrendingDown, Building2 } from "lucide-react";

export const PAYROLL_SUMMARY_CARDS = [
  {
        key: "employees",
        label: "Empleados",
        description: "Empleados incluidos en el período",
        icon: Users,
        iconStyle: "bg-blue-50 text-blue-600 ring-blue-100/80",
    },
    {
        key: "grossSalary",
        label: "Salario bruto",
        description: "Importe bruto antes de deducciones",
        icon: Wallet,
        iconStyle: "bg-indigo-50 text-indigo-600 ring-indigo-100/80",
    },
    {
        key: "earnings",
        label: "Percepciones",
        description: "Ingresos y conceptos adicionales",
        icon: TrendingUp,
        iconStyle: "bg-emerald-50 text-emerald-600 ring-emerald-100/80",
    },
    {
        key: "deductions",
        label: "Deducciones",
        description: "Importes descontados de la nómina",
        icon: TrendingDown,
        iconStyle: "bg-rose-50 text-rose-600 ring-rose-100/80",
    },
    {
        key: "netSalary",
        label: "Salario neto",
        description: "Importe neto de los empleados",
        icon: Wallet,
        iconStyle: "bg-sky-50 text-sky-600 ring-sky-100/80",
    },
    {
        key: "employerCost",
        label: "Costo patronal",
        description: "Costo adicional para el empleador",
        icon: Building2,
        iconStyle: "bg-violet-50 text-violet-600 ring-violet-100/80",
    }
] as const;