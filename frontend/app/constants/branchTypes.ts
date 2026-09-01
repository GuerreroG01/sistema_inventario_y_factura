import { BranchType } from "@/types/Branch";
export const branchTypes: {
    value: BranchType;
    label: string;
    className: string;
}[] = [
    {
        value: "SECONDARY",
        label: "Sucursal secundaria",
        className: "bg-slate-100 text-slate-600",
    },
    {
        value: "MAIN",
        label: "Sucursal principal",
        className: "bg-blue-50 text-blue-700",
    },
    {
        value: "WAREHOUSE",
        label: "Almacén",
        className: "bg-amber-50 text-amber-700",
    },
    {
        value: "OFFICE",
        label: "Oficina",
        className: "bg-purple-50 text-purple-700",
    },
];