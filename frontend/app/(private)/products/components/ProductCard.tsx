"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Product, ProductUnit } from "@/types/product";
import { Package, Trash2, Info, Pencil, Layers3, Boxes, Tag
} from "lucide-react";

import { useProductCard } from "../hooks/useProductCard";
import Pagination from "./Pagination";
import { ConfirmDeleteModal } from "@/components/ConfirmDelete";
import { ProductDetailModal } from "./ProductDetailModal";
import ProductFilters from "./ProductFilters";
import { useAuth } from "@/app/(public)/auth/login/hooks/useAuth";

type ProductCardProps = {
  product: Product;
  onDetail: (product: Product) => void;
  onDelete: (id: number) => void;
};

function ProductCard({ product, onDetail, onDelete,}: ProductCardProps) {
  const getActiveUnits = (product: Product): ProductUnit[] => {
    return (product.units ?? []).filter((unit) => unit.active);
  };
  const { user } = useAuth();
  const showBranchName = user?.Rol === "superAdmin" || user?.Rol === "admin";
  const formatPrice = (price: number | null): string => {
    if (price === null) {
      return "Sin precio";
    }

    return `C$${price.toFixed(2)}`;
  };

  const units = getActiveUnits(product);

  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(
    units[0]?.id ?? null
  );

  useEffect(() => {
    if (units.length === 0) {
      setSelectedUnitId(null);
      return;
    }

    const selectedStillExists = units.some(
      (unit) => unit.id === selectedUnitId
    );

    if (!selectedStillExists) {
      setSelectedUnitId(units[0].id);
    }
  }, [product.units, selectedUnitId]);

  const selectedUnit =
    units.find((unit) => unit.id === selectedUnitId) ??
    units[0] ??
    null;

  const isProduct = product.type_item === "Producto";

  const presentationLabel = isProduct
    ? "Presentación"
    : "Opción";

  const emptyLabel = isProduct
    ? "Sin unidades configuradas"
    : "Sin opciones configuradas";
  
  const isActivePromotion =
    Boolean(selectedUnit?.hasPromotion) &&
    selectedUnit?.promotionPrice !== null &&
    selectedUnit?.promotionPrice !== undefined &&
    Number(selectedUnit.promotionPrice) > 0 &&
    ( !isProduct || Number(selectedUnit?.promotionQuantity ?? 0) > 0 );

  const displayPrice = isActivePromotion
    ? Number(selectedUnit?.promotionPrice)
    : Number(selectedUnit?.price);

  const promotionQuantity =
    Number(selectedUnit?.promotionQuantity ?? 0);

  const generalStock =
    Number(selectedUnit?.stock ?? 0);

  const unitsRef = useRef<HTMLDivElement | null>(null);

  const scrollUnits = (direction: "left" | "right") => {
    unitsRef.current?.scrollBy({
      left: direction === "right" ? 200 : -200,
      behavior: "smooth",
    });
  };
  return (
    <div
      className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <div
        className={`h-2 w-full ${
          product.active
            ? "bg-gradient-to-r from-green-400 to-green-600"
            : "bg-gradient-to-r from-red-400 to-red-600"
        }`}
      />

      <div className="relative flex h-full flex-col p-6">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="line-clamp-1 text-xl font-bold text-gray-900">
                {product.name}
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {product.category || "Sin categoría"}
              </p>
            </div>

            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                isProduct
                  ? "bg-indigo-50 text-indigo-700"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              {product.type_item}
            </span>
          </div>

          {units.length === 0 ? (
            <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50/70 px-4 py-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <Info className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-amber-800">
                    No configurado en esta sucursal
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-amber-700">
                    Este producto existe en el negocio, pero todavía no tiene
                    una presentación configurada para esta sucursal.
                  </p>

                  <Link
                    href={`/products/form/${product.id}/update`}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-600"
                  >
                    Configurar presentación

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-3.5 w-3.5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.21 14.77a.75.75 0 0 1-.02-1.06L10.94 10 7.23 6.29a.75.75 0 1 1 1.06 1.06l4.24 4.24a.75.75 0 0 1 0 1.06l-4.24-4.24a.75.75 0 0 1 .02-1.06Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {/* PRECIO */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Tag className="h-4 w-4" />

                  <span>Precio</span>
                </div>

                <div className="text-right">
                  {isActivePromotion ? (
                    <div>
                      <div className="text-lg font-bold text-emerald-700">
                        {formatPrice(displayPrice)}
                      </div>

                      <div className="text-xs font-semibold text-slate-400 line-through">
                        {formatPrice(Number(selectedUnit?.price))}
                      </div>
                    </div>
                  ) : (
                    <span className="text-lg font-bold text-slate-900">
                      {formatPrice(
                        selectedUnit
                          ? Number(selectedUnit.price)
                          : null
                      )}
                    </span>
                  )}
                </div>
              </div>

              {/* STOCK */}
              {isProduct && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Boxes className="h-4 w-4" />

                    <span>Stock disponible</span>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-bold ${
                        generalStock === 0 && promotionQuantity === 0
                          ? "text-red-600"
                          : generalStock <= 5 && promotionQuantity === 0
                          ? "text-amber-600"
                          : "text-green-600"
                      }`}
                    >
                      {generalStock}
                    </div>

                    {isActivePromotion && promotionQuantity > 0 && (
                      <div className="mt-0.5 text-sm font-bold text-emerald-500">
                        +{promotionQuantity}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PRESENTACIONES */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Layers3 className="h-4 w-4" />

                    <span>{presentationLabel}</span>
                  </div>

                  <span className="text-xs font-semibold text-slate-400">
                    {units.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Presentación seleccionada */}
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-slate-400">
                          {showBranchName ? "Sucursal" : `${presentationLabel} seleccionada`}
                        </p>

                        <p className="mt-0.5 font-bold text-indigo-700">
                          {showBranchName
                            ? selectedUnit?.branch?.name || "Sin sucursal"
                            : selectedUnit?.unit || "Sin descripción"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-medium text-slate-400">
                          Precio Normal
                        </p>

                        <p className="font-bold text-slate-900">
                          {formatPrice(
                            selectedUnit
                              ? Number(selectedUnit.price)
                              : null
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Selector de unidades */}
                  <div className="relative">
                    {units.length > 3 && (
                      <button
                        type="button"
                        onClick={() => scrollUnits("left")}
                        className="
                          absolute left-1 top-1/2 z-20
                          flex h-8 w-8 -translate-y-1/2
                          items-center justify-center
                          rounded-full
                          bg-white
                          text-slate-600
                          shadow-md
                          ring-1 ring-slate-200
                          transition-all
                          hover:scale-110
                          hover:bg-indigo-50
                          hover:text-indigo-600
                          active:scale-95
                        "
                        aria-label="Ver unidades anteriores"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-4 w-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.79 5.23a.75.75 0 0 1-.02 1.06L9.06 10l3.71 3.71a.75.75 0 1 1-1.06 1.06l-4.24-4.24a.75.75 0 0 1 0-1.06l4.24-4.24a.75.75 0 0 1 1.06-.02Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}

                    <div
                      ref={unitsRef}
                      className={`
                        flex gap-2
                        overflow-x-auto
                        pb-2
                        scroll-smooth
                        [scrollbar-width:none]
                        [&::-webkit-scrollbar]:hidden
                        ${units.length > 4 ? "px-10" : ""}
                      `}
                    >
                      {units.map((unit) => {
                        const isSelected =
                          selectedUnit?.id === unit.id;

                        return (
                          <button
                            key={unit.id}
                            type="button"
                            onClick={() =>
                              setSelectedUnitId(unit.id)
                            }
                            className={`
                              shrink-0 rounded-full
                              px-3.5 py-2
                              text-xs font-semibold
                              transition-all
                              ${
                                isSelected
                                  ? "bg-indigo-600 text-white shadow-sm"
                                  : "bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                              }
                            `}
                          >
                            {unit.unit || "Sin descripción"}
                          </button>
                        );
                      })}
                    </div>

                    {units.length > 3 && (
                      <button
                        type="button"
                        onClick={() => scrollUnits("right")}
                        className="
                          absolute right-1 top-1/2 z-20
                          flex h-8 w-8 -translate-y-1/2
                          items-center justify-center
                          rounded-full
                          bg-white
                          text-slate-600
                          shadow-md
                          ring-1 ring-slate-200
                          transition-all
                          hover:scale-110
                          hover:bg-indigo-50
                          hover:text-indigo-600
                          active:scale-95
                        "
                        aria-label="Ver más unidades"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-4 w-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.21 14.77a.75.75 0 0 1-.02-1.06L10.94 10 7.23 6.29a.75.75 0 1 1 1.06 1.06l-4.24-4.24a.75.75 0 0 1 0-1.06l4.24-4.24a.75.75 0 0 1 0-1.06l4.24 4.24a.75.75 0 0 1 .02 1.06Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ACCIONES */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onDetail(product)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 shadow-sm transition-all duration-200 hover:scale-110 hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:shadow-indigo-200 active:scale-95"
            title="Ver detalles"
          >
            <Info className="h-5 w-5" />
          </button>

          <Link
            href={`/products/form/${product.id}/update`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600 shadow-sm transition-all duration-200 hover:scale-110 hover:bg-amber-500 hover:text-white hover:shadow-lg hover:shadow-amber-200 active:scale-95"
            title={`Editar ${
              isProduct ? "producto" : "servicio"
            }`}
          >
            <Pencil className="h-4 w-4" />
          </Link>

          <button
            type="button"
            onClick={() => onDelete(product.id)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600 shadow-sm transition-all duration-200 hover:scale-110 hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-200 active:scale-95"
            title={`Eliminar ${
              isProduct ? "producto" : "servicio"
            }`}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        {/* ESTADO */}
        <span
          className={`absolute bottom-4 left-4 rounded-full px-3 py-1 text-xs font-semibold shadow ${
            product.active
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {product.active ? "Activo" : "Inactivo"}
        </span>
      </div>
    </div>
  );
}

export default function ProductCards() {
  const {
    products, loading, page, totalPages, isDeleteModalOpen, isDeleting, isDetailModalOpen, selectedProduct,
    handlePageChange, openDeleteModal, openDetailModal, handleConfirmDelete, setIsDeleteModalOpen, setIsDetailModalOpen,
    setSelectedProduct, updateFilter, filters, applyFilters, filtersOpen, setFiltersOpen, categories,
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
        <div className="py-20 text-center font-medium text-slate-500">
          Cargando productos...
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white py-20 text-center shadow-lg">
          <Package className="mx-auto mb-4 h-12 w-12 animate-bounce text-gray-400" />

          <h3 className="text-2xl font-bold text-gray-700">
            No hay productos disponibles
          </h3>

          <p className="mt-2 text-gray-500">
            Agrega tu primer producto para empezar a
            gestionar tu inventario.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {products.map((product: Product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDetail={openDetailModal}
                onDelete={openDeleteModal}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
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