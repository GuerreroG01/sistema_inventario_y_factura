"use client";

import { useState } from "react";
import { Building2, Plus, Activity } from "lucide-react";
import { useBranches } from "../hooks/useBranches";
import BranchStats from "./BranchStats";
import BranchForm from "./BranchForm";
import BranchTable from "./BranchTable";

type BranchManagerProps = ReturnType<typeof useBranches> & {
    businessId: number;
};

export default function BranchManager({
    branches, loading, handleCreate, handleUpdate, handleStatus, handleDelete, activeBranches,
    selectedBranch, setSelectedBranch, setIsDeleteOpen, branchStats
}: BranchManagerProps) {
    const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
    return (
        <section
            className="
                relative
                overflow-hidden
                rounded-3xl
                border
                border-gray-200/80
                bg-white
                p-6
                md:p-8
                shadow-sm
            "
        >
            <div
                className="
                    absolute
                    -top-32
                    -left-32
                    h-64
                    w-64
                    rounded-full
                    bg-blue-50
                    blur-3xl
                "
            />
            <div
                className="
                    absolute
                    -bottom-32
                    -right-32
                    h-64
                    w-64
                    rounded-full
                    bg-indigo-50
                    blur-3xl
                "
            />
            <div className="relative z-10">
                <div
                    className="
                        flex
                        flex-col
                        md:flex-row
                        justify-between
                        gap-5
                        mb-8
                    "
                >
                    <div>
                        <h1
                            className="
                                flex
                                items-center
                                gap-3
                                text-2xl
                                font-bold
                                text-gray-900
                            "
                        >
                            <Building2
                                className="
                                    h-6
                                    w-6
                                    text-blue-600
                                "
                            />
                            Administración de Sucursales
                        </h1>

                        <p
                            className="
                                mt-2
                                text-sm
                                text-gray-500
                            "
                        >
                            Gestiona las sucursales de la empresa seleccionada.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-full
                                bg-blue-50
                                px-4
                                py-2
                                text-xs
                                font-semibold
                                text-blue-700
                                h-fit
                            "
                        >
                            <Activity className="h-4 w-4" />
                            {branchStats.total} sucursales registradas
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setSelectedBranch(null);
                                setIsBranchModalOpen(true);
                            }}
                            aria-label="Nueva sucursal"
                            title="Nueva sucursal"
                            className="
                                group
                                inline-flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                border
                                border-violet-200/70
                                bg-violet-50/60
                                text-violet-600
                                shadow-sm
                                shadow-violet-100/50
                                backdrop-blur-md
                                transition-all
                                duration-300
                                hover:-translate-y-0.5
                                hover:border-violet-300
                                hover:bg-violet-100/70
                                hover:text-violet-700
                                hover:shadow-lg
                                hover:shadow-violet-200/50
                                active:scale-95
                                focus:outline-none
                                focus:ring-4
                                focus:ring-violet-100
                                sm:h-11
                                sm:w-11
                                md:h-12
                                md:w-12
                                md:rounded-2xl
                            "
                        >
                            <Plus
                                className="
                                    h-5
                                    w-5
                                    transition-all
                                    duration-300
                                    group-hover:rotate-90
                                    group-hover:scale-110

                                    sm:h-[21px]
                                    sm:w-[21px]

                                    md:h-[22px]
                                    md:w-[22px]
                                "
                            />
                        </button>
                    </div>
                </div>
                <BranchStats
                    branchStats={branchStats}
                />
                <div
                    className="
                        overflow-hidden
                        rounded-2xl
                        border
                        border-gray-100
                        bg-white
                        shadow-sm
                    "
                >
                    {branches.length === 0 ? (

                        <div
                            className="
                                flex
                                flex-col
                                items-center
                                justify-center
                                py-20
                            "
                        >
                            <Building2
                                className="
                                    h-14
                                    w-14
                                    text-gray-300
                                "
                            />

                            <h3
                                className="
                                    mt-5
                                    text-lg
                                    font-semibold
                                    text-gray-800
                                "
                            >
                                No hay sucursales registradas
                            </h3>

                            <p
                                className="
                                    mt-2
                                    text-sm
                                    text-gray-500
                                "
                            >
                                Crea la primera sucursal presionando el botón +.
                            </p>
                        </div>
                    ) : (
                        <BranchTable
                            branches={branches}
                            onEdit={(branch) => {
                                setSelectedBranch(branch);
                                setIsBranchModalOpen(true);
                            }}
                            onStatusChange={(branch) => {
                                handleStatus(branch.id, branch.status);
                            }}
                            onDelete={(branch) => {
                                setSelectedBranch(branch);
                                setIsDeleteOpen(true);
                            }}
                        />
                    )}
                </div>
            </div>
            {isBranchModalOpen && (
                <BranchForm
                    isOpen={isBranchModalOpen}
                    onClose={() => {
                        setIsBranchModalOpen(false);
                        setSelectedBranch(null);
                    }}
                    onSubmit={async (data) => {
                        if (selectedBranch) {
                            await handleUpdate(selectedBranch.id, data);
                        } else {
                            await handleCreate(data);
                        }
                        setIsBranchModalOpen(false);
                        setSelectedBranch(null);
                    }}
                    branches={branches}
                    loading={loading}
                    branch={selectedBranch}
                />
            )}
        </section>
    );
}