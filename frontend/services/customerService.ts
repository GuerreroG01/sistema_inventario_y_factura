import api from "./api";
import { Customer, CustomerResponse, CustomerAutocomplete, CustomerSummary, CustomerSalesHistoryResponse,
    CustomerIndicators, CustomerPreferences
} from "@/types/Customer";

export async function getCustomers(
    page: number = 1,
    filters: {
        name?: string;
        phone?: string;
        status?: string;
        hasDebt?: string;
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

export async function getCustomerAutocomplete(
    search: string = "",
    page: number = 1
): Promise<{
    total: number;
    page: number;
    totalPages: number;
    customers: CustomerAutocomplete[];
}> {
    try {
        const { data } = await api.get("/customers/autocomplete", {
            params: {
                search,
                page
            }
        });

        return data;

    } catch (error: any) {
        throw new Error(
            error.response?.data?.message ||
            error.message ||
            "Error al buscar clientes"
        );
    }
}

export async function getCustomerSummary( id: number  ): Promise<CustomerSummary> {
    try {
        const response = await api.get(`/customers/${id}/summary`);
        return response.data.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message ||
            error.message ||
            "Error al obtener resumen del cliente"
        );
    }
}

export async function getCustomerSalesHistory(
    id: number,
    page: number = 1,
    limit: number = 10
): Promise<CustomerSalesHistoryResponse> {
    try {
        const response = await api.get(`/customers/${id}/sales`,
            {
                params: {
                    page,
                    limit
                }
            }
        );
        return response.data.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message ||
            error.message ||
            "Error al obtener historial de ventas"
        );
    }
}

export async function getCustomerIndicators(
    id: number
): Promise<CustomerIndicators> {
    try {
        const response = await api.get( `/customers/${id}/indicators`);
        return response.data.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message ||
            error.message ||
            "Error al obtener indicadores del cliente"
        );
    }
}

export async function getCustomerPreferences(id: number): Promise<CustomerPreferences> {
    try {
        const response = await api.get(`/customers/${id}/preferences`);
        return response.data.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message ||
            error.message ||
            "Error al obtener preferencias del cliente"
        );
    }
}