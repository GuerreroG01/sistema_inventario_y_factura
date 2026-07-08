import { useState } from "react";
import { register } from "@/services/authService";
import { RegisterRequest, User } from "@/types/Auth";

export function useRegister() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);

    const handleRegister = async ( data: RegisterRequest ) => {
        try {
            setLoading(true);
            setError(null);

            const response = await register(data);
            setUser(response.usuario);
            return response;

        } catch (err: any) {
            const message = err.message || "Error al registrar usuario";
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        register: handleRegister, loading, error, user
    };
}