import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerMethod = async (datosUsuario, currentUser) => {
    const { Usuario, Clave, Email, Telefono } = datosUsuario;

    if (!Usuario || !Clave || !Email || !Telefono) {
        throw {
            statusCode: 400,
            message: "Todos los campos son obligatorios"
        };
    }

    const existeUsuario = await User.findOne({
        where: {
            Usuario
        }
    });

    if (existeUsuario) {
        throw {
            statusCode: 409,
            message: "El usuario ya existe"
        };
    }

    const existeEmail = await User.findOne({
        where: {
            Email
        }
    });

    if (existeEmail) {
        throw {
            statusCode: 409,
            message: "El email ya está registrado"
        };
    }

    const claveHash = await bcrypt.hash(Clave, 10);

    const nuevoUsuario = await User.create({
        Usuario,
        Clave: claveHash,
        Email,
        Telefono,
        Rol: "Empleado",
        business_id: currentUser.business_id
    });

    return {
        Id: nuevoUsuario.Id,
        Usuario: nuevoUsuario.Usuario,
        Email: nuevoUsuario.Email,
        Telefono: nuevoUsuario.Telefono,
        Rol: nuevoUsuario.Rol,
        FechaIngreso: nuevoUsuario.FechaIngreso,
        Activo: nuevoUsuario.Activo
    };
};

export const login = async (usuario, clave) => {
    if (!usuario || !clave) {
        throw {
            statusCode: 400,
            message: "Usuario y contraseña son obligatorios"
        };
    }


    const user = await User.findOne({
        where: {
            Usuario: usuario
        }
    });

    if (!user) {
        throw {
            statusCode: 401,
            message: "Usuario o contraseña incorrectos"
        };
    }

    if (!user.Activo) {
        throw {
            statusCode: 403,
            message: "El usuario está desactivado"
        };
    }

    const coincide = await bcrypt.compare(
        clave,
        user.Clave
    );

    if (!coincide) {
        throw {
            statusCode: 401,
            message: "Usuario o contraseña incorrectos"
        };
    }
    await user.update({
        UltimoAcceso: new Date()
    });
    const token = jwt.sign(
        {
            id: user.Id,
            usuario: user.Usuario,
            rol: user.Rol,
            business_id: user.business_id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "24h"
        }
    );

    return {
        token,
        usuario: {
            Id: user.Id,
            Usuario: user.Usuario,
            Rol: user.Rol,
            Activo: user.Activo,
            Business_id: user.business_id
        }
    };
};

export const getSystemStatus = async () => {
    const usersCount = await User.count();

    return {
        initialized: usersCount > 0,
        usersCount
    };
};
export const logout = async (userId) => {
    const user = await User.findByPk(userId);

    if (!user) {
        throw {
            statusCode: 404,
            message: "Usuario no encontrado"
        };
    }

    await user.update({
        UltimoAcceso: new Date()
    });

    return {
        message: "Sesión cerrada correctamente"
    };
};
export const getUsernameById = async (userId) => {
    const user = await User.findByPk(userId, {
        attributes: ["Usuario"]
    });

    if (!user) {
        throw {
            statusCode: 404,
            message: "Usuario no encontrado"
        };
    }

    return user.Usuario;
};