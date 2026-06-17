import Sales from "./Sales.js";
import SaleDetail from "./SalesDetail.js";

Sales.hasMany(SaleDetail, {
    foreignKey: "sale_id",
    as: "details"
});

SaleDetail.belongsTo(Sales, {
    foreignKey: "sale_id",
    as: "sale"
});