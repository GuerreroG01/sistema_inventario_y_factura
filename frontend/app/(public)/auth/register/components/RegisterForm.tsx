"use client";

import { RegisterRequest, User } from "@/types/Auth";
import { UserRoundPlus } from 'lucide-react';
import { useEffect, useState } from "react";
import ModalSuccess from "@/components/ModalSuccess";
import ModalError from "@/components/ModalError";
import { useRouter } from "next/navigation";

interface Props {
    data: RegisterRequest;
    loading: boolean;
    error: string | null;
    user: User | null;
    onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => void;
    onSubmit: (
        data: RegisterRequest
    ) => void;
    initialized: boolean | null;
}

export default function RegisterForm({ data, loading, error, user, onChange, onSubmit, initialized }: Props) {
    const submit = (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();
        onSubmit(data);
    };
    const [successOpen, setSuccessOpen] = useState(false);
    const [errorOpen, setErrorOpen] = useState(false);
    const router = useRouter();
    useEffect(() => {
        if (user) {
            setSuccessOpen(true);
        }
    }, [user]);
    useEffect(() => {
        if (error) {
            setErrorOpen(true);
        }
    }, [error]);

    return (
        <div className="
            w-full
        ">
            <div className="
                w-full
                bg-white
                rounded-2xl
                border
                border-gray-100
                shadow-sm
                p-6
            ">
                <div className="
                    flex
                    items-center
                    gap-3
                    mb-6
                ">
                    <div className="
                        flex
                        items-center
                        justify-center
                        w-11
                        h-11
                        rounded-xl
                        bg-blue-50
                    ">
                        <UserRoundPlus 
                            className="
                                w-6
                                h-6
                                text-blue-600
                            "
                        />
                    </div>
                    <div>
                        <h2 className="
                            text-xl
                            font-bold
                            text-gray-900
                        ">
                            Crear usuario
                        </h2>
                        <p className="
                            text-xs
                            font-medium
                            text-gray-500
                        ">
                            Registra un nuevo usuario en el sistema
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={submit}
                    className="
                        space-y-5
                    "
                >
                    <div className="
                        grid
                        grid-cols-1
                        md:grid-cols-2
                        gap-4
                    ">
                        <div>
                            <label className="
                                text-xs
                                font-semibold
                                text-gray-600
                            ">
                                Usuario
                            </label>
                            <input
                                name="Usuario"
                                value={data.Usuario}
                                onChange={onChange}
                                placeholder="Nombre usuario"
                                className="
                                    mt-1
                                    w-full
                                    rounded-xl
                                    bg-gray-50
                                    border
                                    border-gray-200
                                    px-4
                                    py-3
                                    text-sm
                                    text-gray-800
                                    outline-none
                                    transition
                                    focus:bg-white
                                    focus:border-blue-400
                                    focus:ring-4
                                    focus:ring-blue-100
                                "
                                required
                            />
                        </div>
                        <div>
                            <label className="
                                text-xs
                                font-semibold
                                text-gray-600
                            ">
                                Teléfono
                            </label>
                            <input
                                name="Telefono"
                                value={data.Telefono}
                                onChange={onChange}
                                placeholder="0000-0000"
                                className="
                                    mt-1
                                    w-full
                                    rounded-xl
                                    bg-gray-50
                                    border
                                    border-gray-200
                                    px-4
                                    py-3
                                    text-sm
                                    text-gray-800
                                    outline-none
                                    transition
                                    focus:bg-white
                                    focus:border-blue-400
                                    focus:ring-4
                                    focus:ring-blue-100
                                "
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="
                            text-xs
                            font-semibold
                            text-gray-600
                        ">
                            Correo electrónico
                        </label>
                        <input
                            name="Email"
                            type="email"
                            value={data.Email}
                            onChange={onChange}
                            placeholder="correo@empresa.com"
                            className="
                                mt-1
                                w-full
                                rounded-xl
                                bg-gray-50
                                border
                                border-gray-200
                                px-4
                                py-3
                                text-sm
                                text-gray-800
                                outline-none
                                transition
                                focus:bg-white
                                focus:border-blue-400
                                focus:ring-4
                                focus:ring-blue-100
                            "
                            required
                        />
                    </div>
                    <div>

                        <label className="
                            text-xs
                            font-semibold
                            text-gray-600
                        ">
                            Contraseña
                        </label>
                        <input
                            name="Clave"
                            type="password"
                            value={data.Clave}
                            onChange={onChange}
                            placeholder="********"
                            className="
                                mt-1
                                w-full
                                rounded-xl
                                bg-gray-50
                                border
                                border-gray-200
                                px-4
                                py-3
                                text-sm
                                text-gray-800
                                outline-none
                                transition
                                focus:bg-white
                                focus:border-blue-400
                                focus:ring-4
                                focus:ring-blue-100
                            "
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="
                            w-full
                            rounded-xl
                            bg-gradient-to-r
                            from-blue-600
                            to-indigo-600
                            py-3
                            text-sm
                            font-bold
                            text-white
                            shadow-md
                            shadow-blue-500/20
                            transition
                            hover:from-blue-700
                            hover:to-indigo-700
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                        "
                    >
                        {
                            loading
                            ? "Creando usuario..."
                            : "Registrar usuario"
                        }
                    </button>
                </form>
            </div>
            <ModalSuccess
                open={successOpen}
                title="Usuario creado"
                message={`El usuario "${user?.Usuario}" fue registrado correctamente.`}
                onClose={() => {
                    setSuccessOpen(false);
                    if (initialized === false) {
                        router.push("/auth/login");
                    } else {
                        router.push("/");
                    }
                }}
            />
            <ModalError
                open={errorOpen}
                title="Error al crear usuario"
                message={error ?? ""}
                onClose={() => setErrorOpen(false)}
            />
        </div>
    );
}