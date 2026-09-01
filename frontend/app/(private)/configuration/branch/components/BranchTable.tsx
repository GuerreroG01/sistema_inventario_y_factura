import { Building2, MapPin, Phone, Pencil, Power, Trash2 } from "lucide-react";
import { branchTypes } from "@/app/constants/branchTypes";
import { Branch } from "@/types/Branch";

type BranchTableProps = {
    branches: Branch[];

    onEdit: (branch: Branch) => void;
    onStatusChange: (branch: Branch) => void;
    onDelete: (branch: Branch) => void;
};

export default function BranchTable({
    branches, onEdit, onStatusChange, onDelete
}: BranchTableProps) {
    return (
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
            <div
                className="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-gray-100
                    px-6
                    py-5
                "
            >
                <div>
                    <h2
                        className="
                            text-lg
                            font-bold
                            text-gray-900
                        "
                    >
                        Sucursales registradas
                    </h2>

                    <p
                        className="
                            mt-1
                            text-sm
                            text-gray-500
                        "
                    >
                        Administra las sucursales de esta empresa.
                    </p>
                </div>

                <span
                    className="
                        rounded-full
                        bg-slate-100
                        px-4
                        py-2
                        text-xs
                        font-semibold
                        text-slate-600
                    "
                >
                    {branches.length} registros
                </span>
            </div>
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
                        Crea la primera sucursal utilizando el formulario superior.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead
                            className="
                                border-b
                                border-gray-100
                                bg-gray-50
                            "
                        >
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    ID
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Sucursal
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Tipo
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Ubicación
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Estado
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Creado
                                </th>

                                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Acciones
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {branches.map((branch) => (
                                <tr
                                    key={branch.id}
                                    className="
                                        border-t
                                        border-gray-100
                                        transition-colors
                                        hover:bg-slate-50
                                    "
                                >
                                    <td className="px-6 py-5 font-mono text-sm text-gray-600">
                                        #{branch.id}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {branch.name}
                                            </p>

                                            {branch.phone && (
                                                <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                                    <Phone className="h-3 w-3" />
                                                    {branch.phone}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        {(() => {
                                            const type = branchTypes.find(
                                                (type) =>
                                                    type.value === branch.type
                                            );

                                            return (
                                                <span
                                                    className={`
                                                        inline-flex
                                                        items-center
                                                        rounded-full
                                                        px-3
                                                        py-1
                                                        text-xs
                                                        font-semibold
                                                        ${
                                                            type?.className ??
                                                            "bg-slate-100 text-slate-600"
                                                        }
                                                    `}
                                                >
                                                    {type?.label ?? branch.type}
                                                </span>
                                            );
                                        })()}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-start gap-2">
                                            <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />

                                            <div>
                                                <p className="text-sm font-medium text-gray-800">
                                                    {branch.city}
                                                </p>

                                                <p className="text-xs text-gray-500">
                                                    {branch.country}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        {branch.status === "ACTIVE" ? (
                                            <span
                                                className="
                                                    inline-flex
                                                    items-center
                                                    rounded-full
                                                    bg-emerald-50
                                                    px-3
                                                    py-1
                                                    text-xs
                                                    font-semibold
                                                    text-emerald-700
                                                "
                                            >
                                                Activa
                                            </span>
                                        ) : (
                                            <span
                                                className="
                                                    inline-flex
                                                    items-center
                                                    rounded-full
                                                    bg-rose-50
                                                    px-3
                                                    py-1
                                                    text-xs
                                                    font-semibold
                                                    text-rose-700
                                                "
                                            >
                                                Inactiva
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 text-sm text-gray-500">
                                        {new Date(
                                            branch.createdAt
                                        ).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => onEdit(branch)}
                                                aria-label="Editar sucursal"
                                                title="Editar sucursal"
                                                className="
                                                    inline-flex
                                                    h-9
                                                    w-9
                                                    items-center
                                                    justify-center
                                                    rounded-xl
                                                    border
                                                    border-blue-200
                                                    bg-blue-50
                                                    text-blue-600
                                                    transition-all
                                                    duration-200
                                                    hover:border-blue-300
                                                    hover:bg-blue-100
                                                    hover:text-blue-700
                                                    active:scale-95
                                                    focus:outline-none
                                                    focus:ring-2
                                                    focus:ring-blue-200
                                                "
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onStatusChange(branch)
                                                }
                                                aria-label={
                                                    branch.status === "ACTIVE"
                                                        ? "Desactivar sucursal"
                                                        : "Activar sucursal"
                                                }
                                                title={
                                                    branch.status === "ACTIVE"
                                                        ? "Desactivar sucursal"
                                                        : "Activar sucursal"
                                                }
                                                className="
                                                    inline-flex
                                                    h-9
                                                    w-9
                                                    items-center
                                                    justify-center
                                                    rounded-xl
                                                    border
                                                    border-amber-200
                                                    bg-amber-50
                                                    text-amber-600
                                                    transition-all
                                                    duration-200
                                                    hover:border-amber-300
                                                    hover:bg-amber-100
                                                    hover:text-amber-700
                                                    active:scale-95
                                                    focus:outline-none
                                                    focus:ring-2
                                                    focus:ring-amber-200
                                                "
                                            >
                                                <Power className="h-4 w-4" />
                                            </button>

                                            <button
                                                type="button"
                                                disabled={branch.type === "MAIN"}
                                                onClick={() => onDelete(branch)}
                                                aria-label="Eliminar sucursal"
                                                title={
                                                    branch.type === "MAIN"
                                                        ? "La sucursal principal no se puede eliminar"
                                                        : "Eliminar sucursal"
                                                }
                                                className="
                                                    inline-flex
                                                    h-9
                                                    w-9
                                                    items-center
                                                    justify-center
                                                    rounded-xl
                                                    border
                                                    border-red-200
                                                    bg-red-50
                                                    text-red-600
                                                    transition-all
                                                    duration-200
                                                    hover:border-red-300
                                                    hover:bg-red-100
                                                    hover:text-red-700
                                                    active:scale-95
                                                    focus:outline-none
                                                    focus:ring-2
                                                    focus:ring-red-200
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-40
                                                "
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}