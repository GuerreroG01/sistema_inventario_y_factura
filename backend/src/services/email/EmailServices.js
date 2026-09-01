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

    async sendMarketingCampaign({
        customer,
        businessName
    }) {
        let template = await this.loadTemplate(
            "marketing-campaign.html"
        );

        const renderMarketingProduct = (product) => {

            const hasActivePromotion =
                product.promotion &&
                product.promotion.price &&
                product.promotion.start &&
                product.promotion.end;

            // Formatear fechas de promoción
            let promotionPeriod = "";

            if (hasActivePromotion) {
                const startDate = new Date(
                    product.promotion.start
                ).toLocaleDateString("es-NI");

                const endDate = new Date(
                    product.promotion.end
                ).toLocaleDateString("es-NI");

                promotionPeriod = `
                    <div
                        class="promotion-period"
                        style="
                            margin-top:10px;
                            font-size:11px;
                            color:#166534;
                            line-height:1.5;
                        "
                    >
                        Promoción válida del
                        <strong>${startDate}</strong>
                        al
                        <strong>${endDate}</strong>
                    </div>
                `;
            }

            return `
                <table
                    role="presentation"
                    width="100%"
                    class="product-card"
                    cellspacing="0"
                    cellpadding="0"
                    border="0"
                    style="
                        margin-bottom:16px;
                        border:1px solid ${
                            hasActivePromotion
                                ? "#bbf7d0"
                                : "#e2e8f0"
                        };
                        border-radius:12px;
                        border-collapse:separate;
                        background:#ffffff;
                        box-shadow:0 1px 3px 0 rgba(0, 0, 0, 0.02);
                    "
                >
                    <tr>
                        <td
                            class="product-content"
                            style="padding:20px;"
                        >

                            <table
                                role="presentation"
                                width="100%"
                                cellspacing="0"
                                cellpadding="0"
                                border="0"
                            >
                                <tr>

                                    <td
                                        class="product-info"
                                        valign="top"
                                        width="65%"
                                    >

                                        <h3
                                            style="
                                                margin:0 0 6px 0;
                                                font-size:16px;
                                                font-weight:700;
                                                color:#0f172a;
                                                line-height:1.4;
                                            "
                                        >
                                            ${product.name}
                                        </h3>

                                        ${
                                            !["unidad", "unit"].includes(
                                                product.unit?.toLowerCase()
                                            )
                                                ? `
                                                    <div
                                                        style="
                                                            margin:0 0 12px 0;
                                                            font-size:12px;
                                                            color:#64748b;
                                                        "
                                                    >
                                                        Tipo:
                                                        <strong>
                                                            ${product.unit || "Unidad"}
                                                        </strong>
                                                    </div>
                                                `
                                                : ""
                                        }

                                        <!-- Categoría -->
                                        <table
                                            role="presentation"
                                            cellspacing="0"
                                            cellpadding="0"
                                            border="0"
                                            style="
                                                background:#f1f5f9;
                                                border:1px solid #e2e8f0;
                                                border-radius:20px;
                                            "
                                        >
                                            <tr>

                                                <td
                                                    style="
                                                        padding:4px 10px;
                                                        vertical-align:middle;
                                                    "
                                                >
                                                    <svg
                                                        width="12"
                                                        height="12"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="#475569"
                                                        stroke-width="2"
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                    >
                                                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                                                    </svg>
                                                </td>

                                                <td
                                                    style="
                                                        padding:4px 10px 4px 0;
                                                        vertical-align:middle;
                                                    "
                                                >
                                                    <span
                                                        style="
                                                            color:#334155;
                                                            font-size:11px;
                                                            font-weight:600;
                                                            text-transform:uppercase;
                                                            letter-spacing:0.04em;
                                                        "
                                                    >
                                                        ${product.category || ""}
                                                    </span>
                                                </td>

                                            </tr>
                                        </table>

                                    </td>

                                    <td
                                        class="product-price"
                                        width="35%"
                                        align="right"
                                        valign="middle"
                                    >

                                        ${
                                            hasActivePromotion
                                                ? `
                                                    <!-- Precio promocional -->

                                                    <table
                                                        role="presentation"
                                                        align="right"
                                                        class="price-box"
                                                        cellspacing="0"
                                                        cellpadding="0"
                                                        border="0"
                                                        style="
                                                            background:#f0fdf4;
                                                            border:1px solid #bbf7d0;
                                                            border-radius:10px;
                                                        "
                                                    >
                                                        <tr>
                                                            <td
                                                                style="
                                                                    padding:10px 14px;
                                                                    text-align:right;
                                                                "
                                                            >

                                                                <div
                                                                    style="
                                                                        font-size:10px;
                                                                        font-weight:700;
                                                                        color:#64748b;
                                                                        text-transform:uppercase;
                                                                        letter-spacing:0.05em;
                                                                        margin-bottom:2px;
                                                                    "
                                                                >
                                                                    Antes
                                                                </div>

                                                                <div
                                                                    style="
                                                                        font-size:12px;
                                                                        color:#94a3b8;
                                                                        text-decoration:line-through;
                                                                        margin-bottom:3px;
                                                                    "
                                                                >
                                                                    C$ ${product.price}
                                                                </div>

                                                                <div
                                                                    style="
                                                                        font-size:10px;
                                                                        font-weight:700;
                                                                        color:#166534;
                                                                        text-transform:uppercase;
                                                                        letter-spacing:0.05em;
                                                                        margin-bottom:2px;
                                                                    "
                                                                >
                                                                    Precio promoción
                                                                </div>

                                                                <div
                                                                    style="
                                                                        font-size:18px;
                                                                        font-weight:800;
                                                                        color:#15803d;
                                                                    "
                                                                >
                                                                    C$ ${product.promotion.price}
                                                                </div>

                                                            </td>
                                                        </tr>
                                                    </table>

                                                    ${promotionPeriod}
                                                `
                                                : `
                                                    <!-- Precio normal -->

                                                    <table
                                                        role="presentation"
                                                        align="right"
                                                        cellspacing="0"
                                                        cellpadding="0"
                                                        border="0"
                                                        style="
                                                            background:#f0fdf4;
                                                            border:1px solid #dcfce7;
                                                            border-radius:10px;
                                                        "
                                                    >
                                                        <tr>
                                                            <td
                                                                style="
                                                                    padding:10px 14px;
                                                                    text-align:right;
                                                                "
                                                            >

                                                                <div
                                                                    style="
                                                                        font-size:10px;
                                                                        font-weight:700;
                                                                        color:#166534;
                                                                        text-transform:uppercase;
                                                                        letter-spacing:0.05em;
                                                                        margin-bottom:2px;
                                                                    "
                                                                >
                                                                    Precio
                                                                </div>

                                                                <div
                                                                    style="
                                                                        font-size:16px;
                                                                        font-weight:800;
                                                                        color:#15803d;
                                                                    "
                                                                >
                                                                    C$ ${product.price}
                                                                </div>

                                                            </td>
                                                        </tr>
                                                    </table>
                                                `
                                        }

                                    </td>

                                </tr>
                            </table>

                        </td>
                    </tr>
                </table>
            `;
        };

        const multipleBranches = customer.products.length > 1;
        const productsHTML = customer.products
            .map(branch => {

                const productsHTML = branch.products
                    .map(renderMarketingProduct)
                    .join("");

                if (!multipleBranches) {
                    return productsHTML;
                }

                return `
                    <!-- Encabezado de sucursal -->
                    <div
                        style="
                            margin:28px 0 16px 0;
                            padding:12px 16px;
                            background:#f8fafc;
                            border:1px solid #e2e8f0;
                            border-radius:10px;
                        "
                    >
                        <div
                            style="
                                font-size:11px;
                                font-weight:700;
                                color:#64748b;
                                text-transform:uppercase;
                                letter-spacing:0.05em;
                                margin-bottom:3px;
                            "
                        >
                            Disponible en
                        </div>

                        <div
                            style="
                                font-size:16px;
                                font-weight:800;
                                color:#0f172a;
                            "
                        >
                            📍 ${branch.branchName}
                        </div>
                    </div>

                    ${productsHTML}
                `;
            })
            .join("");

        template = template
            .replace(
                "{{customer_name}}",
                customer.customer
            )
            .replaceAll(
                "{{business_name}}",
                businessName
            )
            .replace(
                "{{products}}",
                productsHTML
            )
            .replace(
                "{{year}}",
                new Date().getFullYear().toString()
            );

        const text = `
    Hola ${customer.customer}

    Tenemos productos recomendados para ti:

    ${customer.products
        .map(product => {

            if (
                product.promotion &&
                product.promotion.price &&
                product.promotion.start &&
                product.promotion.end
            ) {
                const startDate = new Date(
                    product.promotion.start
                ).toLocaleDateString("es-NI");

                const endDate = new Date(
                    product.promotion.end
                ).toLocaleDateString("es-NI");

                return `${product.name} - Precio normal: C$${product.price} - Precio promoción: C$${product.promotion.price} - Promoción válida del ${startDate} al ${endDate}`;
            }

            return `${product.name} - C$${product.price}`;
        })
        .join("\n")}

    Gracias por preferirnos.
    `;

        return this.sendEmail({
            to: customer.customerEmail,
            subject: `Productos recomendados para ti`,
            html: template,
            text
        });
    }
}

export const emailService = new EmailService();