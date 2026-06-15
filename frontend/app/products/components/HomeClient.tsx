"use client";

import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import Dashboard from "./Dashboard";
import ProductCard from "./ProductCard";

type HomeClientProps = {
  productsData: {
    products: any[];
    totalPages: number;
    page?: number;
    total?: number;
  };
};

export default function HomeClient({ productsData }: HomeClientProps) {
  const { products } = productsData;

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Header />

      <main className="flex-1 w-full px-4 md:px-8 py-3 space-y-8">
        <section className="bg-white rounded-3xl p-2 border border-gray-100 shadow-sm">
          <Dashboard products={products} />
        </section>

        <section>
          <ProductCard />
        </section>
      </main>

      <Footer />
    </div>
  );
}