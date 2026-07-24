import { emailService } from "../email/EmailServices.js";
import { Business } from "../../models/Business.js";

export const notifyLicenseActivated = async (license) => {
    const business = await Business.findByPk(license.business_id);

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

    console.log(
        `[${new Date().toISOString()}] Licencia ${license.id} activada para negocio ${license.business_id}`
    );
};