import axios from "axios";
import { LoginResponse, RegisterRequest, RegisterResponse, SystemStatusResponse } from "../types/Auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error("La variable NEXT_PUBLIC_API_BASE_URL no está definida");
}
const api = axios.create({
    baseURL: `${API_BASE_URL}/auth`,
    headers: {
        "Content-Type": "application/json",
    },
});

export async function login( usuario: string, clave: string ): Promise<LoginResponse> {
    try {
        const { data } = await api.post<LoginResponse>("/login", {usuario,clave});
        return data;

    } catch (error: any) {
        throw new Error(error?.response?.data?.message ||"Error al iniciar sesión");
    }
}

export async function register( usuarioData: RegisterRequest ): Promise<RegisterResponse> {
    try {
        const { data } = await api.post<RegisterResponse>( "/register", usuarioData);
        return data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message ||"Error al registrar usuario");
    }
}

export async function getSystemStatus(): Promise<SystemStatusResponse> {
    try {
        const { data } = await api.get<SystemStatusResponse>(
            "/status"
        );
        return data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message ||
            "Error al obtener estado del sistema"
        );
    }
}