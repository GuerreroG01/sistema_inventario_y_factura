"use client";

import { useEffect, useState, useCallback } from "react";
import { getUser } from "@/services/userService";
import { User } from "@/types/User";
import { useAuth } from "@/app/(public)/auth/login/hooks/useAuth";

export function useUserDetail(id?: number) {
    const [userSelected, setUserSelected] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const loadUser = useCallback (async () => {
        try {
            setLoading(true);
            setError(null);

            const userId = id ?? user?.Id;
            if (!userId) {
                return;
            }
            const data = await getUser(userId);
            setUserSelected(data);
        } catch(error: any) {
            setError(error.message || "Error al obtener usuario");
        } finally {
            setLoading(false);
        }
    }, [id, user]);
    useEffect(() => {
        loadUser();
    }, [loadUser]);

    return { user, userSelected, loading, error, refetch: loadUser };
}