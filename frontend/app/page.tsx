import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { Boxes, Package, BarChart3, CheckCircle2, AlertTriangle, Plus, FileText } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">

        {/* HERO / Bienvenida */}
        <section className="rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400 p-10 shadow-2xl flex flex-col lg:flex-row items-center gap-8 text-white">
          <div className="flex-1">
            <h1 className="text-4xl sm:text-5xl font-extrabold drop-shadow-lg">
              Bienvenido a InventarioPro
            </h1>
            <p className="mt-4 text-indigo-100 text-lg sm:text-xl max-w-lg">
              Administra tu inventario y facturación de manera eficiente. Visualiza el estado de tu negocio en tiempo real y toma decisiones rápidas.
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <button className="inline-flex items-center gap-2 rounded-2xl bg-white/20 px-6 py-3 font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-white/30 hover:scale-105">
                <Plus className="w-5 h-5" />
                Nuevo Producto
              </button>

              <button className="inline-flex items-center gap-2 rounded-2xl bg-white/20 px-6 py-3 font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-white/30 hover:scale-105">
                <FileText className="w-5 h-5" />
                Nueva Factura
              </button>
            </div>
          </div>

          <div className="flex-1 flex justify-center">
            <div className="rounded-3xl bg-white/30 backdrop-blur-md p-6 shadow-xl">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm8H90sU3YbEwnSwicBkOB4Bihd4C-CDwcGA&s"
                alt="Inventario"
                className="w-full h-auto rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* ACCESOS RÁPIDOS / KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card icon={<Package className="w-8 h-8 text-indigo-500" />} title="Productos" value="—" />
          <Card icon={<BarChart3 className="w-8 h-8 text-purple-500" />} title="Stock Total" value="—" />
          <Card icon={<CheckCircle2 className="w-8 h-8 text-green-500" />} title="Productos Activos" value="—" />
          <Card icon={<AlertTriangle className="w-8 h-8 text-orange-500" />} title="Bajo Stock" value="—" />
        </section>

        {/* ACCIONES RÁPIDAS */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <ActionCard title="Agregar Producto" icon={<Plus />} description="Registra un nuevo producto en tu inventario" />
          <ActionCard title="Generar Factura" icon={<FileText />} description="Crea facturas rápidamente para tus clientes" />
          <ActionCard title="Ver Reportes" icon={<BarChart3 />} description="Consulta el estado de tu inventario y ventas" />
        </section>

      </main>

      <Footer />
    </div>
  );
}

/* ---------- COMPONENTES ---------- */

function Card({ icon, title, value }: any) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-lg hover:shadow-2xl transition">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      {icon}
    </div>
  );
}

function ActionCard({ title, description, icon }: any) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow hover:shadow-lg transition flex flex-col items-start gap-4">
      <div className="text-indigo-600">{icon}</div>
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  );
}