"use client";

import { Sale } from "@/types/Sale";
import SalesLeftPanel from "./SalesLeftPanel";
import SalesRightPanel from "./SalesRightPanel";

type StatusOption = {
    value: string;
    label: string;
    description: string;
};
type Props = {
    sales: Sale[];
    selected: Sale | null;
    setSelected: (id: number) => void;
    loading: boolean;

    page: number;
    totalPages: number;
    setPage: (page: number) => void;
    
    startDate: string;
    setStartDate: (value: string) => void;

    endDate: string;
    setEndDate: (value: string) => void;

    fetchSales: () => void;
    statusStyle: (status: string) => string;
    handleStatusChange: (status: string) => Promise<void>;
    statusOptions: StatusOption[];
};

export default function SalesPage(props: Props) {
    if (props.loading) {
        return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-500 tracking-wide">
                Filtrando y cargando transacciones...
            </p>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto h-full grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <SalesLeftPanel {...props} />
            <SalesRightPanel {...props} />

        </div>
        </div>
    );
}