import { Op, literal } from "sequelize";
import Customer from "../models/Customers.js";
import CustomerMarketing from "../models/CustomerMarketing.js";
import Sales from "../models/Sales.js";
import SaleDetails from "../models/SaleDetails.js";
import Product from "../models/Products.js";
import { cacheService, CacheKeys, CacheTTL } from "../services/cache/index.js";

//Obtiene los customers en base al id del negocio.
export const getMarketingCustomers = async (businessId) => {

    const customers = await CustomerMarketing.findAll({
        where: {
            business_id: businessId,
            marketing_opt_in: true,
            marketing_disabled: false
        },
        attributes: [],
        include: [
            {
                model: Customer,
                as: "customer",
                attributes: [
                    "id",
                    "name",
                    "email"
                ],
                where: {
                    status: "ACTIVE"
                },
                required: true
            }
        ]
    });

    return customers.map(item => ({
        id: item.customer.id,
        name: item.customer.name,
        correo: item.customer.email
    }));

};
//Deshabilita los customers que tienen el contador mayor o igual a 5, entonces para excluirlo de las campañas automáticas.
export const disableCustomerMarketingIfLimitReached = async ( customerId, businessId ) => {
    try {
        const customerMarketing =
            await CustomerMarketing.findOne({
                where: {
                    customer_id: customerId,
                    business_id: businessId
                }
            });

        if (!customerMarketing) {
            throw new Error(
                "El cliente no tiene configuración de marketing"
            );
        }

        if (customerMarketing.marketing_disabled) {
            return {
                disabled: true,
                customerMarketing
            };
        }

        if (customerMarketing.marketing_sent_count >= 5) {
            await customerMarketing.update({
                marketing_opt_in: false,
                marketing_disabled: true,
                marketing_disabled_reason:
                    "Límite máximo de campañas alcanzado"
            });

            return {
                disabled: true,
                customerMarketing
            };
        }
        return {
            disabled: false,
            customerMarketing
        };
    } catch (error) {
        throw new Error(
            `Error validando límite de marketing: ${error.message}`
        );
    }
};

export const canReceiveMarketingByDate = async ( customerId, businessId ) => {

    const customerMarketing =
        await CustomerMarketing.findOne({
            where: {
                customer_id: customerId,
                business_id: businessId
            },
            attributes: ["next_marketing_at"]
        });

    if (!customerMarketing) {
        return true;
    }

    if (!customerMarketing.next_marketing_at) {
        return true;
    }

    return new Date() >= new Date(customerMarketing.next_marketing_at);
};
//Evaluación del customer para determinar si es elegible para recibir campañas de marketing, basado en su historial de compras y comportamiento financiero.
export const evaluateCustomerMarketingScore = async ( customerId, businessId ) => {
    const marketingStatus = await disableCustomerMarketingIfLimitReached( customerId, businessId );
    if (marketingStatus.disabled) {
        return {
            customerId,
            score: 0,
            marketingLevel: "DISABLED",
            eligible: false
        };
    }

    const canReceive = await canReceiveMarketingByDate( customerId, businessId );
    if (!canReceive) {
        return {
            customerId,
            score: 0,
            marketingLevel: "WAITING",
            eligible: false
        };
    }
    
    const customer = await Customer.findOne({
        where: {
            id: customerId,
            business_id: businessId
        },
        attributes: [
            "id",
            "name",
            "balance"
        ]
    });

    if (!customer) {
        throw new Error("Cliente no encontrado.");
    }

    const sales = await Sales.findAll({
        where: {
            client_id: customerId,
            business_id: businessId
        },
        attributes: [
            "id",
            "status",
            "createdAt"
        ],
        include: [
            {
                model: SaleDetails,
                as: "details",
                attributes: [
                    "subtotal"
                ]
            }
        ]
    });

    let score = 0;

    const completedSales = sales.filter(
        sale => sale.status !== "REFUNDED"
    );

    /* Compra frecuente (+30)*/
    if (completedSales.length >= 5) {
        score += 30;
    }
    /*Compra reciente (+20)*/

    if (completedSales.length) {
        const lastPurchase = completedSales
            .sort(
                (a,b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            )[0];

        const daysSinceLastPurchase =
            Math.floor(
                (
                    Date.now() -
                    new Date(lastPurchase.createdAt)
                )
                /
                (1000 * 60 * 60 * 24)
            );

        if(daysSinceLastPurchase <= 30){
            score += 20;
        }
        
        if(daysSinceLastPurchase > 180){
            score -= 20;
        }
    }

    /*Alto volumen (+20)*/
    let totalSpent = 0;

    completedSales.forEach((sale)=>{
        sale.details.forEach((detail)=>{
            totalSpent += Number(
                detail.subtotal
            );
        });
    });

    if(totalSpent >= 1500){
        score += 20;
    }

    /*Buen pagador / deuda*/
    const balance = Number(
        customer.balance
    );

    if(balance === 0){
        score += 30;
    } else{
        if(balance <= 500){
            score -= 10;
        } else if(balance <= 2000){
            score -= 25;
        } else{
            score -= 30;
        }
    }

    /* Devoluciones */
    const refundedSales = sales.filter(
        sale => sale.status === "REFUNDED"
    );

    if(refundedSales.length === 1){
        score -= 5;
    } else if(refundedSales.length === 2){
        score -= 10;
    } else if(refundedSales.length >= 3){
        score -= 20;
    }

    /*Nivel de marketing*/
    let marketingLevel;

    if(score >= 80){
        marketingLevel = "EXCELLENT";
    } else if(score >= 60){
        marketingLevel = "GOOD";
    } else if(score >= 40){
        marketingLevel = "REGULAR";
    } else if(score >= 20){
        marketingLevel = "LOW";
    } else{
        marketingLevel = "DISABLED";
    }

    return {
        customerId: customer.id,
        customer: customer.name,
        score,
        marketingLevel,
        eligible: score >= 40
    };
};
//Obtiene las preferencias del cliente en base a su historial de compras, incluyendo categoría favorita, rango de precios y método de pago preferido.
export const getCustomerMarketingPreferences = async ( customerId, businessId ) => {
    const sales = await Sales.findAll({
        where: {
            client_id: customerId,
            business_id: businessId,
            status: {
                [Op.ne]: "REFUNDED"
            }
        },
        attributes: [
            "payment_type"
        ],
        include: [
            {
                model: SaleDetails,
                as: "details",
                attributes: [
                    "precio_unitario"
                ],
                include: [
                    {
                        model: Product,
                        as: "product",
                        attributes: [
                            "category"
                        ]
                    }
                ]
            }
        ]
    });

    if (!sales.length) {
        return {
            customerId: customerId,
            preferences: null
        };
    }

    const categoryCounter = {};
    const paymentCounter = {};
    const prices = [];

    sales.forEach((sale) => {
        paymentCounter[sale.payment_type] =
            (paymentCounter[sale.payment_type] || 0) + 1;

        sale.details.forEach((detail) => {
            prices.push(
                Number(detail.precio_unitario)
            );

            const category =
                detail.product?.category;

            if (category) {
                categoryCounter[category] =
                    (categoryCounter[category] || 0) + 1;
            }
        });
    });

    const favoriteCategory =
        Object.entries(categoryCounter)
        .sort(
            (a, b) => b[1] - a[1]
        )[0]?.[0] ?? null;

    const favoritePaymentType =
        Object.entries(paymentCounter)
        .sort(
            (a, b) => b[1] - a[1]
        )[0]?.[0] ?? null;

    return {
        customerId: customerId,
        preferences: {
            favoriteCategory,
            priceRange: {
                min: Math.min(...prices),
                max: Math.max(...prices)
            },
            favoritePaymentType
        }
    };
};

export const getProducts = async ({ business_id, category, priceMin, priceMax }) => {
    const useCache =
        category &&
        !priceMin &&
        !priceMax;

    const getProductsFromDB = async () => {
        const where = {
            business_id,
            active: true
        };

        if (category) {
            where.category = category;
        }

        if (priceMin || priceMax) {
            where.price = {};

            if (priceMin) {
                where.price[Op.gte] = parseFloat(priceMin);
            }

            if (priceMax) {
                where.price[Op.lte] = parseFloat(priceMax);
            }
        }

        const order = [];

        if (category) {
            order.push([
                literal(`
                    CASE
                        WHEN "hasPromotion" = true
                        AND "promotionEnd" IS NOT NULL
                        AND "promotionEnd" >= CURRENT_TIMESTAMP
                        THEN 1
                        ELSE 0
                    END
                `),
                "DESC"
            ]);
        }

        order.push(["id", "DESC"]);

        return await Product.findAll({
            where,
            order
        });
    };

    if (useCache) {
        const categoryKey =
            `${CacheKeys.MARKETING_PRODUCTS_CATEGORY}:${category}`;

        return await cacheService.remember(
            categoryKey,
            getProductsFromDB,
            CacheTTL.FIVE_MINUTES,
            business_id
        );
    }
    return await getProductsFromDB();
};

export const createCustomerMarketingIfNotExists = async (customerId, businessId) => {
    try {
        const existingMarketing = await CustomerMarketing.findOne({
            where: {
                customer_id: customerId
            }
        });

        if (existingMarketing) {
            return existingMarketing;
        }

        const customerMarketing = await CustomerMarketing.create({
            customer_id: customerId,
            business_id: businessId,
            marketing_opt_in: true,
            marketing_disabled: false,
            marketing_sent_count: 0,
            last_marketing_sent_at: null,
            marketing_disabled_reason: null,
            last_purchase_at: null,
            next_marketing_at: null
        });

        return customerMarketing;

    } catch (error) {
        throw new Error(`Error creando CustomerMarketing: ${error.message}`);
    }
};
//Metodo que utiliza todos los metodos del servicio para seguir el flujo correcto de la campaña
export const generateMarketingCampaign = async (businessId) => {
    const customers = await getMarketingCustomers(businessId);

    const campaign = [];

    for (const customer of customers) {
        const evaluation =
            await evaluateCustomerMarketingScore(
                customer.id,
                businessId
            );

        if (!evaluation.eligible) {
            continue;
        }

        await createCustomerMarketingIfNotExists(
            customer.id,
            businessId
        );

        const preferences =
            await getCustomerMarketingPreferences(
                customer.id,
                businessId
            );
        if (!preferences.preferences) {
            continue;
        }

        const {
            favoriteCategory,
            priceRange
        } = preferences.preferences;

        let products = await getProducts({
            business_id: businessId,
            category: favoriteCategory
        });

        if (products.length < 10) {
            products = await getProducts({
                business_id: businessId,
                priceMin: priceRange.min,
                priceMax: priceRange.max
            });
        }

        campaign.push({
            customerId: customer.id,
            customer: customer.name,
            customerEmail: customer.correo,
            score: evaluation.score,
            marketingLevel: evaluation.marketingLevel,
            preferences: preferences.preferences,
            products: products.map(product => {
                const now = new Date();
                const promotionIsActive =
                    product.hasPromotion === true &&
                    product.promotionPrice !== null &&
                    product.promotionStart !== null &&
                    product.promotionEnd !== null &&
                    new Date(product.promotionStart) <= now &&
                    new Date(product.promotionEnd) >= now;

                return {
                    id: product.id,
                    name: product.name,
                    category: product.category,
                    price: product.price,

                    promotion: promotionIsActive
                        ? {
                            price: product.promotionPrice,
                            start: product.promotionStart,
                            end: product.promotionEnd
                        }
                        : null
                };
            })
        });
    }
    return campaign;
};
//Registra el envío de la campaña de marketing, actualizando la fecha del último mensaje enviado, incrementando el contador de mensajes enviados y estableciendo la próxima fecha permitida para enviar publicidad.
export const registerMarketingSent = async (customerId, businessId) => {
    try {
        const customerMarketing =
            await CustomerMarketing.findOne({
                where: {
                    customer_id: customerId,
                    business_id: businessId
                }
            });
        if (!customerMarketing) {
            throw new Error(
                "El cliente no tiene configuración de marketing"
            );
        }
        const now = new Date();

        const nextMarketingDate = new Date(now);
        nextMarketingDate.setDate(
            nextMarketingDate.getDate() + 30
        );

        await customerMarketing.update({
            last_marketing_sent_at: now,
            marketing_sent_count:
                customerMarketing.marketing_sent_count + 1,
            next_marketing_at:
                nextMarketingDate
        });
        return customerMarketing;

    } catch (error) {
        throw new Error(
            `Error registrando envío de marketing: ${error.message}`
        );
    }
};

export const resetCustomerMarketingAfterPurchase = async ( customerId, businessId, purchaseDate = new Date()) => {
    try {
        const customerMarketing =
            await CustomerMarketing.findOne({
                where: {
                    customer_id: customerId,
                    business_id: businessId
                }
            });

        if (!customerMarketing) {
            return null;
        }

        const nextMarketingDate =
            new Date(purchaseDate);
        nextMarketingDate.setDate(
            nextMarketingDate.getDate() + 30
        );

        await customerMarketing.update({
            marketing_sent_count: 0,
            last_purchase_at: purchaseDate,
            next_marketing_at: nextMarketingDate,
            marketing_disabled: false,
            marketing_disabled_reason: null,
            marketing_opt_in: true
        });
        return customerMarketing;

    } catch(error) {
        throw new Error(
            `Error reiniciando marketing por compra: ${error.message}`
        );
    }
};