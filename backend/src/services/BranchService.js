import Branch from "../models/Branch.js";
import Business from "../models/Business.js";
import { Op } from "sequelize";

export const createBranch = async (businessId, data) => {
    const { name, type, country, city, address,phone } = data;

    if (!businessId) {
        throw new Error("El negocio es obligatorio");
    }

    if (!name) {
        throw new Error("El nombre de la sucursal es obligatorio");
    }

    if (!country) {
        throw new Error("El país es obligatorio");
    }

    if (!city) {
        throw new Error("La ciudad es obligatoria");
    }

    const business = await Business.findByPk(businessId);

    if (!business) {
        throw new Error("Empresa no encontrada");
    }

    const existingBranch = await Branch.findOne({
        where: {
            business_id: businessId,
            name
        }
    });

    if (existingBranch) {
        throw new Error(
            "Ya existe una sucursal con ese nombre dentro de esta empresa"
        );
    }

    if (type === "MAIN") {
        const mainBranch = await Branch.findOne({
            where: {
                business_id: businessId,
                type: "MAIN"
            }
        });

        if (mainBranch) {
            throw new Error(
                "La empresa ya tiene una sucursal principal"
            );
        }
    }

    const branch = await Branch.create({
        business_id: businessId,
        name,
        type: type ?? "SECONDARY",
        country,
        city,
        address,
        phone
    });
    return branch;
};

export const getBranches = async (businessId) => {
    if (!businessId) {
        throw new Error("El negocio es obligatorio");
    }

    const business = await Business.findByPk(businessId);

    if (!business) {
        throw new Error("Empresa no encontrada");
    }

    const branches = await Branch.findAll({
        where: {
            business_id: businessId
        },
        order: [
            ["createdAt", "DESC"]
        ]
    });

    return branches;
};

export const getBranchById = async (businessId, branchId) => {

    const branch = await Branch.findOne({
        where: {
            id: branchId,
            business_id: businessId
        }
    });

    if (!branch) {
        throw new Error("Sucursal no encontrada");
    }

    return branch;
};

export const updateBranch = async ( businessId, branchId, data ) => {
    const branch = await Branch.findOne({
        where: {
            id: branchId,
            business_id: businessId
        }
    });

    if (!branch) {
        throw new Error("Sucursal no encontrada");
    }

    if (data.name) {

        const exists = await Branch.findOne({
            where: {
                business_id: businessId,
                name: data.name,
                id: {
                    [Op.ne]: branchId
                }
            }
        });

        if (exists) {
            throw new Error(
                "Ya existe otra sucursal con ese nombre dentro de esta empresa"
            );
        }
    }

    if (data.type === "MAIN" && branch.type !== "MAIN") {

        const mainBranch = await Branch.findOne({
            where: {
                business_id: businessId,
                type: "MAIN",
                id: {
                    [Op.ne]: branchId
                }
            }
        });

        if (mainBranch) {
            throw new Error(
                "La empresa ya tiene una sucursal principal"
            );
        }
    }

    await branch.update({
        name: data.name ?? branch.name,
        type: data.type ?? branch.type,
        country: data.country ?? branch.country,
        city: data.city ?? branch.city,
        address: data.address ?? branch.address,
        phone: data.phone ?? branch.phone,
        status: data.status ?? branch.status
    });

    return branch;
};

export const changeBranchStatus = async ( businessId, branchId, status ) => {
    const branch = await Branch.findOne({
        where: {
            id: branchId,
            business_id: businessId
        }
    });

    if (!branch) {
        throw new Error("Sucursal no encontrada");
    }

    const allowedStatus = [ "ACTIVE", "INACTIVE" ];

    if (!allowedStatus.includes(status)) {
        throw new Error(
            "Estado inválido. Use ACTIVE o INACTIVE"
        );
    }

    await branch.update({
        status
    });
    return branch;
};

export const deleteBranch = async ( businessId, branchId) => {
    const branch = await Branch.findOne({
        where: {
            id: branchId,
            business_id: businessId
        }
    });

    if (!branch) {
        throw new Error("Sucursal no encontrada");
    }

    if (branch.type === "MAIN") {
        throw new Error(
            "No se puede eliminar la sucursal principal"
        );
    }
    try {
        await branch.destroy();

        return {
            message: "Sucursal eliminada correctamente"
        };

    } catch (error) {
        const constraint = error.constraint || error.parent?.constraint;

        switch (constraint) {
            case "User_branch_id_fkey":
                throw new Error(
                    "No se puede eliminar la sucursal porque tiene usuarios asociados."
                );

            case "Products_branch_id_fkey":
                throw new Error(
                    "No se puede eliminar la sucursal porque tiene productos asociados."
                );

            default:
                throw error;
        }
    }
};

export const getBranchesByName = async ( businessId, query ) => {
    const page = parseInt(query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    if (!businessId) {
        throw new Error("El negocio es obligatorio");
    }

    const where = {
        business_id: businessId
    };

    if (query.name) {
        where.name = {
            [Op.iLike]: `%${query.name}%`
        };
    }

    if (query.status) {
        where.status = query.status;
    }

    if (query.type) {
        where.type = query.type;
    }

    const { count, rows } = await Branch.findAndCountAll({
        where,
        attributes: [
            "id",
            "business_id",
            "name",
            "type",
            "country",
            "city",
            "address",
            "phone",
            "status",
            "createdAt",
            "updatedAt"
        ],
        order: [
            ["id", "DESC"]
        ],
        limit,
        offset
    });

    return {
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
        branches: rows
    };
};
export const getBranchStats = async (businessId) => {
    if (!businessId) {
        throw new Error("El negocio es obligatorio");
    }

    const business = await Business.findByPk(businessId);

    if (!business) {
        throw new Error("Empresa no encontrada");
    }

    const branches = await Branch.findAll({
        where: {
            business_id: businessId
        },
        attributes: [
            "status",
            [Branch.sequelize.fn("COUNT", Branch.sequelize.col("id")), "count"]
        ],
        group: ["status"],
        raw: true
    });
    const stats = {
        total: 0,
        active: 0,
        inactive: 0
    };
    for (const branch of branches) {
        const count = Number(branch.count);

        stats.total += count;

        if (branch.status === "ACTIVE") {
            stats.active = count;
        }

        if (branch.status === "INACTIVE") {
            stats.inactive = count;
        }
    }
    return stats;
};
export const getMainBranch = async (businessId) => {
    if (!businessId) {
        throw new Error("El negocio es obligatorio");
    }
    const branch = await Branch.findOne({
        where: {
            business_id: businessId,
            type: "MAIN"
        },
        attributes: [
            "id",
            "name"
        ]
    });
    if (!branch) {
        throw new Error(
            "El negocio no tiene una sucursal principal"
        );
    }
    return branch;
};
export const getBranchStatus = async (businessId, branchId) => {
    if (!businessId) {
        throw new Error("El negocio es obligatorio");
    }

    if (!branchId) {
        throw new Error("La sucursal es obligatoria");
    }

    const branch = await Branch.findOne({
        where: {
            id: branchId,
            business_id: businessId
        },
        attributes: ["id", "status"]
    });

    if (!branch) {
        throw new Error("Sucursal no encontrada");
    }

    return {
        branchId: branch.id,
        status: branch.status,
        active: branch.status === "ACTIVE"
    };
};
/*Ya esta el flujo multisucursal y la asignación para usuarios administradores, ahora seguiria el flujo de los modulos
para que filtren la información por sucursal*/