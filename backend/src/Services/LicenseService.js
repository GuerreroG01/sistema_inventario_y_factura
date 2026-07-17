import License from "../models/License.js";
import crypto from "crypto";

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

export const getLicenseByBusiness = async ( businessId ) => {
    const license = await License.findOne({ where:{ business_id:businessId } });

    if(!license){
        throw new Error(
            "Licencia no encontrada"
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