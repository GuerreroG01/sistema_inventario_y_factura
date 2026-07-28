import api from "./api";
import { Customer, CustomerResponse } from "@/types/Customer";

export async function getCustomers(
    page: number = 1,
    filters: {
        name?: string;
        phone?: string;
        status?: string;
        hasDebt?: boolean;
    } = {}
) {
    try {
        const response = await api.get("/customers/", {
        params: {
            page,
            ...Object.fromEntries(
            Object.entries(filters).filter(
                ([_, v]) => v !== "" && v !== undefined && v !== null
            )
            ),
        },
        });

        console.log("RESPUESTA CUSTOMERS:", response.data);

        return {
        data: response.data.data.data,
        pagination: response.data.data.pagination,
        };

    } catch (error: any) {

        console.log("ERROR CUSTOMERS:", error);
        console.log("ERROR RESPONSE:", error.response?.data);

        throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Error al obtener clientes"
        );
    }
}

export async function getCustomerById(id: number): Promise<CustomerResponse> {
    try {
        const response = await api.get<CustomerResponse>(
            `/customers/${id}`
        );

        return response.data;

    } catch (error: any) {
        throw new Error(
            error.response?.data?.message ||
            "Error al obtener cliente"
        );
    }
}

export async function createCustomer(
  customer: Omit<Customer, "id" | "balance" | "status">
): Promise<Customer> {

    try {
        const { data } = await api.post<Customer>( "/customers/", customer);
        return data;
    } catch (error: any) {
        throw new Error(
        error.response?.data?.message ||
        "Error al crear cliente"
        );
    }
}

export async function updateCustomer( id:number, customer: Partial<Omit<Customer,"id">>
): Promise<{ok:true; data:Customer} | {ok:false; message:string}> {
    try {
        const { data } = await api.put<Customer>(`/customers/${id}`,customer);
        return { ok:true, data };
    } catch(error:any){
        return {
        ok:false,
        message:
            error.response?.data?.message ||
            error.message ||
            "Error al actualizar cliente"
        };
    }
}

export async function changeCustomerStatus( id:number, status:"ACTIVE" | "INACTIVE"): Promise<Customer>{
    try{
        const {data} = await api.patch<Customer>( `/customers/${id}/status`,
        {
            status
        });
        return data;
    }catch(error:any){
        throw new Error(
        error.response?.data?.message ||
        "Error al cambiar estado del cliente"
        );
    }
}