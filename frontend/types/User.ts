export type Business = {
    id: number;
    name: string;
    status: string;
    createdAt: string;
}

export type User = {
    Id: number;
    Usuario: string;
    Email?: string;
    Telefono?: string;
    Rol: string;
    Activo: boolean;
    FechaIngreso?: string;
    UltimoAcceso?: string;
    business?: Business;
}