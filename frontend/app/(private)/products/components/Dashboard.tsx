"use client";

import { Package, Boxes, BarChart3, CheckCircle2, AlertTriangle, Plus } from "lucide-react";
import { useProductStats } from "../hooks/useProductStats";
import { MetricCard } from "../../customer/components/MetricCard";

type DashboardProps = {
  onAddProduct: () => void;
};

export default function Dashboard({ onAddProduct}: DashboardProps) {

  const { stats } = useProductStats();

  return (
    <section className="relative">
      <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-indigo-100/60 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-80 h-80 rounded-full bg-blue-100/60 blur-3xl pointer-events-none" />
      <div className="relative z-10 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
                <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-slate-900">
                    <div className="rounded-2xl bg-indigo-600 p-2.5 text-white shadow-md shadow-indigo-500/20">
                        <Boxes className="h-6 w-6" />
                    </div>
                    Productos
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Administra inventario, existencias y disponibilidad de productos.
                </p>
            </div>
            <button
                onClick={onAddProduct}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700"
            >
              <Plus className="h-5 w-5" />
              Nuevo producto
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <MetricCard
            icon={Package}
            title="Productos registrados"
            value={stats?.totalProducts ?? 0}
            color="blue"
          />
          <MetricCard
            icon={Boxes}
            title="Stock total"
            value={stats?.totalStock ?? 0}
            color="violet"
          />
          <MetricCard
            icon={CheckCircle2}
            title="Productos activos"
            value={stats?.activeProducts ?? 0}
            color="emerald"
          />
          <MetricCard
            icon={AlertTriangle}
            title="Bajo stock"
            value={stats?.lowStock ?? 0}
            color="rose"
          />
        </div>
      </div>
    </section>
  );
}