import { FormEvent } from "react";
import { Branch, CreateBranchData } from "@/types/Branch";
import { Pencil, Plus, X } from "lucide-react";
import { BranchType } from "@/types/Branch";
import { branchTypes } from "@/app/constants/branchTypes";

interface BranchFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateBranchData) => void;
    branches: Branch[];
    loading: boolean;
    branch?: Branch | null;
}
export default function BranchForm({
    isOpen, onClose, onSubmit, branches, loading, branch
}: BranchFormProps) {
    if (!isOpen) {
        return null;
    }
    const isEditing = !!branch;

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        const type = formData.get("type");

        const branchType: BranchType =
            type === "MAIN" ||
            type === "SECONDARY" ||
            type === "WAREHOUSE" ||
            type === "OFFICE"
                ? type
                : "SECONDARY";

        onSubmit({
            name: String(formData.get("name") || ""),
            type: branchType,
            country: String(formData.get("country") || ""),
            city: String(formData.get("city") || ""),
            address:
                String(formData.get("address") || "") ||
                undefined,
            phone:
                String(formData.get("phone") || "") ||
                undefined,
        });

        e.currentTarget.reset();
    };

    return (
        <div
            className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                bg-black/40
                p-4
            "
        >
            <div
                className="
                    w-full
                    max-w-2xl
                    rounded-2xl
                    bg-white
                    p-6
                    shadow-xl
                "
            >
                <div
                    className="
                        mb-6
                        flex
                        items-center
                        justify-between
                    "
                >
                    <div>
                        <h2
                            className="
                                text-xl
                                font-bold
                                text-gray-900
                            "
                        >
                            {isEditing
                                ? "Editar sucursal"
                                : "Crear sucursal"}
                        </h2>

                        <p
                            className="
                                mt-1
                                text-sm
                                text-gray-500
                            "
                        >
                            {isEditing
                                ? "Actualiza la información de la sucursal."
                                : "Registra una nueva sucursal."}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            rounded-xl
                            p-2
                            text-gray-400
                            transition-colors
                            hover:bg-gray-100
                            hover:text-gray-600
                        "
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="
                        grid
                        grid-cols-1
                        gap-4
                        md:grid-cols-2
                    "
                >
                    <input
                        name="name"
                        required
                        defaultValue={branch?.name ?? ""}
                        placeholder="Nombre de la sucursal..."
                        className="
                            rounded-xl
                            border
                            border-gray-200
                            px-4
                            py-3
                            text-sm
                            outline-none
                            transition-all
                            focus:border-blue-300
                            focus:ring-4
                            focus:ring-blue-100
                        "
                    />

                    <select
                        name="type"
                        defaultValue={branch?.type ?? "SECONDARY"}
                        className="
                            rounded-xl
                            border
                            border-gray-200
                            bg-white
                            px-4
                            py-3
                            text-sm
                            outline-none
                            transition-all
                            focus:border-blue-300
                            focus:ring-4
                            focus:ring-blue-100
                        "
                    >
                        {branchTypes.map(type => (
                            <option
                                key={type.value}
                                value={type.value}
                                disabled={
                                    type.value === "MAIN" &&
                                    branches.some(
                                        currentBranch =>
                                            currentBranch.type === "MAIN" &&
                                            currentBranch.id !== branch?.id
                                    )
                                }
                            >
                                {type.label}
                            </option>
                        ))}
                    </select>

                    <input
                        name="country"
                        required
                        defaultValue={branch?.country ?? ""}
                        placeholder="País..."
                        className="
                            rounded-xl
                            border
                            border-gray-200
                            px-4
                            py-3
                            text-sm
                            outline-none
                            transition-all
                            focus:border-blue-300
                            focus:ring-4
                            focus:ring-blue-100
                        "
                    />

                    <input
                        name="city"
                        required
                        defaultValue={branch?.city ?? ""}
                        placeholder="Ciudad..."
                        className="
                            rounded-xl
                            border
                            border-gray-200
                            px-4
                            py-3
                            text-sm
                            outline-none
                            transition-all
                            focus:border-blue-300
                            focus:ring-4
                            focus:ring-blue-100
                        "
                    />

                    <input
                        name="address"
                        defaultValue={branch?.address ?? ""}
                        placeholder="Dirección..."
                        className="
                            rounded-xl
                            border
                            border-gray-200
                            px-4
                            py-3
                            text-sm
                            outline-none
                            transition-all
                            focus:border-blue-300
                            focus:ring-4
                            focus:ring-blue-100
                        "
                    />

                    <input
                        name="phone"
                        defaultValue={branch?.phone ?? ""}
                        placeholder="Teléfono..."
                        className="
                            rounded-xl
                            border
                            border-gray-200
                            px-4
                            py-3
                            text-sm
                            outline-none
                            transition-all
                            focus:border-blue-300
                            focus:ring-4
                            focus:ring-blue-100
                        "
                    />

                    <div
                        className="
                            flex
                            justify-end
                            gap-3
                            md:col-span-2
                        "
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            className="
                                rounded-xl
                                border
                                border-gray-200
                                px-5
                                py-3
                                text-sm
                                font-semibold
                                text-gray-600
                                transition-colors
                                hover:bg-gray-50
                            "
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-blue-600
                                px-6
                                py-3
                                text-sm
                                font-semibold
                                text-white
                                transition-all
                                hover:bg-blue-700
                                active:scale-95
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            {isEditing ? (
                                <Pencil className="h-4 w-4" />
                            ) : (
                                <Plus className="h-4 w-4" />
                            )}

                            {isEditing
                                ? "Guardar cambios"
                                : "Crear sucursal"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}