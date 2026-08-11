"use client";

import Link from "next/link";
import { Product } from "@/types/product";
import { Package, Trash2, Info, Pencil } from "lucide-react";
import { useProductCard } from "../hooks/useProductCard";
import Pagination from "./Pagination";
import { ConfirmDeleteModal } from "@/components/ConfirmDelete";
import { ProductDetailModal } from "./ProductDetailModal";
import ProductFilters from "./ProductFilters";

export default function ProductCards() {
  const {
    products, loading, page, totalPages, isDeleteModalOpen, isDeleting, isDetailModalOpen, selectedProduct,
    handlePageChange, openDeleteModal, openDetailModal, handleConfirmDelete, setIsDeleteModalOpen, setIsDetailModalOpen,
    setSelectedProduct, updateFilter, filters, applyFilters, filtersOpen, setFiltersOpen, categories, isPromotionActive
  } = useProductCard();

  return (
    <>
      <ProductFilters
        filters={filters}
        updateFilter={updateFilter}
        applyFilters={applyFilters}
        open={filtersOpen}
        setOpen={setFiltersOpen}
        categories={categories}
      />
      {loading ? (
        <div className="py-20 text-center text-slate-500 font-medium">Cargando productos...</div>
      ) : products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white py-20 text-center shadow-lg">
          <Package className="mx-auto mb-4 w-12 h-12 text-gray-400 animate-bounce" />
          <h3 className="text-2xl font-bold text-gray-700">No hay productos disponibles</h3>
          <p className="mt-2 text-gray-500">Agrega tu primer producto para empezar a gestionar tu inventario.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {products.map((p: Product) => (
              <div
                key={p.id}
                className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-md transition hover:shadow-2xl hover:-translate-y-2"
              >
                <div className={`h-2 w-full ${p.active ? "bg-gradient-to-r from-green-400 to-green-600" : "bg-gradient-to-r from-red-400 to-red-600"}`} />

                <div className="p-6 flex flex-col justify-between h-full relative">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{p.name}</h3>
                    <p className="text-sm text-gray-500">{p.category || "General"}</p>

                    <div className="mt-5 space-y-3 text-gray-700">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Precio</span>

                        {isPromotionActive(p) ? (
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-green-600">
                              C${p.promotionPrice}
                            </span>

                            <span className="text-xs text-gray-400 line-through">
                              C${p.price}
                            </span>
                          </div>
                        ):(
                          <span className="font-bold text-slate-900">
                            C${p.price}
                          </span>
                        )}
                      </div>
                      {p.type_item === "Producto" ? (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">Stock</span>
                          <span className="font-semibold">{p.stock}</span>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">Tipo</span>
                          <span className="font-semibold text-blue-600">
                            Servicio
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Medida</span>
                        <span className="font-semibold">{p.unit || "Unidad"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => openDetailModal(p)}
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 shadow-sm transition-all duration-200 hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:shadow-indigo-200 hover:scale-110 active:scale-95"
                      title="Ver detalles"
                    >
                      <Info className="w-5 h-5" />
                    </button>

                    <Link
                      href={`/products/form/${p.id}/update`}
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-50 text-amber-600 shadow-sm transition-all duration-200 hover:bg-amber-500 hover:text-white hover:shadow-lg hover:shadow-amber-200 hover:scale-110 active:scale-95"
                      title="Editar producto"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => openDeleteModal(p.id)}
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 text-red-600 shadow-sm transition-all duration-200 hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-200 hover:scale-110 active:scale-95"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <span
                    className={`absolute bottom-4 left-4 rounded-full px-3 py-1 text-xs font-semibold shadow ${
                      p.active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {p.active ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
          )}
        </>
      )}

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        isDeleting={isDeleting}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      <ProductDetailModal
        isOpen={isDetailModalOpen}
        product={selectedProduct}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedProduct(null);
        }}
      />
    </>
  );
}