import axios from "axios";
import { Product } from "@/types/product";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("La variable NEXT_PUBLIC_API_BASE_URL no está definida");
}

const api = axios.create({
  baseURL: `${API_BASE_URL}/products`,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function getProducts(
  page: number = 1,
  filters: {
    name?: string;
    barcode?: string;
    category?: string;
    active?: string;
    priceMin?: string;
    priceMax?: string;
    costMin?: string;
    costMax?: string;
  } = {}
) {
  try {
    const { data } = await api.get<{
      total: number;
      page: number;
      totalPages: number;
      products: Product[];
    }>("/", {
      params: {
        page,
        ...Object.fromEntries(
          Object.entries(filters).filter(
            ([_, v]) => v !== "" && v !== undefined && v !== null
          )
        )
      }
    });

    return data;

  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || "Error al obtener productos"
    );
  }
}

export async function createProduct(product: Omit<Product, "id">): Promise<Product> {
  try {
    const { data } = await api.post<Product>("/", product);
    return data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error.message ||
      "Error al crear producto";
    throw new Error(message);
  }
}

export async function getProduct(id: number): Promise<Product> {
  try {
      const { data } = await api.get<Product>(`/${id}`);
      return data;
  } catch (error: any) {
      const message =
          error?.response?.data?.message ||
          error.message ||
          "Error al obtener producto";
      throw new Error(message);
  }
}

export async function updateProduct(id: number, product: Partial<Omit<Product, "id">>): Promise<Product> {
  try {
    const { data } = await api.put<Product>(`/${id}`, product);
    return data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error.message ||
      "Error al actualizar producto";
    throw new Error(message);
  }
}

export async function deleteProduct(id: number): Promise<void> {
  try {
    await api.delete(`/${id}`);
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error.message ||
      "Error al eliminar producto";
    throw new Error(message);
  }
}

export async function getProductStats(): Promise<{
  totalProducts: number;
  totalStock: number;
  activeProducts: number;
  lowStock: number;
}> {
  try {
    const { data } = await api.get("/dashboardinfo");
    return data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error.message ||
      "Error al obtener estadísticas de productos";
    throw new Error(message);
  }
}

export async function getCategories(): Promise<string[]> {
  try {
    const { data } = await api.get<{
      source: string;
      categories: string[];
    }>("/getCategories");

    return data.categories;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error.message ||
      "Error al obtener categorías";

    throw new Error(message);
  }
}

export async function autocompleteProducts(query: {
  name?: string;
  barcode?: string;
}): Promise<Product[]> {
  try {
    const { data } = await api.get<Product[]>("/autocompleteProd", {
      params: {
        ...Object.fromEntries(
          Object.entries(query).filter(
            ([_, v]) => v !== "" && v !== undefined && v !== null
          )
        )
      }
    });

    return data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error.message ||
      "Error en autocomplete de productos";

    throw new Error(message);
  }
}