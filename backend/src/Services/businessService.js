import Business from "../models/Business.js";
import License from "../models/License.js";
import { createTrialLicense, getLicenseByBusiness, suspendLicense, reactivateLicense } from "./LicenseService.js";
import { Op, ForeignKeyConstraintError } from "sequelize";
export const createBusiness = async (data) => {
    const { name } = data;
    if (!name) {
        throw new Error("El nombre de la empresa es obligatorio");
    }

    const existingBusiness = await Business.findOne({
        where: { name }
    });

    if (existingBusiness) {
        throw new Error("Ya existe una empresa con ese nombre");
    }

    const business = await Business.create({ name });

    const license = await createTrialLicense(
        business.id,
        14
    );

    return {
        business,
        license
    };
};

export const getBusinesses = async () => {

    const businesses = await Business.findAll({
        order: [
            ["createdAt", "DESC"]
        ]
    });

    return businesses;
};

export const getBusinessById = async (id) => {
    const business = await Business.findByPk(id);
    if (!business) {
        throw new Error("Empresa no encontrada");
    }
    return business;
};

export const updateBusiness = async (id, data) => {

    const business = await Business.findByPk(id);
    if (!business) {
        throw new Error("Empresa no encontrada");
    }

    if (data.name) {
        const exists = await Business.findOne({
            where: {
                name: data.name
            }
        });
        if (exists && exists.id !== Number(id)) {
            throw new Error("Ya existe otra empresa con ese nombre");
        }
    }

    await business.update({
        name: data.name ?? business.name
    });

    return business;
};


export const changeBusinessStatus = async (id, status) => {

    const business = await Business.findByPk(id);

    if (!business) {
        throw new Error("Empresa no encontrada");
    }

    const allowedStatus = [
        "ACTIVE",
        "INACTIVE"
    ];

    if (!allowedStatus.includes(status)) {
        throw new Error(
            "Estado inválido. Use ACTIVE o INACTIVE"
        );
    }

    let license;

    try {
        license = await License.findOne({
            where: {
                business_id: id
            }
        });

    } catch (error) {
        console.error("ERROR BUSCANDO LICENCIA:", error);
        throw error;
    }

    let licenseMessage = "El negocio no tiene licencia";

    if (license) {
        if (status === "INACTIVE") {
            await suspendLicense(id);
            licenseMessage = "Licencia suspendida correctamente";
        }
        if (status === "ACTIVE") {
            await reactivateLicense(id);
            licenseMessage = "Licencia reactivada correctamente";
        }

    } else {
        console.log("El negocio no tiene licencia");
    }

    await business.update({
        status
    });

    return {
        business,
        licenseMessage
    };
};
export const deleteBusiness = async (id) => {
    const business = await Business.findByPk(id);
    if (!business) {
        throw new Error("Empresa no encontrada");
    }
    try {
        await business.destroy();
        return {
            message: "Empresa eliminada correctamente"
        };

    } catch (error) {
        const constraint = error.constraint || error.parent?.constraint;

        switch (constraint) {
            case "User_business_id_fkey":
                throw new Error(
                    "No se puede eliminar la empresa porque tiene usuarios asociados."
                );

            case "Licenses_business_id_fkey":
                throw new Error(
                    "No se puede eliminar la empresa porque tiene una licencia asociada."
                );

            case "Products_business_id_fkey":
                throw new Error(
                    "No se puede eliminar la empresa porque tiene productos asociados."
                );

            default:
                throw error;
        }
    }
};

export const getBusinessByName = async (query) => {
    const page = parseInt(query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    const where = {
        status: "ACTIVE"
    };

    if (query.name) {
        where.name = {
            [Op.iLike]: `%${query.name}%`
        };
    }
    const { count, rows } = await Business.findAndCountAll({
        where,
        attributes: ["id", "name"],
        order: [["id", "DESC"]],
        limit,
        offset
    });
    return {
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
        businesses: rows
    };
};