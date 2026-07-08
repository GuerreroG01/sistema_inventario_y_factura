"use client";

import { useRouter } from "next/navigation";
import LoginForm from "./components/LoginForm";
import { useLogin } from "./hooks/useLogin";

export default function LoginPage() {
    const router = useRouter();

    const {
        login,
        loading,
        error,
    } = useLogin();

    const handleLogin = async (
        usuario: string,
        clave: string
    ) => {
        try {
            await login(usuario, clave);
            router.push("/");

        } catch {
            // El LoginForm muestra el ModalError automáticamente.
        }
    };

    return (
        <main className="
            min-h-screen
            bg-gray-100
            flex
            items-center
            justify-center
            px-4
        ">
            <LoginForm
                loading={loading}
                error={error}
                onSubmit={handleLogin}
            />
        </main>
    );
}