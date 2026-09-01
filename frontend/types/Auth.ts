export interface User {
    Id: number;
    Usuario: string;
    Email: string;
    Telefono: string;
    Rol: string;
    FechaIngreso: string;
    Activo: boolean;
    branch_id: number;
}

export interface LoginResponse {
    success: boolean;
    token: string;
    usuario: User;
}

export interface RegisterRequest {

    Usuario: string;
    Clave: string;
    Email: string;
    Telefono: string;
    branch_id?: number;
}

export interface RegisterResponse {

    success: boolean;
    message: string;
    usuario: User;

}

export interface SystemStatusResponse {
    success: boolean;
    initialized: boolean;
    usersCount: number;
}