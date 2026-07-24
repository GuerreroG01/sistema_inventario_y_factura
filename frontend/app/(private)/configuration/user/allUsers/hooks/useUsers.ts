"use client";

import { useEffect, useState } from "react";
import { getUsers } from "@/services/userService";
import { User } from "@/types/User";


export function useUsers() {

    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);



    async function loadUsers(pageNumber = 1) {

        try {

            setLoading(true);
            setError(null);


            const data = await getUsers(pageNumber);


            setUsers(data.users);
            setTotal(data.total);
            setPage(data.page);
            setTotalPages(data.totalPages);


        } catch(error:any) {

            setError(
                error.message || "Error al obtener usuarios"
            );

        } finally {

            setLoading(false);

        }

    }


    useEffect(() => {

        loadUsers();

    }, []);



    return {
        users,
        total,
        page,
        totalPages,

        loading,
        error,

        reload: loadUsers
    };
}