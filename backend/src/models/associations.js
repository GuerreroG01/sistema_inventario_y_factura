import Business from "./Business.js";
import Sales from "./Sales.js";
import SaleDetail from "./SaleDetails.js";
import Product from "./Products.js";
import InventoryMov from "./Inventory_mov.js";
import Expense from "./Expense.js";
import User from "./User.js";
import License from './License.js';
import Customer from "./Customers.js";
import CustomerMarketing from "./CustomerMarketing.js";
//import Employee from "./Worksheet/Employee/Employee.js"
//import EmployeeEmployment from "./Worksheet/Employee/EmployeeEmployment.js"
//import EmployeeSalaryHistory from "./Worksheet/Employee/EmployeeSalaryHistory.js"
import ProductUnit from "./ProductsUnits.js";
import Branch from "./Branch.js";

Business.hasMany(User,{
    foreignKey:"business_id",
    as:"users"
});

User.belongsTo(Business,{
    foreignKey:"business_id",
    as:"business"
});

Branch.hasMany(User, {
    foreignKey: "branch_id",
    as: "users"
});

User.belongsTo(Branch, {
    foreignKey: "branch_id",
    as: "branch"
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

Branch.hasMany(Expense, {
    foreignKey: "branch_id",
    as: "expenses"
});

Expense.belongsTo(Branch, {
    foreignKey: "branch_id",
    as: "branch"
});

Sales.hasMany(SaleDetail,{
    foreignKey:"sale_id",
    as:"details"
});

SaleDetail.belongsTo(Sales,{
    foreignKey:"sale_id",
    as:"sale"
});

Branch.hasMany(SaleDetail, {
    foreignKey: "branch_id",
    as: "saleDetails"
});

SaleDetail.belongsTo(Branch, {
    foreignKey: "branch_id",
    as: "branch"
});

ProductUnit.hasMany(InventoryMov, {
    foreignKey: "product_unit_id",
    as: "movements"
});

InventoryMov.belongsTo(ProductUnit, {
    foreignKey: "product_unit_id",
    as: "productUnit"
});

Branch.hasMany(InventoryMov, {
    foreignKey: "branch_id",
    as: "inventoryMovements"
});

InventoryMov.belongsTo(Branch, {
    foreignKey: "branch_id",
    as: "branch"
});

ProductUnit.hasMany(SaleDetail, {
    foreignKey: "product_unit_id",
    as: "saleDetails"
});

SaleDetail.belongsTo(ProductUnit, {
    foreignKey: "product_unit_id",
    as: "productUnit"
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

Business.hasMany(Customer,{
    foreignKey:"business_id",
    as:"customers"
});

Customer.belongsTo(Business,{
    foreignKey:"business_id",
    as:"business"
});

Sales.belongsTo(Customer,{
    foreignKey:"client_id",
    as:"customer"
});

Branch.hasMany(Sales, {
    foreignKey: "branch_id",
    as: "sales"
});

Sales.belongsTo(Branch, {
    foreignKey: "branch_id",
    as: "branch"
});


Customer.hasMany(Sales,{
    foreignKey:"client_id",
    as:"sales"
});

Customer.hasOne(CustomerMarketing,{
    foreignKey:"customer_id",
    as:"marketing"
});


CustomerMarketing.belongsTo(Customer,{
    foreignKey:"customer_id",
    as:"customer"
});

Business.hasMany(CustomerMarketing,{
    foreignKey:"business_id",
    as:"customerMarketing"
});


CustomerMarketing.belongsTo(Business,{
    foreignKey:"business_id",
    as:"business"
});

/*
Business.hasMany(Employee, {
    foreignKey: "business_id",
    as: "employees"
});

Employee.belongsTo(Business, {
    foreignKey: "business_id",
    as: "business"
});

Employee.hasMany(EmployeeEmployment, {
    foreignKey: "employee_id",
    as: "employments"
});

EmployeeEmployment.belongsTo(Employee, {
    foreignKey: "employee_id",
    as: "employee"
});

Employee.hasMany(EmployeeSalaryHistory, {
    foreignKey: "employee_id",
    as: "salaryHistory"
});

EmployeeSalaryHistory.belongsTo(Employee, {
    foreignKey: "employee_id",
    as: "employee"
});*/

Product.hasMany(ProductUnit, {
    foreignKey: "product_id",
    as: "units"
});

ProductUnit.belongsTo(Product, {
    foreignKey: "product_id",
    as: "product"
});

Branch.hasMany(ProductUnit, {
    foreignKey: "branch_id",
    as: "productUnits"
});

ProductUnit.belongsTo(Branch, {
    foreignKey: "branch_id",
    as: "branch"
});


Business.hasMany(Branch, {
    foreignKey: "business_id",
    as: "branches"
});

Branch.belongsTo(Business, {
    foreignKey: "business_id",
    as: "business"
});

