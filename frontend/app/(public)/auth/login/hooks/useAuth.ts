"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { logout as logoutService } from "@/services/authService";
import { useRouter } from "next/navigation";

export function useAuth() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);


    const logout = async () => {
        const token = localStorage.getItem("token");

        try {
            if (token) {
                await logoutService(token);
            }
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            Cookies.remove("token");

            router.push("/auth/login");
            router.refresh();
        }
    };

    return {user,logout};
}