"use client";

import { useState } from "react";
import Dashboard from "./Dashboard";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";

export default function HomeClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleProductCreated = () => {
    console.log("Producto creado correctamente");
    setIsModalOpen(false);
  };

  return (
    <div className="font-sans flex flex-col">
      <main className="flex-1 w-full px-4 md:px-8 py-3 space-y-8">
        <section className="bg-white rounded-3xl p-2 border border-gray-100 shadow-sm">
          <Dashboard
            onAddProduct={() => setIsModalOpen(true)}
          />
        </section>

        <section>
          <ProductCard />
        </section>
      </main>
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitSuccess={handleProductCreated}
      />
    </div>
  );
}