"use client";

import { useState } from "react";
import UserDetail from "../allUsers/[id]/components/userDetail";
import { useUserDetail } from "../allUsers/[id]/hooks/useUserDetail";
import AssignBusinessModal from "../allUsers/[id]/components/AssignBusinessModal";

export default function ProfilePage() {
    const { user, userSelected, loading, error, refetch } = useUserDetail();
    const [openAssignBusiness, setOpenAssignBusiness] = useState(false);
    if (loading)
        return <p>Cargando...</p>;

    if (error)
        return <p>{error}</p>;

    if (!userSelected)
        return null;

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