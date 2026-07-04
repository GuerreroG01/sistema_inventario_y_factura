import axios from "axios";
import { Expense } from "../types/Expense";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("La variable NEXT_PUBLIC_API_BASE_URL no está definida");
}

const api = axios.create({
  baseURL: `${API_BASE_URL}/expenses`,
  headers: {
    "Content-Type": "application/json",
  },
});
export async function getExpenses(
  page: number = 1,
  filters: {
    category?: string;
    from?: string;
    to?: string;
  } = {}
) {
  try {
    const { data } = await api.get<{
      message: string;
      data: Expense[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>("/", {
      params: {
        page,
        ...Object.fromEntries(
          Object.entries(filters).filter(
            ([_, v]) => v !== "" && v !== undefined && v !== null
          )
        ),
      },
    });

    return data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Error al obtener gastos"
    );
  }
}
export async function getExpenseById(id: number): Promise<Expense> {
  try {
    const { data } = await api.get<Expense>(`/${id}`);
    return data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error.message ||
      "Error al obtener gasto";

    throw new Error(message);
  }
}

export async function createExpense(
  expense: Omit<Expense, "id">
): Promise<Expense> {
  try {
    const { data } = await api.post<Expense>("/", expense);
    return data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Error al crear gasto"
    );
  }
}
export async function updateExpense(
  id: number,
  expense: Partial<Omit<Expense, "id">>
): Promise<{ ok: true; data: Expense } | { ok: false; message: string }> {
  try {
    const { data } = await api.put<Expense>(`/${id}`, expense);

    return { ok: true, data };
  } catch (error: any) {
    return {
      ok: false,
      message:
        error?.response?.data?.message ||
        error.message ||
        "Error al actualizar gasto",
    };
  }
}
export async function deleteExpense(id: number): Promise<void> {
  try {
    await api.delete(`/${id}`);
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Error al eliminar gasto"
    );
  }
}
export async function getExpenseCategories(): Promise<string[]> {
  try {
    const { data } = await api.get<{ message: string; data: string[]; }>("/categories");
    return data.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Error al obtener categorías"
    );
  }
}