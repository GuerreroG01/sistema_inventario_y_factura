import Business from "./Business.js";
import Sales from "./Sales.js";
import SaleDetail from "./SaleDetails.js";
import Product from "./Products.js";
import InventoryMov from "./Inventory_mov.js";
import Expense from "./Expense.js";
import User from "./User.js";
import License from './License.js';

Business.hasMany(User,{
    foreignKey:"business_id",
    as:"users"
});

User.belongsTo(Business,{
    foreignKey:"business_id",
    as:"business"
});

Business.hasMany(Product,{
    foreignKey:"business_id",
    as:"products"
});

Product.belongsTo(Business,{
    foreignKey:"business_id",
    as:"business"
});


Business.hasMany(Sales,{
    foreignKey:"business_id",
    as:"sales"
});

Sales.belongsTo(Business,{
    foreignKey:"business_id",
    as:"business"
});

Business.hasMany(Expense,{
    foreignKey:"business_id",
    as:"expenses"
});

Expense.belongsTo(Business,{
    foreignKey:"business_id",
    as:"business"
});

Sales.hasMany(SaleDetail,{
    foreignKey:"sale_id",
    as:"details"
});

SaleDetail.belongsTo(Sales,{
    foreignKey:"sale_id",
    as:"sale"
});

Product.hasMany(InventoryMov,{
    foreignKey:"product_id",
    as:"movements"
});

InventoryMov.belongsTo(Product,{
    foreignKey:"product_id",
    as:"product"
});

Product.hasMany(SaleDetail,{
    foreignKey:"product_id",
    as:"details"
});

SaleDetail.belongsTo(Product,{
    foreignKey:"product_id",
    as:"product"
});

Sales.hasMany(InventoryMov,{
    foreignKey:"referencia",
    as:"inventoryMovements"
});

InventoryMov.belongsTo(Sales,{
    foreignKey:"referencia",
    as:"sale"
});

Business.hasOne(License, {
    foreignKey: "business_id",
    as: "license"
});

License.belongsTo(Business, {
    foreignKey: "business_id",
    as: "business"
});