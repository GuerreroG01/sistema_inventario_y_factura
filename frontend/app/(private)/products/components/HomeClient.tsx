"use client";

import Dashboard from "./Dashboard";
import ProductCard from "./ProductCard";

export default function HomeClient() {
    return (
        <div className="font-sans flex flex-col">
            <main className="flex-1 w-full px-4 md:px-8 py-3 space-y-8">
                <Dashboard />
                <ProductCard />
            </main>
        </div>
    );
}