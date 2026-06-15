import { useEffect, useState } from "react";
import { Product } from "@/types/product";
import { getProducts, deleteProduct } from "@/services/productService";

export function useProductCard(){
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

    const fetchProducts = async (pageToFetch: number) => {
        setLoading(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        try {
            const data = await getProducts(pageToFetch, 10);
            setProducts(data.products || []);
            setTotalPages(data.totalPages || 1);
            setTotalItems(data.total || 0);

            if (pageToFetch > data.totalPages && data.totalPages > 0) {
                setPage(data.totalPages);
            }
        } catch (err) {
            console.error("Error fetching products:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(page);
    }, [page]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
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
    return {
        products, loading, page, totalPages,
        isDeleteModalOpen, isDeleting, isDetailModalOpen, selectedProduct, isFormModalOpen, productToEdit,
        handlePageChange, openDeleteModal, openDetailModal, openEditModal, handleConfirmDelete, fetchProducts,
        setIsDeleteModalOpen, setIsDetailModalOpen, setSelectedProduct, setIsFormModalOpen, setProductToEdit
    };
}