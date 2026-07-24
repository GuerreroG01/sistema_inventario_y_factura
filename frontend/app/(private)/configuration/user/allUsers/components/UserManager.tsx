"use client";

import { Users, ShieldCheck, CheckCircle2, XCircle, Mail, Phone, CalendarDays } from "lucide-react";
import { User } from "@/types/User";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
    users: User[];
    total: number;
    page: number;
    totalPages: number;
};

export default function UserManager({ users, total, page, totalPages }: Props) {
    const router = useRouter();
    return (
        <section className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-6 md:p-8 shadow-sm">
        
            <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-blue-50 blur-3xl" />
            <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-indigo-50 blur-3xl" />

            <div className="relative z-10">

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                <div>
                    <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-900">
                    <Users className="h-8 w-8 text-slate-600" />
                        Usuarios registrados
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Consulta y administra los usuarios disponibles en la plataforma.
                    </p>
                </div>


                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 w-fit">
                    {total} usuarios encontrados
                </div>

                </div>

                <div className="mt-10 overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    <thead>
                    <tr className="border-b border-gray-100 text-left text-xs uppercase text-slate-500">
                        <th className="px-4 py-4">Usuario</th>
                        <th className="px-4 py-4">Rol</th>
                        <th className="px-4 py-4">Estado</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user) => (
                        <tr
                            key={user.Id}
                            onClick={() =>
                                router.push(`/configuration/user/allUsers/${user.Id}`)
                            }
                            className="
                                group
                                relative
                                cursor-pointer
                                overflow-hidden
                                border-b
                                border-gray-100
                                transition-colors
                                duration-300
                                hover:bg-blue-50/40
                            "
                        >
                            <td className="relative px-4 py-5">
                                <span
                                    className="
                                        pointer-events-none
                                        absolute
                                        inset-0
                                        -translate-x-full
                                        bg-gradient-to-r
                                        from-transparent
                                        via-white/60
                                        to-transparent
                                        transition-transform
                                        duration-700
                                        ease-out
                                        group-hover:translate-x-full
                                    "
                                />
                                <span
                                    className="
                                        absolute
                                        left-0
                                        top-0
                                        h-full
                                        w-[3px]
                                        origin-top
                                        scale-y-0
                                        rounded-r-full
                                        bg-gradient-to-b
                                        from-blue-400
                                        via-indigo-500
                                        to-purple-500
                                        transition-transform
                                        duration-500
                                        ease-out
                                        group-hover:scale-y-100
                                    "
                                />
                                <div className="relative flex items-center gap-3">
                                    <div
                                        className="
                                            flex
                                            h-11
                                            w-11
                                            items-center
                                            justify-center
                                            rounded-xl
                                            border
                                            border-blue-100
                                            bg-blue-50
                                            transition-all
                                            duration-500
                                            group-hover:border-blue-200
                                            group-hover:bg-blue-100
                                            group-hover:shadow-[0_0_25px_rgba(59,130,246,0.35)]
                                        "
                                    >
                                        <Users
                                            className="
                                                h-5
                                                w-5
                                                text-blue-600
                                                transition-all
                                                duration-500
                                                group-hover:rotate-[15deg]
                                                group-hover:text-blue-700
                                            "
                                        />
                                    </div>
                                    <div>
                                        <p
                                            className="
                                                font-semibold
                                                text-slate-900
                                                transition-colors
                                                duration-300
                                                group-hover:text-blue-700
                                            "
                                        >
                                            {user.Usuario}
                                        </p>
                                        {user.business && (
                                            <p
                                                className="
                                                    text-xs
                                                    text-slate-500
                                                    transition-colors
                                                    duration-300
                                                    group-hover:text-slate-700
                                                "
                                            >
                                                {user.business.name}
                                            </p>
                                        )}
                                    </div>
                                    <span
                                        className="
                                            ml-auto
                                            flex
                                            items-center
                                            gap-1
                                            text-xs
                                            font-semibold
                                            text-blue-600
                                            opacity-0
                                            transition-all
                                            duration-300
                                            group-hover:opacity-100
                                        "
                                    >
                                        Abrir
                                        <span
                                            className="
                                                transition-transform
                                                duration-300
                                                group-hover:translate-x-1
                                            "
                                        >
                                            →
                                        </span>
                                    </span>
                                </div>
                            </td>
                            <td className="px-4 py-5">
                                <span
                                    className="
                                        inline-flex
                                        items-center
                                        gap-2
                                        rounded-full
                                        border
                                        border-indigo-100
                                        bg-indigo-50
                                        px-3
                                        py-1
                                        text-xs
                                        font-semibold
                                        text-indigo-600
                                        transition-all
                                        duration-300
                                        group-hover:shadow-[0_0_18px_rgba(99,102,241,0.3)]
                                    "
                                >
                                    <ShieldCheck
                                        className="
                                            h-4
                                            w-4
                                            transition-transform
                                            duration-300
                                            group-hover:rotate-12
                                        "
                                    />
                                    {user.Rol}
                                </span>
                            </td>
                            <td className="px-4 py-5">
                                {user.Activo ? (
                                    <span
                                        className="
                                            inline-flex
                                            items-center
                                            gap-2
                                            rounded-full
                                            border
                                            border-green-100
                                            bg-green-50
                                            px-3
                                            py-1
                                            text-xs
                                            font-semibold
                                            text-green-600
                                            transition-all
                                            duration-300
                                            group-hover:shadow-[0_0_18px_rgba(34,197,94,0.3)]
                                        "
                                    >
                                        <CheckCircle2
                                            className="
                                                h-4
                                                w-4
                                                transition-transform
                                                duration-300
                                                group-hover:scale-110
                                            "
                                        />
                                        Activo
                                    </span>
                                ) : (
                                    <span
                                        className="
                                            inline-flex
                                            items-center
                                            gap-2
                                            rounded-full
                                            border
                                            border-red-100
                                            bg-red-50
                                            px-3
                                            py-1
                                            text-xs
                                            font-semibold
                                            text-red-600
                                            transition-all
                                            duration-300
                                            group-hover:shadow-[0_0_18px_rgba(239,68,68,0.3)]
                                        "
                                    >
                                        <XCircle
                                            className="
                                                h-4
                                                w-4
                                                transition-transform
                                                duration-300
                                                group-hover:scale-110
                                            "
                                        />
                                        Inactivo
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                    {users.length === 0 && (
                        <tr>
                            <td
                                colSpan={5}
                                className="py-12 text-center text-sm text-slate-500"
                            >
                                No hay usuarios registrados.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
                </div>
                <div className="
                    mt-6
                    flex
                    items-center
                    justify-between
                    text-sm
                    text-slate-500
                ">
                <span>
                    Página {page} de {totalPages}
                </span>
                </div>
            </div>
        </section>
    );
}