import Sales from "./Sales.js";
import SaleDetail from "./SalesDetail.js";
import Product from "./Product.js";
import InventoryMov from "./Inventory_mov.js";

Sales.hasMany(SaleDetail, {
    foreignKey: "sale_id",
    as: "details"
});

SaleDetail.belongsTo(Sales, {
    foreignKey: "sale_id",
    as: "sale"
});

Product.hasMany(InventoryMov, {
    foreignKey: "product_id",
    as: "movements"
});

InventoryMov.belongsTo(Product, {
    foreignKey: "product_id",
    as: "products"
});

Sales.hasMany(InventoryMov, {
    foreignKey: "referencia",
    as: "inventoryMovements"
});

InventoryMov.belongsTo(Sales, {
    foreignKey: "referencia",
    as: "sale"
});

export {
    Sales,
    SaleDetail,
    Product,
    InventoryMov
};