import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EmailService {

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
        this.verifyConnection();
    }

    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log("Servicio de correo conectado correctamente");
        } catch (error) {
            console.error("Error conectando con SMTP",error);
        }
    }

    async sendEmail({ to, subject, html, text }) {
        try {
            const info = await this.transporter.sendMail({
                from: `"Inventarium-System" <${process.env.SMTP_USER}>`,
                to,
                subject,
                html,
                text
            });
            console.log(
                `Correo enviado: ${info.messageId}`
            );
            return info;

        } catch (error) {
            console.error("Error enviando correo:",error);
            throw error;
        }
    }

    async loadTemplate(templateName) {
        const templatePath = path.join(
            __dirname,
            "templates",
            templateName
        );
        return await fs.readFile(
            templatePath,
            "utf-8"
        );
    }

    async sendLicenseEmail({ developerEmail, licenses }) {
        let template = await this.loadTemplate(
            "license-created.html"
        );
        const licensesRows = licenses
            .map(license => `
                <tr>
                    <td style="padding:12px;border:1px solid #e5e7eb;text-align:center;">
                        ${license.business_id}
                    </td>
                    
                    <td style="padding:12px;border:1px solid #e5e7eb;text-align:center;">
                        ${license.business_name}
                    </td>

                    <td style="padding:12px;border:1px solid #e5e7eb;text-align:center;">
                        ${license.license_id}
                    </td>

                    <td style="padding:12px;border:1px solid #e5e7eb;font-family:monospace;">
                        ${license.license_key}
                    </td>

                    <td style="padding:12px;border:1px solid #e5e7eb;text-align:center;">
                        ${license.expiration_date ?? "Pendiente de activación"}
                    </td>
                </tr>
            `)
            .join("");

        template = template
            .replace(
                "{{developer}}",
                "Gabriel"
            )
            .replace(
                "{{licenses}}",
                licensesRows
            )
            .replace(
                "{{year}}",
                new Date().getFullYear()
            );

        const text = licenses
            .map(
                license =>
                    `Business: ${license.business_id}
                    Negocio: ${license.business_name}
                    Licencia: ${license.license_id}
                    Clave: ${license.license_key}
                    Expira: ${license.expiration_date ?? "Pendiente de activación"}`
            )
            .join("\n\n");

        return this.sendEmail({
            to: developerEmail,
            subject: `Se generaron ${licenses.length} nueva(s) licencia(s)`,
            html: template,
            text
        });
    }
    async sendLicenseActivatedEmail({ developerEmail, license }) {
        let template = await this.loadTemplate(
            "license-activated.html"
        );

        template = template
            .replace("{{developer}}", "Gabriel")
            .replace("{{business_id}}", license.business_id)
            .replace("{{business_name}}", license.business_name)
            .replace("{{license_id}}", license.license_id)
            .replace("{{license_key}}", license.license_key)
            .replace(
                "{{expiration_date}}",
                license.expiration_date
                    ? new Date(license.expiration_date).toLocaleString()
                    : "No definida"
            )
            .replace("{{year}}", new Date().getFullYear());

        const text = `
            Se ha activado una licencia.

            Business ID: ${license.business_id}
            Negocio: ${license.business_name}
            License ID: ${license.license_id}
            License Key: ${license.license_key}
            Expira: ${
                license.expiration_date
                    ? new Date(license.expiration_date).toLocaleString()
                    : "No definida"
            }
        `;
        return this.sendEmail({
            to: developerEmail,
            subject: `Licencia activada - ${license.business_name}`,
            html: template,
            text
        });
    }
}

export const emailService = new EmailService();