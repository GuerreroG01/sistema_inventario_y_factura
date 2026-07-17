"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { getBusinessByName } from "@/services/businessService";

interface Business {
    id: number;
    name: string;
}

interface Props {
    onSelect: (business: Business) => void;
    onClear: () => void;
}

export default function BusinessAutocomplete({onSelect,onClear}: Props) {
    const [search, setSearch] = useState("");
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        if (!search.trim()) {
            setBusinesses([]);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                setLoading(true);
                const response = await getBusinessByName(1,search);
                console.log("Respuesta de negocios:", response);
                setBusinesses(response?.businesses ?? []);

            } catch (error) {
                console.error(error);
                setBusinesses([]);
            } finally {
                setLoading(false);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const handleSelect = (business: Business) => {
        setSearch(business.name);
        setBusinesses([]);
        setShowResults(false);
        onSelect(business);
    };



    return (
        <div className="relative w-full max-w-md font-sans">
            <div className="
                flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3
                shadow-sm transition-all duration-200
                hover:border-gray-300
                focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100
            ">
                <Search className="h-5 w-5 text-gray-400 shrink-0" />
                
                <input
                    type="text"
                    value={search}
                    onFocus={() => setShowResults(true)}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setShowResults(true);
                    }}
                    placeholder="Buscar negocio..."
                    className="w-full bg-transparent text-sm font-medium text-gray-800 placeholder-gray-400 outline-none"
                />
                
                {search && (
                    <button
                        type="button"
                        onClick={() => {
                            setSearch("");
                            setBusinesses([]);
                            setShowResults(false);
                            onClear();
                        }}
                        className="p-0.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Panel de Resultados Dropdown */}
            {showResults && (search || loading) && (
                <div className="
                    absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-100 
                    bg-white/95 backdrop-blur-sm p-1 shadow-lg shadow-gray-200/50
                    animate-in fade-in slide-in-from-top-2 duration-200
                ">
                    {loading && (
                        <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500">
                            {/* Spinner animado discreto */}
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
                            <span>Buscando...</span>
                        </div>
                    )}
                    
                    {!loading && businesses.length === 0 && (
                        <p className="px-4 py-3 text-sm text-gray-400 italic text-center">
                            No se encontraron negocios.
                        </p>
                    )}
                    
                    {!loading && businesses.map((business) => (
                        <button
                            key={business.id}
                            type="button"
                            onClick={() => handleSelect(business)}
                            className="
                                w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium
                                text-gray-700 transition-colors duration-150
                                hover:bg-gray-50 hover:text-gray-900 focus:bg-gray-50 focus:outline-none
                            "
                        >
                            {business.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}