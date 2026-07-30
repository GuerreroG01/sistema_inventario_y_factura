import { Op } from "sequelize";
import Customer from "../models/Customers.js";
import Sales from "../models/Sales.js";
import SaleDetails from "../models/SaleDetails.js";
import Product from "../models/Products.js";

export const getAllCustomers = async ({ page = 1, limit = 10, name, phone, status, hasDebt, businessId } = {}) => {
    page = Number(page);
    limit = Number(limit);

    const offset = (page - 1) * limit;

    const where = {
        business_id: businessId
    };

    if (name) {
        where.name = {
            [Op.iLike]: `%${name}%`
        };
    }

    if (phone) {
        where.phone = {
            [Op.iLike]: `%${phone}%`
        };
    }

    if (status) {
        where.status = status;
    }

    if (hasDebt === "true") {
        where.balance = {
            [Op.gt]: 0
        };
    }

    const { count, rows } = await Customer.findAndCountAll({
        where,
        order: [["name", "ASC"]],
        limit,
        offset
    });

    return {
        data: rows,
        pagination: {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit)
        }
    };
};

export const getById = async (id, businessId) => {
    const customer = await Customer.findOne({
        where: {
            id,
            business_id: businessId
        }
    });

    if (!customer) {
        throw new Error("Cliente no encontrado.");
    }
    return customer;
};

export const createCustomer = async ({ name, phone, email, address, identification, credit_limit = 0, created_by, businessId }) => {
    const conditions = [];

    if (phone) {
        conditions.push({ phone });
    }
    if (email) {
        conditions.push({ email: email.toLowerCase() });
    }
    if (identification) {
        conditions.push({ identification });
    }
    if (conditions.length > 0) {
        const existingCustomer = await Customer.findOne({
            where: {
                business_id: businessId,
                [Op.or]: conditions
            }
        });

        if (existingCustomer) {
            if (phone && existingCustomer.phone === phone) {
                throw new Error("Ya existe un cliente con ese número de teléfono.");
            }
            if (email && existingCustomer.email === email.toLowerCase()) {
                throw new Error("Ya existe un cliente con ese correo electrónico.");
            }
            if ( identification && existingCustomer.identification === identification ) {
                throw new Error("Ya existe un cliente con esa identificación.");
            }
        }
    }

    return await Customer.create({
        name: name.trim(),
        phone: phone?.trim() || null,
        email: email?.trim().toLowerCase() || null,
        address: address?.trim() || null,
        identification: identification?.trim() || null,
        credit_limit,
        balance: 0,
        created_by,
        business_id: businessId
    });
};

export const updateCustomer = async ( id, { name, phone, email, address, identification, credit_limit, status, updated_by, businessId }) => {
    const customer = await Customer.findOne({
        where: {
            id,
            business_id: businessId
        }
    });

    if (!customer) {
        throw new Error("Cliente no encontrado.");
    }

    const conditions = [];
    if (phone) {
        conditions.push({ phone: phone.trim() });
    }

    if (email) {
        conditions.push({ email: email.trim().toLowerCase() });
    }

    if (identification) {
        conditions.push({ identification: identification.trim() });
    }

    if (conditions.length > 0) {
        const existingCustomer = await Customer.findOne({
            where: {
                business_id: businessId,
                id: {
                    [Op.ne]: id
                },
                [Op.or]: conditions
            }
        });

        if (existingCustomer) {
            if (phone && existingCustomer.phone === phone.trim()) {
                throw new Error("Ya existe un cliente con ese número de teléfono.");
            }
            if ( email && existingCustomer.email === email.trim().toLowerCase()) {
                throw new Error("Ya existe un cliente con ese correo electrónico.");
            }
            if ( identification && existingCustomer.identification === identification.trim()) {
                throw new Error("Ya existe un cliente con esa identificación.");
            }
        }
    }
    await customer.update({
        name: name.trim(),
        phone: phone?.trim() || null,
        email: email?.trim().toLowerCase() || null,
        address: address?.trim() || null,
        identification: identification?.trim() || null,
        credit_limit,
        status,
        updated_by
    });
    return customer;
};

export const changeCustomerStatus = async ( id, status, updated_by, businessId ) => {
    const customer = await Customer.findOne({
        where: {
            id,
            business_id: businessId
        }
    });
    if (!customer) {
        throw new Error("Cliente no encontrado.");
    }

    await customer.update({status, updated_by});
    return customer;
};

export const getCustomerByName = async (query, businessId) => {
    const page = parseInt(query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const where = {
        business_id: businessId,
        status: "ACTIVE"
    };

    if (query.search) {
        where[Op.or] = [
            {
                name: {
                    [Op.iLike]: `%${query.search}%`
                }
            },
            {
                identification: {
                    [Op.iLike]: `%${query.search}%`
                }
            }
        ];
    }

    const { count, rows } = await Customer.findAndCountAll({
        where,
        attributes: ["id", "name", "identification"],
        order: [["name", "ASC"]],
        limit,
        offset
    });

    return {
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
        customers: rows
    };
};

export const getCustomerSummary = async (id, businessId) => {
    const customerExists = await Customer.findOne({
        where: {
            id,
            business_id: businessId,
        },
        attributes: ["id"],
    });

    if (!customerExists) {
        throw new Error("Cliente no encontrado.");
    }

    const where = { client_id: id, business_id: businessId };

    const [
        totalSales, totalPurchased, creditPurchases, cashPurchases, pendingSales, lastPurchase,
    ] = await Promise.all([
        Sales.count({ where }),

        Sales.sum("total", { where }),

        Sales.sum("total", {
            where: {
                ...where,
                payment_type: "CREDIT",
            },
        }),

        Sales.sum("total", {
            where: {
                ...where,
                payment_type: {
                    [Op.ne]: "CREDIT",
                },
            },
        }),

        Sales.count({
            where: {
                ...where,
                status: "PENDING",
            },
        }),

        Sales.max("fecha", {
            where,
        }),
    ]);

    return {
        totalSales: Number(totalSales ?? 0),
        totalPurchased: Number(totalPurchased ?? 0),
        creditPurchases: Number(creditPurchases ?? 0),
        cashPurchases: Number(cashPurchases ?? 0),
        pendingSales: Number(pendingSales ?? 0),
        lastPurchase,
    };
};

export const getCustomerSalesHistory = async (
    id,
    businessId,
    page = 1,
    limit = 10
) => {
    const customer = await Customer.findOne({
        where: {
            id,
            business_id: businessId,
        },
        attributes: ["id"],
    });

    if (!customer) {
        throw new Error("Cliente no encontrado.");
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Sales.findAndCountAll({
        where: {
            client_id: id,
            business_id: businessId,
        },
        attributes: [
            "id",
            "fecha",
            "total",
            "payment_type",
            "status",
            "createdAt"
        ],
        order: [
            ["fecha", "DESC"]
        ],
        limit,
        offset,
    });

    return {
        sales: rows.map((sale) => ({
            id: sale.id,
            fecha: sale.fecha,
            total: Number(sale.total),
            paymentType: sale.payment_type,
            status: sale.status,
            createdAt: sale.createdAt,
        })),
        pagination: {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
        },
    };
};

export const getCustomerIndicators = async (id, businessId) => {

    const customer = await Customer.findOne({
        where: {
            id,
            business_id: businessId,
        },
        attributes: [
            "id",
            "createdAt"
        ],
    });

    if (!customer) {
        throw new Error("Cliente no encontrado.");
    }

    const where = {
        client_id: id,
        business_id: businessId,
    };

    const [
        lastPurchase, pendingSales,
    ] = await Promise.all([
        Sales.max("fecha", {
            where,
        }),
        Sales.count({
            where: {
                ...where,
                status: "PENDING",
            },
        }),
    ]);


    return {
        customerSince: customer.createdAt,
        lastPurchase,
        pendingSales: Number(pendingSales ?? 0),
    };
};

export const getCustomerPreferences = async (id, businessId) => {
    const customer = await Customer.findOne({
        where: {
            id,
            business_id: businessId
        },
        attributes: ["id"]
    });

    if (!customer) {
        throw new Error("Cliente no encontrado.");
    }

    const sales = await Sales.findAll({
        where: {
            client_id: id,
            business_id: businessId
        },
        attributes: [
            "id",
            "payment_type",
            "createdAt",
            "updatedAt",
            "status"
        ],
        include: [
            {
                model: SaleDetails,
                as: "details",
                attributes: [
                    "cantidad",
                    "product_id"
                ],
                include: [
                    {
                        model: Product,
                        as: "product",
                        attributes: [
                            "category",
                            "name"
                        ]
                    }
                ]
            }
        ]
    });

    if (!sales.length) {
        return {
            mostPurchasedCategory: null,
            favoritePaymentType: null,
            mostRepeatedQuantity: null,
            averageQuantity: 0,
            creditBehavior: null
        };
    }

    const categoryCounter = {};

    const quantityCounter = {};

    sales.forEach((sale) => {
        sale.details.forEach((detail)=>{
            const category = detail.product?.category;
            if(category){
                categoryCounter[category] =
                    (categoryCounter[category] || 0) + detail.cantidad;
            }

            quantityCounter[detail.cantidad] =
                (quantityCounter[detail.cantidad] || 0) + 1;

        });

    });

    const mostPurchasedCategory =
        Object.entries(categoryCounter)
        .sort((a,b)=>b[1]-a[1])[0]?.[0] ?? null;

    const mostRepeatedQuantity =
        Object.entries(quantityCounter)
        .sort((a,b)=>b[1]-a[1])[0]?.[0] ?? null;


    const totalQuantities =
        Object.entries(quantityCounter)
        .reduce(
            (acc,[quantity, repetitions]) =>
                acc + (Number(quantity) * repetitions),
            0
        );

    const totalItems =
        sales.reduce(
            (acc,sale)=>acc + sale.details.length,
            0
        );

    const averageQuantity =
        totalItems
        ? Number(totalQuantities / totalItems).toFixed(2)
        : 0;

    const paymentCounter = {};

    sales.forEach((sale)=>{

        paymentCounter[sale.payment_type] =
            (paymentCounter[sale.payment_type] || 0) + 1;

    });

    const favoritePaymentType =
        Object.entries(paymentCounter)
        .sort((a,b)=>b[1]-a[1])[0]?.[0] ?? null;


    const creditSales = sales.filter(
        sale => sale.payment_type === "CREDIT"
    );


    let creditBehavior = null;


    if(creditSales.length){

        const paymentTimes = creditSales.map((sale)=>{

            const created =
                new Date(sale.createdAt);

            const updated =
                new Date(sale.updatedAt);


            return Math.floor(
                (updated - created)
                /
                (1000 * 60 * 60 * 24)
            );

        });


        const averagePaymentDays =
            paymentTimes.reduce(
                (a,b)=>a+b,
                0
            )
            /
            paymentTimes.length;


        creditBehavior = {
            creditPurchases: creditSales.length,
            averagePaymentDays:
                Number(averagePaymentDays.toFixed(1)),
            description:
                averagePaymentDays <= 3
                    ? "Cliente paga rápido"
                    : averagePaymentDays <= 15
                        ? "Cliente paga normalmente"
                        : "Cliente suele tardar en pagar"
        };

    }
    return {
        mostPurchasedCategory,
        mostRepeatedQuantity: Number(mostRepeatedQuantity),
        averageQuantity,
        favoritePaymentType,
        creditBehavior
    };
};