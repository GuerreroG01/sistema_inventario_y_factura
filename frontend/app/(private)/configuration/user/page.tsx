"use client";

import Link from "next/link";
import { UserPlus, Users, ShieldCheck, UserCog, ArrowRight } from "lucide-react";

const userModules = [
  {
    title: "Mi Perfil",
    description: "Actualizar la información de tu cuenta.",
    href: "/configuration/user/profile",
    icon: UserCog,
    color: {
      bg: "bg-purple-50",
      border: "border-purple-100",
      text: "text-purple-600",
      hover: "hover:border-purple-200 hover:bg-purple-50/30",
    },
  },
  {
    title: "Registrar Usuario",
    description:
      "Crear un nuevo usuario y asignarle su rol dentro de la plataforma.",
    href: "/auth/register",
    icon: UserPlus,
    color: {
      bg: "bg-blue-50",
      border: "border-blue-100",
      text: "text-blue-600",
      hover: "hover:border-blue-200 hover:bg-blue-50/30",
    },
  },

  {
    title: "Usuarios",
    description: "Consultar y administrar los usuarios registrados.",
    href: "/configuration/user/allUsers",
    icon: Users,
    color: {
      bg: "bg-indigo-50",
      border: "border-indigo-100",
      text: "text-indigo-600",
      hover: "hover:border-indigo-200 hover:bg-indigo-50/30",
    },
  },
  
];

export default function UserMenuPage() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-6 md:p-8 shadow-sm">
      <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-blue-50 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-indigo-50 blur-3xl" />

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-900">
              <Users className="h-8 w-8 text-slate-600" />
              Gestión de Usuarios
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Accede rápidamente a todas las funciones relacionadas con la
              administración de usuarios.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 w-fit">
            {userModules.length} opciones disponibles
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {userModules.map((module) => {
            const Icon = module.icon;

            return (
              <Link
                key={module.title}
                href={module.href}
                className={`
                  group
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  p-6
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-lg
                  ${module.color.hover}
                `}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${module.color.bg} ${module.color.border}`}
                  >
                    <Icon className={`h-7 w-7 ${module.color.text}`} />
                  </div>

                  <ArrowRight className="h-5 w-5 text-slate-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-slate-700" />
                </div>

                <h2 className="mt-6 text-lg font-bold text-slate-900">
                  {module.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {module.description}
                </p>

                <div className="mt-6 flex items-center text-sm font-semibold text-slate-700 transition-colors group-hover:text-blue-600">
                  Abrir
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}