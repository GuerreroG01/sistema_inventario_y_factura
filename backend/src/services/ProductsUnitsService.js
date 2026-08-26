import ProductUnit from "../models/ProductsUnits.js";
import Product from "../models/Products.js";
import { Op } from "sequelize";
import InventoryMovService from "./Inventory_MovService.js";
import { normalizeDate } from "../utils/formatters.js";

const generateBarcode = async () => {
    let barcode;
    let exists = true;

    while (exists) {
        barcode = Math.floor(
            1000000000000 + Math.random() * 9000000000000
        ).toString();

        const unit = await ProductUnit.findOne({
            where: {
                barcode
            }
        });

        exists = !!unit;
    }

    return barcode;
};

export const create = async ({
    product_id, unit, barcode, price, cost, stock, hasPromotion, promotionPrice,
    promotionQuantity, promotionStart, promotionEnd, entryDate, expirationDate,
    active, business_id, transaction
}) => {

    const product = await Product.findOne({
        where: {
            id: product_id,
            business_id
        },
        transaction
    });

    if (!product) {
        throw new Error("El producto no existe o no pertenece al negocio.");
    }

    if (!unit || unit.trim() === "") {
        throw new Error("La unidad es obligatoria.");
    }

    if (price === undefined || isNaN(price)) {
        throw new Error("El precio es obligatorio y debe ser un número.");
    }

    if (
        Boolean(hasPromotion) &&
        promotionPrice !== undefined &&
        promotionPrice !== null &&
        Number(promotionPrice) >= Number(price)
    ) {
        throw new Error(
            "El precio de promoción debe ser menor al precio normal."
        );
    }

    if (
        Boolean(hasPromotion) &&
        promotionStart &&
        promotionEnd &&
        new Date(promotionStart) > new Date(promotionEnd)
    ) {
        throw new Error(
            "La fecha de inicio de promoción debe ser anterior a la fecha de fin."
        );
    }

    const finalStock =
        product.type_item === "Servicio"
            ? 0
            : Number(stock ?? 0);

    if (!barcode || barcode.trim() === "") {
        barcode = await generateBarcode();
    }

    const productUnit = await ProductUnit.create(
        {
            product_id,
            unit,
            barcode,
            price,
            cost,
            stock: finalStock,
            hasPromotion: hasPromotion ?? false,
            promotionPrice,
            promotionQuantity,
            promotionStart: normalizeDate(promotionStart),
            promotionEnd: normalizeDate(promotionEnd),
            entryDate: normalizeDate(entryDate),
            expirationDate: normalizeDate(expirationDate),
            active: active ?? true
        },
        {
            transaction
        }
    );

    if (
        product.type_item === "Producto" &&
        finalStock > 0
    ) {
        await InventoryMovService.create({
            product_unit_id: productUnit.id,
            tipo: "entrada",
            cantidad: finalStock,
            observacion: null,
            business_id
        }, transaction);
    }
    return productUnit;
};

export const findById = async (product_unit_id, business_id) => {
    const productUnit = await ProductUnit.findOne({
        where: {
            id: product_unit_id
        },
        include: [
            {
                model: Product,
                as: "product",
                where: {
                    business_id
                },
                attributes: [
                    "id",
                    "name",
                    "category",
                    "type_item",
                    "active"
                ]
            }
        ]
    });

    return productUnit;
};

export const findByProduct = async (product_id, business_id) => {

    const product = await Product.findOne({
        where: {
            id: product_id,
            business_id
        },
        attributes: ["id"]
    });

    if (!product) {
        return null;
    }

    const productUnits = await ProductUnit.findAll({
        where: {
            product_id
        },
        order: [["id", "ASC"]]
    });

    return productUnits;
};

export const update = async (id, business_id, data, transaction) => {
    console.log("UPDATE 1 - buscando productUnit", id);
    const productUnit = await ProductUnit.findOne({
        where: {
            id
        },
        include: [
            {
                model: Product,
                as: "product",
                where: {
                    business_id
                },
                attributes: [
                    "id",
                    "business_id",
                    "type_item"
                ]
            }
        ],
        transaction
    });
    console.log("UPDATE 2 - productUnit encontrada");
    if (!productUnit) {
        return null;
    }
    console.log("UPDATE 3 - stock actual", productUnit.stock);
    const {
        unit, barcode, price, cost, stock, stockChangeSource, stockObservation, hasPromotion, promotionPrice, promotionQuantity, promotionStart,
        promotionEnd, entryDate, expirationDate, active
    } = data;

    const oldStock = Number(productUnit.stock);
    const newStock = stock !== undefined
        ? Number(stock)
        : oldStock;

    if ( productUnit.product.type_item === "Producto" && stock !== undefined && newStock !== oldStock) {
        const diff = newStock - oldStock;

        console.log("UPDATE 4 - cambio de stock", {
            oldStock,
            newStock,
            diff,
            stockChangeSource
        });
        if ( diff < 0 && stockChangeSource !== "promotion" && (!stockObservation || stockObservation.trim() === "")) {
            console.log("UPDATE 5 - falta stockObservation");
            const error = new Error(
                "Debe ingresar una razón cuando se reduce el inventario."
            );
            error.code = "STOCK_REDUCTION_REASON_REQUIRED";
            throw error;
        }
        console.log("UPDATE 6 - antes de InventoryMovService.create");
        await InventoryMovService.create({
            product_unit_id: productUnit.id,
            tipo: "ajuste",
            cantidad: diff,
            observacion:
                diff < 0
                    ? stockChangeSource === "promotion"
                        ? `${Math.abs(diff)} unidades puestas en promoción`
                        : stockObservation
                    : "Aumento manual de stock",
            business_id
        },transaction);
        console.log("UPDATE 7 - después de InventoryMovService.create");
    }
    const finalStock =
        productUnit.product.type_item === "Servicio"
            ? 0
            : newStock;
    console.log("UPDATE 8 - antes de productUnit.update");
    await productUnit.update({
        unit:
            unit ?? productUnit.unit,
        barcode:
            barcode ?? productUnit.barcode,
        price:
            price ?? productUnit.price,
        cost:
            cost ?? productUnit.cost,
        stock:
            finalStock,
        hasPromotion:
            hasPromotion ?? productUnit.hasPromotion,
        promotionPrice:
            promotionPrice ?? productUnit.promotionPrice,
        promotionQuantity:
            promotionQuantity ?? productUnit.promotionQuantity,
        promotionStart:
            normalizeDate(promotionStart) ??
            productUnit.promotionStart,
        promotionEnd:
            normalizeDate(promotionEnd) ??
            productUnit.promotionEnd,
        entryDate:
            normalizeDate(entryDate) ??
            productUnit.entryDate,
        expirationDate:
            normalizeDate(expirationDate) ??
            productUnit.expirationDate,
        active:
            active ?? productUnit.active
    }, {
        transaction
    });
    console.log("UPDATE 9 - después de productUnit.update");
    return productUnit;
};

export const deactivate = async (id, business_id) => {
    const productUnit = await ProductUnit.findOne({
        where: {
            id
        },
        include: [
            {
                model: Product,
                as: "product",
                where: {
                    business_id
                },
                attributes: ["id", "business_id"]
            }
        ]
    });

    if (!productUnit) {
        return null;
    }

    await productUnit.update({
        active: false
    });
    return productUnit;
};

export const deactivateByProduct = async (product_id, business_id) => {

    const product = await Product.findOne({
        where: {
            id: product_id,
            business_id
        },
        attributes: ["id"]
    });

    if (!product) {
        return null;
    }

    await ProductUnit.update(
        {
            active: false
        },
        {
            where: {
                product_id: product.id
            }
        }
    );

    return true;
};

export const adjustStock = async (
    id, business_id, cantidad, observacion = null
) => {

    const productUnit = await ProductUnit.findOne({
        where: {
            id
        },
        include: [
            {
                model: Product,
                as: "product",
                where: {
                    business_id
                },
                attributes: [
                    "id",
                    "business_id",
                    "type_item"
                ]
            }
        ]
    });

    if (!productUnit) {
        return null;
    }

    if (productUnit.product.type_item === "Servicio") {
        const error = new Error(
            "Los servicios no pueden tener movimientos de inventario."
        );

        error.code = "SERVICE_NO_STOCK";

        throw error;
    }

    const adjustment = Number(cantidad);

    if (!Number.isFinite(adjustment) || adjustment === 0) {
        const error = new Error(
            "La cantidad del ajuste debe ser un número diferente de cero."
        );

        error.code = "INVALID_STOCK_ADJUSTMENT";

        throw error;
    }

    if (
        adjustment < 0 &&
        (!observacion || observacion.trim() === "")
    ) {
        const error = new Error(
            "Debe ingresar una razón cuando se reduce el inventario."
        );

        error.code = "STOCK_REDUCTION_REASON_REQUIRED";

        throw error;
    }

    const oldStock = Number(productUnit.stock);
    const newStock = oldStock + adjustment;

    if (newStock < 0) {
        const error = new Error(
            "El stock no puede ser negativo."
        );

        error.code = "NEGATIVE_STOCK";

        throw error;
    }

    await InventoryMovService.create({
        product_unit_id: productUnit.id,
        tipo: "ajuste",
        cantidad: adjustment,
        observacion:
            adjustment < 0
                ? observacion
                : observacion ?? "Aumento manual de stock",
        business_id
    });

    await productUnit.update({
        stock: newStock
    });

    return productUnit;
};

export const resetStockForService = async (product_id, business_id) => {
    const product = await Product.findOne({
        where: {
            id: product_id,
            business_id
        },
        attributes: ["id", "type_item"]
    });

    if (!product) {
        return null;
    }

    const productUnits = await ProductUnit.findAll({
        where: {
            product_id: product.id
        }
    });

    for (const productUnit of productUnits) {

        const oldStock = Number(productUnit.stock);

        if (oldStock > 0) {
            await InventoryMovService.create({
                product_unit_id: productUnit.id,
                tipo: "ajuste",
                cantidad: -oldStock,
                observacion: "Cambio de producto a servicio",
                business_id
            });
        }

        await productUnit.update({
            stock: 0
        });
    }

    return productUnits;
};

export const getTotalStock = async (business_id) => {
    const totalStock = await ProductUnit.sum("stock", {
        where: {
            active: true
        },
        include: [
            {
                model: Product,
                as: "product",
                where: {
                    business_id,
                    type_item: "Producto"
                },
                attributes: []
            }
        ]
    });
    return Number(totalStock || 0);
};

export const getLowStock = async (business_id) => {
    const lowStock = await ProductUnit.count({
        where: {
            active: true,
            stock: {
                [Op.between]: [1, 5]
            }
        },
        include: [
            {
                model: Product,
                as: "product",
                where: {
                    business_id,
                    type_item: "Producto"
                },
                attributes: []
            }
        ]
    });

    return lowStock;
};