import { Op } from "sequelize";
import User from "../models/User.js";
import Business from "../models/Business.js";

export const getUsers = async (query, businessId, userRol) => {
    try {
        const page = parseInt(query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        const { usuario, email, telefono, rol, activo } = query;

        const where = {};

        if (userRol !== "superAdmin") {
            where.business_id = businessId;
        }

        if (usuario) {
            where.Usuario = {
                [Op.iLike]: `%${usuario}%`
            };
        }

        if (email) {
            where.Email = {
                [Op.iLike]: `%${email}%`
            };
        }

        if (telefono) {
            where.Telefono = {
                [Op.iLike]: `%${telefono}%`
            };
        }

        if (rol) {
            where.Rol = rol;
        }

        if (activo !== undefined) {
            where.Activo = activo === "true";
        }

        const { count, rows: users } = await User.findAndCountAll({
            where,
            attributes: [
                "Id",
                "Usuario",
                "Rol",
                "Activo",
            ],
            order: [["Id", "DESC"]],
            limit,
            offset
        });

        return {
            total: count,
            page,
            totalPages: Math.ceil(count / limit),
            users
        };
    } catch (error) {
        console.error("getUsers service error:", error);
        throw error;
    }
};

export const getUserById = async (id, businessId, userRol) => {
    try {
        const where = {
            Id: id
        };
        if (userRol !== "superAdmin") {
            where.business_id = businessId;
        }
        const user = await User.findOne({
            where,
            attributes: {
                exclude: ["Clave"]
            },
            include: [
                {
                    model: Business,
                    as: "business",
                    attributes: [
                        "id",
                        "name",
                        "status",
                        "createdAt"
                    ]
                }
            ]
        });
        if (!user) {
            throw {
                statusCode: 404,
                message: "Usuario no encontrado"
            };
        }
        return user;

    } catch (error) {
        console.error("getUserById service error:", error);
        throw error;
    }
};
export const updateUserBusiness = async (userId, businessId) => {
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            throw {
                statusCode: 404,
                message: "Usuario no encontrado"
            };
        }
        const business = await Business.findByPk(businessId);
        if (!business) {
            throw {
                statusCode: 404,
                message: "Negocio no encontrado"
            };
        }
        user.business_id = businessId
        await user.save();

        return {
            message: "Negocio asignado correctamente",
            user
        };
    } catch (error) {
        console.error("updateUserBusiness service error:", error);
        throw error;
    }
};