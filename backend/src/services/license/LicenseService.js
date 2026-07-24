import License from "../../models/License.js";
import crypto from "crypto";
import { Op } from "sequelize";
import { cacheService, CacheKeys, CacheTTL } from "../cache/index.js";
import { getBusinessById } from "../businessService.js";
import Business from "../../models/Business.js"
import { emailService } from "../email/EmailServices.js";

const generateLicenseKey = () => {
    return crypto
        .randomBytes(18)
        .toString("hex")
        .toUpperCase();
};

const calculateExpirationDate = ( duration, durationUnit, baseDate = new Date() ) => {
    if (!duration || !durationUnit) {
        return null;
    }
    const date = new Date(baseDate);
    switch(durationUnit){
        case "DAY":
            date.setDate(
                date.getDate() + duration
            );
            break;
        case "MONTH":
            date.setMonth(
                date.getMonth() + duration
            );
            break;
        case "YEAR":
            date.setFullYear(
                date.getFullYear() + duration
            );
            break;
        default:
            throw new Error(
                "Unidad de duración inválida"
            );
    }
    return date;
};


export const createTrialLicense = async (businessId,days = 14) => {
    const exists = await License.findOne({ where:{ business_id:businessId } });

    if(exists){
        throw new Error(
            "El negocio ya posee una licencia"
        );
    }

    const now = new Date();
    const license = await License.create({
        business_id:businessId,
        license_key:
            generateLicenseKey(),
        type:"TRIAL_PERIOD",
        duration:days,
        duration_unit:"DAY",
        status:"ACTIVE",
        activated_at:now,
        expires_at: calculateExpirationDate( days, "DAY", now )
    });

    return license;
};

export const getLicenseByBusiness = async (businessId) => {
    const license = await License.findOne({
        where: {
            business_id: businessId,
            status: "ACTIVE"
        }
    });

    if (!license) {
        throw new Error(
            "Licencia activa no encontrada"
        );
    }

    return license;
};

export const getLicenseByKey = async ( licenseKey ) => {
    const license = await License.findOne({ where:{ license_key:licenseKey } });

    if(!license){
        throw new Error(
            "Clave de licencia inválida"
        );
    }

    return license;
};

export const validateLicense = async ( businessId ) => {
    const license = await getLicenseByBusiness( businessId );

    const now = new Date();

    if( license.status === "SUSPENDED"){
        throw new Error(
            "Licencia suspendida"
        );
    }

    if( license.status === "EXPIRED" ){
        throw new Error(
            "Licencia expirada"
        );
    }

    if( license.type !== "LIFETIME" && license.expires_at ){
        const expiration =
            new Date(
                license.expires_at
            );
        const graceDate =
            new Date(expiration);

        graceDate.setDate(
            graceDate.getDate() +
            license.grace_period_days
        );

        if(now > graceDate){
            await license.update({
                status:"EXPIRED",
                last_validation:now
            });

            throw new Error(
                "Licencia expirada"
            );
        }
    }
    await license.update({
        last_validation:now
    });

    return { valid:true, license };
};

export const activateLicense = async ( licenseKey ) => {
    const license = await getLicenseByKey( licenseKey );

    await license.update({
        status:"ACTIVE",
        activated_at:new Date()
    });

    return license;
};

export const renewLicense = async ( businessId, duration, durationUnit ) => {

    const license = await getLicenseByBusiness( businessId );
    const expires = calculateExpirationDate( duration,  durationUnit );

    await license.update({
        type:"SUBSCRIPTION",
        duration,
        duration_unit:durationUnit,
        status:"ACTIVE",
        activated_at:new Date(),
        expires_at:expires
    });

    return license;
};

export const extendLicense = async ( businessId, duration, durationUnit ) => {

    const license = await getLicenseByBusiness(  businessId );
    let baseDate = license.expires_at ? new Date(license.expires_at) : new Date();

    const newExpiration = calculateExpirationDate( duration, durationUnit, baseDate );

    await license.update({
        expires_at:newExpiration,
        status:"ACTIVE"
    });

    return license;
};

export const createLifetimeLicense = async ( businessId ) => {

    const license = await getLicenseByBusiness( businessId );

    await license.update({
        type:"LIFETIME",
        duration:null,
        duration_unit:null,
        expires_at:null,
        status:"ACTIVE",
        activated_at:new Date()
    });

    return license;
};

export const suspendLicense = async ( businessId ) => {
    const license = await getLicenseByBusiness( businessId );
    await license.update({
        status:"SUSPENDED"
    });

    return license;
};

export const reactivateLicense = async ( businessId ) => {
    const license = await getLicenseByBusiness( businessId ); 
    await license.update({
        status:"ACTIVE"
    });

    return license;
};

export const changeLicenseType = async ( businessId, type ) => {

    const allowed = [
        "SUBSCRIPTION",
        "LIFETIME",
        "TRIAL_PERIOD"
    ];

    if(!allowed.includes(type)){
        throw new Error(
            "Tipo de licencia inválido"
        );
    }

    const license = await getLicenseByBusiness( businessId );
    await license.update({ type });

    return license;
};

export const revokeLicense = async ( businessId ) => {
    const license = await getLicenseByBusiness( businessId );
    await license.destroy();

    return {
        message:
            "Licencia eliminada correctamente"
    };
};

export const regenerateLicenseKey = async (  businessId ) => {

    const license = await getLicenseByBusiness( businessId );
    await license.update({ license_key: generateLicenseKey() });

    return license;
};

export const getLicenseStatus = async ( businessId ) => {
    const license = await getLicenseByBusiness( businessId );

    const now = new Date();
    let daysRemaining = null;

    if(license.expires_at){
        const diff = new Date(license.expires_at) - now;
        daysRemaining = Math.ceil( diff / (1000 * 60 * 60 * 24));
    }

    return {
        type:license.type,
        status:license.status,
        expires_at: license.expires_at,
        days_remaining: daysRemaining
    };
};

//Metodos para generación de nuevas licencias para negocios con licencias ya expiradas.
export const getExpiredLicenses = async () => {
    const now = new Date();

    const fiveDaysLater = new Date();
    fiveDaysLater.setDate(now.getDate() + 5);

    const businesses = await License.findAll({
        attributes: [
            "business_id",
            "status",
            "expires_at"
        ],
        where: {
            status: {
                [Op.in]: [
                    "ACTIVE",
                    "EXPIRED"
                ]
            }
        },
        order: [
            ["business_id", "ASC"],
            ["expires_at", "DESC"]
        ],
        raw: true
    });

    const licensesByBusiness = {};

    for (const license of businesses) {
        if (!licensesByBusiness[license.business_id]) {
            licensesByBusiness[license.business_id] = license;
        }
    }

    const expiredBusinesses = Object.values(licensesByBusiness)
        .filter(license => {

            const expiresAt = new Date(license.expires_at);

            return (
                license.status === "EXPIRED" ||
                (
                    license.status === "ACTIVE" &&
                    expiresAt >= now &&
                    expiresAt <= fiveDaysLater
                )
            );
        })
        .map(license => license.business_id);

    return {
        business: expiredBusinesses
    };
};

export const recreateExpiredLicenses = async (businessIds) => {
    const results = [];

    const now = new Date();
    const fiveDaysLater = new Date();
    fiveDaysLater.setDate(now.getDate() + 5);

    for (const businessId of businessIds) {
        const activeLicense = await License.findOne({
            where: {
                business_id: businessId,
                status: {
                    [Op.in]: [
                        "ACTIVE",
                        "EXPIRED"
                    ]
                },
                expires_at: {
                    [Op.between]: [now, fiveDaysLater]
                }
            }
        });

        if (!activeLicense) {
            results.push({
                business_id: businessId,
                message: "No existe una licencia próxima a vencer en los próximos 5 días"
            });
            continue;
        }

        const pendingLicense = await License.findOne({
            where: {
                business_id: businessId,
                status: "PENDING"
            }
        });

        if (pendingLicense) {
            results.push({
                business_id: businessId,
                message: "El negocio ya tiene una licencia pendiente"
            });
            continue;
        }

        const newLicense = await License.create({
            business_id: businessId,
            license_key: generateLicenseKey(),
            type: "SUBSCRIPTION",
            duration: 1,
            duration_unit: "MONTH",
            status: "PENDING",
            activated_at: null,
            expires_at: null
        });
        const business = await getBusinessById(businessId);
        results.push({
            business_id: businessId,
            business_name: business.name,
            license_id: newLicense.id,
            license_key: newLicense.license_key,
            expiration_date: newLicense.expires_at,
            message: "Licencia creada correctamente"
        });
    }

    return results;
};

export const processExpiredLicenses = async () => {
    const expiredBusinesses = await getExpiredLicenses();
    const businessIds = expiredBusinesses.business;

    if (!businessIds.length) {
        return [];
    }
    return await recreateExpiredLicenses(businessIds);
};

const replacePreviousLicense = async (businessId, newLicenseId) => {
    const previousLicense = await License.findOne({
        where: {
            business_id: businessId,
            id: {
                [Op.ne]: newLicenseId
            },
            status: {
                [Op.in]: [
                    "ACTIVE",
                    "EXPIRED"
                ]
            }
        },
        order: [
            ["createdAt", "DESC"]
        ]
    });

    if (previousLicense) {
        await previousLicense.update({
            status: "EXPIRED"
        });
    }
};

export const activatePendingLicense = async (businessId, licenseKey) => {
    const license = await License.findOne({
        where: {
            license_key: licenseKey,
            business_id: businessId,
            status: "PENDING"
        }
    });

    if (!license) {
        throw new Error(
            "Licencia pendiente no encontrada o ya activada"
        );
    }

    const now = new Date();
    const expirationDate = calculateExpirationDate(
        license.duration,
        license.duration_unit,
        now
    );

    await replacePreviousLicense(
        license.business_id,
        license.id
    );

    await license.update({
        status: "ACTIVE",
        activated_at: now,
        expires_at: expirationDate
    });

    await cacheService.del(
        CacheKeys.HAS_PENDING_LICENSE,
        license.business_id
    );

    const business = await Business.findByPk(license.business_id);

    try {
        await emailService.sendLicenseActivatedEmail({
            developerEmail: "guerrerog675@gmail.com",
            license: {
                business_id: license.business_id,
                business_name: business?.name ?? "Desconocido",
                license_id: license.id,
                license_key: license.license_key,
                expiration_date: license.expires_at
            }
        });
    } catch (error) {
        console.error("Error enviando correo de licencia activada:", error);
    }

    return license;
};

export const hasPendingLicense = async (businessId) => {
    return await cacheService.remember(
        CacheKeys.HAS_PENDING_LICENSE,
        async () => {
            const pendingLicense = await License.findOne({
                where: {
                    business_id: businessId,
                    status: "PENDING"
                }
            });
            return !!pendingLicense;
        },
        CacheTTL.ONE_DAY,
        businessId
    );
};