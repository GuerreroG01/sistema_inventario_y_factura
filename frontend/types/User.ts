export type Business = {
    id: number;
    name: string;
    status: string;
    createdAt: string;
}

export type Branch = {
    id: number;
    name: string;
    country: string;
    city?: string;
};

export type User = {
    Id: number;
    Usuario: string;
    Email?: string;
    Telefono?: string;
    Rol: string;
    Activo: boolean;
    FechaIngreso?: string;
    UltimoAcceso?: string;
    business_id?: number;
    branch_id?: number;
    business?: Business;
    branch?: Branch;
}