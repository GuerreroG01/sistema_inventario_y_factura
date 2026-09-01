"use client";

import { useState } from "react";
import UserDetail from "../allUsers/[id]/components/userDetail";
import { useUserDetail } from "../allUsers/[id]/hooks/useUserDetail";
import AssignBusinessModal from "../allUsers/[id]/components/AssignBusinessModal";
import AssignBranchModal from "../allUsers/[id]/components/AssignBranchModal";
export default function ProfilePage() {
    const { user, userSelected, loading, error, refetch } = useUserDetail();
    const [openAssignBusiness, setOpenAssignBusiness] = useState(false);
    const [openAssignBranch, setOpenAssignBranch] = useState(false);
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
                onAssignBranch={() => setOpenAssignBranch(true)}
            />

            <AssignBusinessModal
                open={openAssignBusiness}
                userId={userSelected.Id}
                onClose={() => setOpenAssignBusiness(false)}
                onSuccess={() => {
                    refetch();
                }}
            />
            
            {userSelected.business_id !== undefined && (
                <AssignBranchModal
                    open={openAssignBranch}
                    userId={userSelected.Id}
                    businessId={userSelected.business_id}
                    onClose={() => setOpenAssignBranch(false)}
                    onSuccess={() => {
                        refetch();
                    }}
                />
            )}
        </>
    );
}