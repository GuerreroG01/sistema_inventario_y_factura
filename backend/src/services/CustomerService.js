import { Op } from "sequelize";
import Customer from "../models/Customers.js";

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