import { Op } from "sequelize";
import User from "../models/User.js";
import Business from "../models/Business.js";
import Branch from "../models/Branch.js";
import { getMainBranch } from "./BranchService.js";

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
                "business_id",
                "branch_id"
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
                },
                {
                    model: Branch,
                    as: "branch",
                    attributes: [
                        "id",
                        "name",
                        "country",
                        "city"
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
        const mainBranch = await Branch.findOne({
            where: {
                business_id: businessId,
                type: "MAIN"
            },
            attributes: [
                "id",
                "name"
            ]
        });

        if (!mainBranch) {
            throw {
                statusCode: 404,
                message: "El negocio no tiene una sucursal principal"
            };
        }

        user.business_id = businessId;
        user.branch_id = mainBranch.id;

        await user.save();

        return {
            message: "Negocio y sucursal principal asignados correctamente",
            user
        };
    } catch (error) {
        console.error("updateUserBusiness service error:", error);
        throw error;
    }
};

export const updateUserBranch = async (
    userId, branchId, targetBusinessId, currentBusinessId, userRol
) => {
    if (
        userRol !== "superAdmin" &&
        Number(targetBusinessId) !== Number(currentBusinessId)
    ) {
        throw {
            statusCode: 403,
            message: "No tienes permisos para operar sobre este negocio"
        };
    }

    const user = await User.findOne({
        where: {
            Id: userId,
            ...(userRol !== "superAdmin"
                ? { business_id: currentBusinessId }
                : {})
        }
    });

    if (!user) {
        throw {
            statusCode: 404,
            message: "Usuario no encontrado"
        };
    }

    const branch = await Branch.findOne({
        where: {
            id: branchId,
            business_id: targetBusinessId
        }
    });

    if (!branch) {
        throw {
            statusCode: 404,
            message: "Sucursal no encontrada"
        };
    }
    user.branch_id = branchId;
    user.business_id = targetBusinessId;
    await user.save();
    return {
        message: "Sucursal asignada correctamente",
        user
    };
};