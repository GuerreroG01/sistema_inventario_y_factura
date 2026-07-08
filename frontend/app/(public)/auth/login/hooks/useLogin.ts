import { useState } from "react";
import { login } from "@/services/authService";
import { User } from "@/types/Auth";
import Cookies from "js-cookie";

export function useLogin() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);

    const handleLogin = async ( usuario: string, clave: string ) => {
        try {
            setLoading(true);
            setError(null);

            const response = await login( usuario, clave );

            //Para el api.ts
            localStorage.setItem( "token", response.token );
            localStorage.setItem( "user",JSON.stringify(response.usuario));
            //Para el middleware.ts
            Cookies.set(
                "token",
                response.token,
                {
                    expires: 1,
                    sameSite: "lax",
                    secure: process.env.NODE_ENV === "production"
                }
            );

            setUser(response.usuario);
            return response;

        } catch (err: any) {
            const message = err.message || "Error al iniciar sesión";
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        login: handleLogin,loading,error,user
    };
}