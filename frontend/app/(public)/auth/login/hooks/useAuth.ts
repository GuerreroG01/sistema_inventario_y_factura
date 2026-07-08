"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
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


    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        Cookies.remove("token");

        router.push("/auth/login");
        router.refresh();
    };

    return {user,logout};
}