"use client";

import { useEffect, useState } from "react";
import { Boxes, Package, BarChart3, CheckCircle2, AlertTriangle, Plus } from "lucide-react";
import { useProductStats } from "../hooks/useProductStats";

type DashboardProps = {
  onAddProduct: () => void;
};

export default function Dashboard({  onAddProduct }: DashboardProps) {

  const { stats } = useProductStats();

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-5 select-none">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <div className="md:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 p-6 shadow-md border border-indigo-950 flex items-center justify-between text-white group">
          <div className="absolute -right-16 -top-16 w-36 h-36 bg-indigo-500 rounded-full blur-3xl opacity-25 pointer-events-none" />
          
          <div className="space-y-3 z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-[11px] font-semibold uppercase tracking-wider text-indigo-300 border border-indigo-500/20">
              <Boxes className="w-3 h-3" /> Sistema Activo
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Gestiona tu Inventario</h1>
              <p className="text-slate-400 text-xs mt-0.5 max-w-sm font-medium">
                Control de existencias y productos optimizados en tiempo real.
              </p>
            </div>
            
            <button 
              onClick={onAddProduct}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:bg-indigo-500 active:scale-95 group/btn"
            >
              <Plus className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:rotate-90" />
              Agregar Producto
            </button>
          </div>

          <div className="hidden sm:block w-32 h-24 relative z-10 mr-4">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/10 to-transparent backdrop-blur-md p-1.5 border border-white/10 shadow-xl">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm8H90sU3YbEwnSwicBkOB4Bihd4C-CDwcGA&s"
                alt="Inventario"
                className="w-full h-full rounded-lg object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
              />
            </div>
          </div>
        </div>

        <div className="group flex items-center justify-between rounded-2xl bg-white p-5 border border-slate-100 shadow-sm hover:border-indigo-100 transition-all duration-200">
          <div className="space-y-0.5">
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Productos</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{stats?.totalProducts ?? 0}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
            <Package className="w-5 h-5" />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="group flex items-center justify-between rounded-xl bg-white p-4 border border-slate-100 shadow-sm hover:border-purple-100 transition-all duration-200">
          <div className="space-y-0.5">
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Stock Total</p>
            <p className="text-xl font-black text-slate-900 tracking-tight">{stats?.totalStock ?? 0}</p>
          </div>
          <div className="p-2 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-200">
            <BarChart3 className="w-4 h-4" />
          </div>
        </div>

        <div className="group flex items-center justify-between rounded-xl bg-white p-4 border border-slate-100 shadow-sm hover:border-emerald-100 transition-all duration-200">
          <div className="space-y-0.5">
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Activos</p>
            <p className="text-xl font-black text-emerald-600 tracking-tight">{stats?.activeProducts ?? 0}</p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="group flex items-center justify-between rounded-xl bg-white p-4 border border-slate-100 shadow-sm hover:border-rose-100 transition-all duration-200">
          <div className="space-y-0.5">
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Bajo Stock</p>
            <p className="text-xl font-black text-rose-600 tracking-tight">{stats?.lowStock ?? 0}</p>
          </div>
          <div className="p-2 rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors duration-200">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}