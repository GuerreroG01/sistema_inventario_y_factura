"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import UserDetail from "./components/userDetail";
import { useUserDetail } from "./hooks/useUserDetail";
import AssignBusinessModal from "./components/AssignBusinessModal";

export default function DetailPage() {
    const params = useParams();
    const id = Number(params.id);
    const { user, userSelected, loading, error, refetch } = useUserDetail(id);
    const [openAssignBusiness, setOpenAssignBusiness] = useState(false);
    if (loading) {
        return (
            <div className=" rounded-3xl border border-gray-200 bg-white p-8 text-centertext-slate-500">
                Cargando usuario...
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-600">
                {error}
            </div>
        );
    }

    if (!userSelected) {
        return null;
    }
    return (
        <>
            <UserDetail
                user={user}
                userSelected={userSelected}
                onAssignBusiness={() => setOpenAssignBusiness(true)}
            />

            <AssignBusinessModal
                open={openAssignBusiness}
                userId={userSelected.Id}
                onClose={() => setOpenAssignBusiness(false)}
                onSuccess={() => {
                    refetch();
                }}
            />
        </>
    );
}