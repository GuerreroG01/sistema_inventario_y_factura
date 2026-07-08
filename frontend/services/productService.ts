import api from "./api";
import { Product, StockAlerts } from "@/types/product";

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
    }>("/products/", {
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

    console.log("ERROR COMPLETO:", error);

    throw new Error(
        error?.response?.data?.error ||
        error?.message ||
        "Error al obtener productos"
    );
}
}

export async function createProduct(product: Omit<Product, "id">): Promise<Product> {
  try {
    const { data } = await api.post<Product>("/products/", product);
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
      const { data } = await api.get<Product>(`/products/${id}`);
      return data;
  } catch (error: any) {
      const message =
          error?.response?.data?.message ||
          error.message ||
          "Error al obtener producto";
      throw new Error(message);
  }
}

export async function updateProduct(
  id: number,
  product: Partial<Omit<Product, "id">>
): Promise<{ ok: true; data: Product } | { ok: false; message: string }> {
  try {
    const { data } = await api.put<Product>(`/products/${id}`, product);

    return { ok: true, data};
  } catch (error: any) {
    return {
      ok: false,
      message:
        error?.response?.data?.message ||
        error.message ||
        "Error al actualizar producto",
    };
  }
}

export async function deleteProduct(id: number): Promise<void> {
  try {
    await api.delete(`/products/${id}`);
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
    const { data } = await api.get("/products/dashboardinfo");
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
    }>("/products/getCategories");

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
    const { data } = await api.get<Product[]>("/products/autocompleteProd", {
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
export async function getStockAlerts(): Promise<StockAlerts> {
  try {
    const { data } = await api.get<{
      success: boolean;
      data: StockAlerts;
    }>("/products/getStockAlerts");

    return data.data;

  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error.message ||
      "Error al obtener alertas de stock";

    throw new Error(message);
  }
}