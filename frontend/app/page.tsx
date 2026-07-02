import Link from "next/link";
import {
  Plus,
  FileText,
  BarChart3,
} from "lucide-react";

import DashboardMetricsCards from "./dashboard/Components/DashboardMetricsCards";
import ProfitabilityMetrics from "./dashboard/Components/ProfibilityMetrics/ProfitabilityMetrics";
import SalesRankingMetrics from "./dashboard/SalesRankingMetrics/SalesRankingMetrics";
import InventoryAlerts from "./dashboard/Components/InventoryAlerts/InventoryAlerts";
import ExpiringProductsMetrics from "./dashboard/Components/ExpiringProductsMetrics/ExpiringProductsMetrics";
import InventoryMovements from "./dashboard/Components/InventoryMovements/InventoryMovements";

export default function Home() {
  return (
    <div className="font-sans">
      <main className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 space-y-12">

        <section className="rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400 p-6 sm:p-10 shadow-2xl text-white">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            
            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-4xl sm:text-5xl font-extrabold drop-shadow-lg">
                  Bienvenido a Inventarium
                </h1>

                <p className="mt-4 text-indigo-100 text-lg sm:text-xl max-w-xl">
                  Administra tu inventario y facturación de manera eficiente.
                  Visualiza el estado de tu negocio y toma decisiones rápidas.
                </p>
              </div>

              <Link
                href="/sales/create"
                className="inline-flex items-center gap-2 rounded-2xl bg-white/20 px-6 py-3 font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-white/30 hover:scale-105"
              >
                <FileText className="w-5 h-5" />
                Registrar Venta
              </Link>
            </div>

            <div className="flex-1 flex justify-center">
              <div className="rounded-3xl bg-white/20 backdrop-blur-md p-4 sm:p-6 shadow-xl max-w-md">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm8H90sU3YbEwnSwicBkOB4Bihd4C-CDwcGA&s"
                  alt="Inventario"
                  className="w-full h-auto rounded-2xl shadow-lg object-cover"
                />
              </div>
            </div>
          </div>
          <div className="mt-10">
            <DashboardMetricsCards />
          </div>

        </section>
        <ProfitabilityMetrics />
        <SalesRankingMetrics />
        <InventoryAlerts />
        <ExpiringProductsMetrics />
        <InventoryMovements />
      </main>
    </div>
  );
}