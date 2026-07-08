"use client";

import { useState, useEffect } from "react";
import { LogIn, User, Lock, Package, BarChart3, ShieldCheck } from "lucide-react";
import ModalError from "@/components/ModalError";

interface Props {
    loading:boolean;
    error:string|null;
    onSubmit:(usuario:string,clave:string)=>void|Promise<void>;
    showRegister:boolean;
}

export default function LoginForm({ loading, error, onSubmit, showRegister }:Props){
    const [usuario,setUsuario] = useState("");
    const [clave,setClave] = useState("");
    const [errorOpen,setErrorOpen] = useState(false);

    useEffect(()=>{
        if(error){
            setErrorOpen(true);
        }
    },[error]);

    const submit = async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        await onSubmit(usuario,clave);
    };

    return (
        <div
            className="
                min-h-screen
                w-full
                flex
                items-center
                justify-center
                bg-gradient-to-br
                from-gray-50
                via-white
                to-blue-50
                p-4
            "
        >
            <div
                className="
                    w-full
                    max-w-6xl
                    grid
                    grid-cols-1
                    lg:grid-cols-2
                    overflow-hidden
                    rounded-3xl
                    border
                    border-gray-100
                    bg-white
                    shadow-xl
                    shadow-gray-200/50
                "
            >
                <div
                    className="
                        hidden
                        lg:flex
                        flex-col
                        justify-between
                        p-12
                        bg-gradient-to-br
                        from-blue-600
                        to-indigo-700
                        text-white
                    "
                >
                    <div>

                        <div
                            className="
                                flex
                                items-center
                                gap-3
                                mb-10
                            "
                        >
                            <div
                                className="
                                    flex
                                    items-center
                                    justify-center
                                    w-14
                                    h-14
                                    rounded-2xl
                                    bg-white/20
                                    backdrop-blur
                                "
                            >
                                <Package
                                    className="
                                        w-7
                                        h-7
                                    "
                                />
                            </div>
                            <div>
                                <h1
                                    className="
                                        text-2xl
                                        font-bold
                                    "
                                >
                                    Sistema Gestión
                                </h1>
                                <p
                                    className="
                                        text-sm
                                        text-blue-100
                                    "
                                >
                                    Inventario y ventas
                                </p>
                            </div>
                        </div>
                        <h2
                            className="
                                text-4xl
                                font-bold
                                leading-tight
                                max-w-md
                            "
                        >
                            Controla tu negocio desde un solo lugar
                        </h2>
                        <p
                            className="
                                mt-5
                                text-blue-100
                                max-w-md
                                leading-relaxed
                            "
                        >
                            Administra productos, ventas, inventario,
                            rentabilidad y métricas importantes de tu negocio.
                        </p>
                    </div>
                    <div
                        className="
                            space-y-4
                        "
                    >
                        <div className="
                            flex
                            items-center
                            gap-3
                            text-sm
                        ">
                            <ShieldCheck
                                className="
                                    w-5
                                    h-5
                                "
                            />
                            Acceso seguro mediante autenticación
                        </div>
                        <div className="
                            flex
                            items-center
                            gap-3
                            text-sm
                        ">
                            <BarChart3
                                className="
                                    w-5
                                    h-5
                                "
                            />
                            Métricas y análisis en tiempo real
                        </div>
                    </div>
                </div>
                <div
                    className="
                        flex
                        items-center
                        justify-center

                        p-6
                        sm:p-10
                        lg:p-16
                    "
                >
                    <div
                        className="
                            w-full
                            max-w-md
                        "
                    >
                        <div className="
                            mb-8
                        ">
                            <div
                                className="
                                    flex
                                    lg:hidden
                                    items-center
                                    justify-center
                                    w-14
                                    h-14
                                    rounded-2xl
                                    bg-blue-50
                                    border
                                    border-blue-100
                                    mb-5
                                "
                            >
                                <Package
                                    className="
                                        w-7
                                        h-7
                                        text-blue-600
                                    "
                                />
                            </div>
                            <h2
                                className="
                                    text-3xl
                                    font-bold
                                    text-gray-900
                                "
                            >
                                Bienvenido
                            </h2>
                            <p
                                className="
                                    mt-2
                                    text-sm
                                    text-gray-500
                                "
                            >
                                Ingresa tus credenciales para continuar
                            </p>
                        </div>
                        <form
                            onSubmit={submit}
                            className="
                                space-y-5
                            "
                        >
                            <div>
                                <label className="
                                    text-xs
                                    font-semibold
                                    text-gray-600
                                ">
                                    Usuario
                                </label>
                                <div className="
                                    relative
                                    mt-2
                                ">
                                    <User
                                        className="
                                            absolute
                                            left-4
                                            top-1/2
                                            -translate-y-1/2
                                            w-5
                                            h-5
                                            text-gray-400
                                        "
                                    />
                                    <input
                                        value={usuario}
                                        onChange={(e)=>setUsuario(e.target.value)}
                                        className="
                                            w-full
                                            rounded-xl
                                            bg-gray-50
                                            border
                                            border-gray-200
                                            pl-12
                                            pr-4
                                            py-1.5
                                            text-sm
                                            outline-none
                                            transition
                                            focus:bg-white
                                            focus:border-blue-400
                                            focus:ring-4
                                            focus:ring-blue-100
                                        "
                                        placeholder="Usuario"
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
                                    Contraseña
                                </label>
                                <div className="
                                    relative
                                    mt-2
                                ">
                                    <Lock
                                        className="
                                            absolute
                                            left-4
                                            top-1/2
                                            -translate-y-1/2
                                            w-5
                                            h-5
                                            text-gray-400
                                        "
                                    />
                                    <input
                                        type="password"
                                        value={clave}
                                        onChange={(e)=>setClave(e.target.value)}
                                        className="
                                            w-full
                                            rounded-xl
                                            bg-gray-50
                                            border
                                            border-gray-200
                                            pl-12
                                            pr-4
                                            py-1.5
                                            text-sm
                                            outline-none
                                            transition
                                            focus:bg-white
                                            focus:border-blue-400
                                            focus:ring-4
                                            focus:ring-blue-100
                                        "
                                        placeholder="Contraseña"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                disabled={loading}
                                className="
                                    w-full
                                    rounded-xl
                                    bg-gradient-to-r
                                    from-blue-600
                                    to-indigo-600
                                    py-1.5
                                    text-sm
                                    font-bold
                                    text-white
                                    shadow-md
                                    shadow-blue-500/20
                                    transition-all
                                    hover:shadow-lg
                                    disabled:opacity-50
                                "
                            >
                                <span className="
                                    flex
                                    justify-center
                                    items-center
                                    gap-2
                                ">
                                    <LogIn
                                        className="w-5 h-5"
                                    />
                                    {
                                        loading
                                        ? "Ingresando..."
                                        : "Ingresar"
                                    }
                                </span>
                            </button>
                            {showRegister && (
                                <a
                                    href="/auth/register"
                                    className="
                                        mt-4
                                        block
                                        w-full
                                        rounded-xl
                                        border
                                        border-blue-200
                                        bg-blue-50
                                        py-2
                                        text-center
                                        text-sm
                                        font-bold
                                        text-blue-700
                                        transition-all
                                        hover:bg-blue-100
                                        active:scale-95
                                    "
                                >
                                    Crear administrador inicial
                                </a>
                            )}
                        </form>
                    </div>
                </div>
            </div>
            <ModalError
                open={errorOpen}
                title="Error al iniciar sesión"
                message={error ?? ""}
                onClose={()=>setErrorOpen(false)}
            />
        </div>

    );
}