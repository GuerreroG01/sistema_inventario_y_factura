import api from "./api";
import { Business, BusinessWithLicense, BusinessListResponse } from "@/types/Business";

export async function createBusiness( name: string ): Promise<BusinessWithLicense> {
    try {
        const { data } = await api.post<{
        message: string;
        business: BusinessWithLicense;
        }>("/business", { name });

        return data.business;

    } catch (error: any) {
        throw new Error(
        error?.response?.data?.message ||
        "Error al crear la empresa"
        );
    }
}

export async function getBusinesses(): Promise<Business[]> {
    try {
        const { data } = await api.get<Business[]>("/business");
        return data;
    } catch(error:any){
        throw new Error(
        error?.response?.data?.message ||
        "Error al obtener empresas"
        );
    }
}

export async function getBusinessById( id:number ):Promise<Business>{
    try {
        const { data } = await api.get<Business>(`/business/${id}`);
        return data;
    } catch(error:any){
        throw new Error(error?.response?.data?.message || "Error al obtener empresa");
    }
}

export async function updateBusiness(id:number,name:string):Promise<Business>{
    try {
        const { data } = await api.put<{
            message:string;
            business:Business;
        }>(
            `/business/${id}`,
            {
                name
            }
        );
        return data.business;
    } catch(error:any){
        throw new Error( error?.response?.data?.message || "Error al actualizar empresa" );
    }
}

export async function changeBusinessStatus( id:number, status:"ACTIVE"|"INACTIVE" ):Promise<Business>{
    try {
        const { data } = await api.patch<{
            message:string;
            business:Business;
        }>(
            `/business/${id}/status`,
            {
                status
            }
        );
        return data.business;
    } catch(error:any){
        throw new Error( error?.response?.data?.message || "Error al cambiar estado de empresa" );
    }
}

export async function deleteBusiness(id:number):Promise<void>{
    try {
        await api.delete(
            `/business/${id}`
        );
    } catch(error:any){
        throw new Error( error?.response?.data?.message || "Error al eliminar empresa" );
    }
}

export async function getBusinessByName( page: number = 1, name?: string ): Promise<BusinessListResponse> {
    try {
        const response = await api.get<BusinessListResponse>("/business/businessByName", {
            params: {
                page,
                ...(name ? { name } : {})
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(
            error?.response?.data?.message ||
            "Error al obtener empresas"
        );
    }
}