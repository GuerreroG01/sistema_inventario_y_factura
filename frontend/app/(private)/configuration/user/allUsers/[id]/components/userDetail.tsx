"use client";

import { Users, ShieldCheck, CheckCircle2, XCircle, Mail, Phone, CalendarDays, Building2, Clock } from "lucide-react";
import { User } from "@/types/User";
import { InfoCard } from "./InfoCard";

type Props = {
    user: User;
    userSelected: User;
    onAssignBusiness: () => void;
};

export default function UserDetail({ user, userSelected, onAssignBusiness }: Props) {
    return (
        <section className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-6 md:p-8 shadow-sm">
            <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-blue-50 blur-3xl"/>
            <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-indigo-50 blur-3xl"/>
            <div className="relative z-10">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50">
                            <Users className="h-8 w-8 text-blue-600"/>
                        </div>
                        <div>
                            <h1 className="
                                text-3xl
                                font-bold
                                text-slate-900
                            ">
                                {userSelected.Usuario}
                            </h1>
                            <p className="text-sm text-slate-500">
                                Información del usuario
                            </p>
                        </div>
                    </div>
                    <div>
                        {userSelected.Activo ? (
                            <span className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-full
                                border
                                border-green-100
                                bg-green-50
                                px-4
                                py-2
                                text-sm
                                font-semibold
                                text-green-600
                            ">
                                <CheckCircle2 className="h-4 w-4"/>
                                    Usuario activo
                            </span>
                        ) : (
                            <span className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-full
                                border
                                border-red-100
                                bg-red-50
                                px-4
                                py-2
                                text-sm
                                font-semibold
                                text-red-600
                            ">
                                <XCircle className="h-4 w-4"/>
                                Usuario inactivo
                            </span>
                        )}
                    </div>
                </div>
                <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    <InfoCard
                        icon={<ShieldCheck />}
                        title="Rol"
                        value={userSelected.Rol}
                    />
                    <InfoCard
                        icon={<Mail />}
                        title="Correo"
                        value={userSelected.Email || "Sin correo"}
                    />
                    <InfoCard
                        icon={<Phone />}
                        title="Teléfono"
                        value={userSelected.Telefono || "Sin teléfono"}
                    />
                    <InfoCard
                        icon={<CalendarDays />}
                        title="Fecha ingreso"
                        value={
                        userSelected.FechaIngreso
                        ? new Date(userSelected.FechaIngreso)
                            .toLocaleDateString()
                        : "No disponible"
                        }
                    />
                    <InfoCard
                        icon={<Clock />}
                        title="Último acceso"
                        value={
                        userSelected.UltimoAcceso
                        ? new Date(userSelected.UltimoAcceso)
                            .toLocaleString()
                        : "Sin registros"
                        }
                    />
                </div>
                <div className="mt-10 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6">
                    <h2 className="
                        flex
                        items-center
                        gap-2
                        text-lg
                        font-bold
                        text-slate-900
                    ">
                        <Building2 className="h-5 w-5 text-indigo-600"/>
                            Negocio asignado
                    </h2>
                    {userSelected.business ? (
                        <div className="mt-5 grid gap-4 md:grid-cols-3">
                        <div>
                            <p className="text-xs text-slate-500">
                                Nombre
                            </p>
                            <p className="font-semibold text-slate-900">
                                {userSelected.business.name}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">
                                Estado
                            </p>
                            <p className="
                            font-semibold
                            text-indigo-600
                            ">
                                {userSelected.business.status}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">
                                Creado
                            </p>
                            <p className="font-semibold text-slate-900">
                                {new Date(
                                    userSelected.business.createdAt
                                ).toLocaleDateString()}
                            </p>
                        </div>
                        </div>
                    ) : (
                        <p className="mt-4 text-sm text-slate-500">
                            Este usuario no tiene un negocio asignado.
                        </p>
                    )}
                    {user.Rol=="superAdmin" && (
                        <div className="mt-6 flex justify-end">
                        <button
                            onClick={onAssignBusiness}
                            className="rounded-xl border border-indigo-200 bg-white px-5 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
                        >
                            Cambiar negocio
                        </button>
                    </div>
                    )}
                </div>
            </div>
        </section>
    );
}