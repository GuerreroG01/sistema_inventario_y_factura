"use client";

import UserManager from "./components/UserManager";
import { useUsers } from "./hooks/useUsers";

export default function UsersPage() {
    const { users, total, page, totalPages, loading, error } = useUsers();

    if(loading){
        return (
            <div className="
                rounded-3xl
                border
                bg-white
                p-8
                text-center
                text-slate-500
            ">
                Cargando usuarios...
            </div>
        );
    }

    if(error){
        return (
            <div className="
                rounded-3xl
                border
                bg-white
                p-8
                text-center
                text-red-500
            ">
                {error}
            </div>
        );
    }

    return (
        <UserManager
            users={users}
            total={total}
            page={page}
            totalPages={totalPages}
        />
    );
}