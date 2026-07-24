import api from "./api";
import { User } from "@/types/User";
/*  Quede aqui, tengo que crear los componentes visuales para ver los usuarios, el perfil de usuario
y también esta pendiente la logica en el backend para asignar un negocio a un usuario que eso irá 
en el panel para consultar y administrar usuarios
*/
export async function getUsers(
  page: number = 1,
  filters: {
    usuario?: string;
    email?: string;
    telefono?: string;
    rol?: string;
    activo?: string;
  } = {}
) {
  try {
    const { data } = await api.get<{
      total: number;
      page: number;
      totalPages: number;
      users: User[];
    }>("/user/", {
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
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Error al obtener usuarios"
    );
  }
}

export async function getUser(id: number): Promise<User> {
  try {
    const { data } = await api.get<User>(`/user/${id}`);
    return data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error.message ||
      "Error al obtener usuario";
    throw new Error(message);
  }
}

export async function updateUserBusiness(userId: number, businessId: number) {
  try {
    const { data } = await api.patch(
      `/user/${userId}/business`,
      {
        business_id: businessId
      }
    );
    return data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
      error.message ||
      "Error al asignar negocio"
    );
  }
}