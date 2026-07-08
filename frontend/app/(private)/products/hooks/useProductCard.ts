import { useEffect, useState } from "react";
import { Product } from "@/types/product";
import { getProducts, deleteProduct, getCategories } from "@/services/productService";

const emptyFilters = {
    name: "",
    barcode: "",
    category: "",
    active: "",
    priceMin: "",
    priceMax: "",
    costMin: "",
    costMax: ""
};

export function useProductCard() {
    const [products, setProducts] = useState<Product[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productIdToDelete, setProductIdToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);

    const [filters, setFilters] = useState(emptyFilters);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
    const [categories, setCategories] = useState<string[]>([]);

    const updateFilter = (key: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const applyFilters = () => {
        setPage(1);
        setAppliedFilters(filters);
    };

    const clearFilters = () => {
        setFilters(emptyFilters);
        setAppliedFilters(emptyFilters);
        setPage(1);
    };

    const fetchProducts = async (pageToFetch = page) => {
        setLoading(true);

        try {
            const data = await getProducts(pageToFetch, appliedFilters);

            setProducts(data.products || []);
            setTotalPages(data.totalPages || 1);
            setTotalItems(data.total || 0);

        } catch (err) {
            console.error("Error fetching products:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(page);
    }, [page, appliedFilters]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const openDeleteModal = (id: number) => {
        setProductIdToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const openDetailModal = (product: Product) => {
        setSelectedProduct(product);
        setIsDetailModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setProductToEdit(product);
        setIsFormModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (productIdToDelete === null) return;

        setIsDeleting(true);

        try {
            await deleteProduct(productIdToDelete);

            const isLastItemOnPage = products.length === 1;

            if (isLastItemOnPage && page > 1) {
                setPage(page - 1);
            } else {
                await fetchProducts(page);
            }

            setIsDeleteModalOpen(false);
            setProductIdToDelete(null);

        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Error al eliminar el producto");
        } finally {
            setIsDeleting(false);
        }
    };
    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data || []);
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    };
    useEffect(() => {
        fetchCategories();
    }, []);

    return {
        products, loading, page, totalPages, totalItems,
        filters, updateFilter, applyFilters, clearFilters, filtersOpen, setFiltersOpen,
        isDeleteModalOpen, isDeleting, isDetailModalOpen, selectedProduct, isFormModalOpen, productToEdit,
        handlePageChange, openDeleteModal, openDetailModal, openEditModal, handleConfirmDelete, fetchProducts, setPage,
        setIsDeleteModalOpen, setIsDetailModalOpen, setSelectedProduct, setIsFormModalOpen, setProductToEdit, categories
    };
}