"use client";

import { useRouter } from "next/navigation";
import LoginForm from "./components/LoginForm";
import { useLogin } from "./hooks/useLogin";
import { SystemStatus } from "../../Utils/SystemStatus";

export default function LoginPage() {
    const router = useRouter();

    const { login, loading, error } = useLogin();
    const { initialized, loading: loadingStatus } = SystemStatus();
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

    if (loadingStatus) {
        return null;
    }

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
                showRegister={!initialized}
            />
        </main>
    );
}