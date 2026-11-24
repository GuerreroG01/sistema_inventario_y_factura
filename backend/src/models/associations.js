export const associateModels = (models) => {
    const {
        Branch,
        Business,
        CustomerMarketing,
        Customers: Customer,
        Expense,
        InventoryMov,
        License,
        Products: Product,
        ProductsUnits: ProductUnit,
        SaleDetails: SaleDetail,
        Sales,
        SystemJob,
        SystemJobError,
        User,
        Employee,
        EmployeeEmployment,
        EmployeeSalaryHistory,
        PayrollRule,
        PayrollRuleTier,
        PayrollEmployee,
        PayrollItem,
        PayrollPeriod,
        BenefitRule,
        EmployeeBenefit,
        EmployeeBenefitTransaction,
        BenefitProcessingIssue
    } = models;

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

    Business.hasMany(PayrollRule, {
        foreignKey: "business_id",
        as: "payrollRules"
    });

    PayrollRule.belongsTo(Business, {
        foreignKey: "business_id",
        as: "business"
    });

    Branch.hasMany(PayrollRule, {
        foreignKey: "branch_id",
        as: "payrollRules"
    });

    PayrollRule.belongsTo(Branch, {
        foreignKey: "branch_id",
        as: "branch"
    });

    PayrollRule.hasMany(PayrollRuleTier, {
        foreignKey: "payroll_rule_id",
        as: "tiers",
    });

    PayrollRuleTier.belongsTo(PayrollRule, {
        foreignKey: "payroll_rule_id",
        as: "payrollRule",
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

    Business.hasMany(Employee, {
        foreignKey: "business_id",
        as: "employees"
    });

    Employee.belongsTo(Business, {
        foreignKey: "business_id",
        as: "business"
    });

    Branch.hasMany(Employee, {
        foreignKey: "branch_id",
        as: "employees"
    });

    Employee.belongsTo(Branch, {
        foreignKey: "branch_id",
        as: "branch"
    });


    Employee.hasMany(EmployeeEmployment, {
        foreignKey: "employee_id",
        as: "employments"
    });

    EmployeeEmployment.belongsTo(Employee, {
        foreignKey: "employee_id",
        as: "employee"
    });

    Branch.hasMany(EmployeeEmployment, {
        foreignKey: "branch_id",
        as: "employeeEmployments"
    });

    EmployeeEmployment.belongsTo(Branch, {
        foreignKey: "branch_id",
        as: "branch"
    });


    Employee.hasMany(EmployeeSalaryHistory, {
        foreignKey: "employee_id",
        as: "salaryHistory"
    });

    EmployeeSalaryHistory.belongsTo(Employee, {
        foreignKey: "employee_id",
        as: "employee"
    });

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

    Business.hasMany(PayrollPeriod, {
        foreignKey: "business_id",
        as: "payrollPeriods",
    });

    PayrollPeriod.belongsTo(Business, {
        foreignKey: "business_id",
        as: "business",
    });

    PayrollPeriod.hasMany(PayrollEmployee, {
        foreignKey: "payroll_period_id",
        as: "employees",
    });

    PayrollEmployee.belongsTo(PayrollPeriod, {
        foreignKey: "payroll_period_id",
        as: "payrollPeriod",
    });

    Employee.hasMany(PayrollEmployee, {
        foreignKey: "employee_id",
        as: "payrollRecords",
    });

    PayrollEmployee.belongsTo(Employee, {
        foreignKey: "employee_id",
        as: "employee",
    });

    PayrollEmployee.hasMany(PayrollItem, {
        foreignKey: "payroll_employee_id",
        as: "items",
    });

    PayrollItem.belongsTo(PayrollEmployee, {
        foreignKey: "payroll_employee_id",
        as: "payrollEmployee",
    });

    PayrollRule.hasMany(PayrollItem, {
        foreignKey: "payroll_rule_id",
        as: "payrollItems",
    });

    PayrollItem.belongsTo(PayrollRule, {
        foreignKey: "payroll_rule_id",
        as: "payrollRule",
    });

    PayrollEmployee.belongsTo(EmployeeEmployment, {
        foreignKey: "employment_id",
        as: "employment",
    });

    EmployeeEmployment.hasMany(PayrollEmployee, {
        foreignKey: "employment_id",
        as: "payrollRecords",
    });

    Business.hasMany(BenefitRule, {
        foreignKey: "business_id",
        as: "benefitRules",
    });

    BenefitRule.belongsTo(Business, {
        foreignKey: "business_id",
        as: "business",
    });

    BenefitRule.hasMany(EmployeeBenefit, {
        foreignKey: "benefit_rule_id",
        as: "employeeBenefits",
    });

    EmployeeBenefit.belongsTo(BenefitRule, {
        foreignKey: "benefit_rule_id",
        as: "rule",
    });

    Employee.hasMany(EmployeeBenefit, {
        foreignKey: "employee_id",
        as: "benefits",
    });

    EmployeeBenefit.belongsTo(Employee, {
        foreignKey: "employee_id",
        as: "employee",
    });

    Business.hasMany(EmployeeBenefit, {
        foreignKey: "business_id",
        as: "employeeBenefits",
    });

    EmployeeBenefit.belongsTo(Business, {
        foreignKey: "business_id",
        as: "business",
    });

    EmployeeBenefit.hasMany(EmployeeBenefitTransaction, {
        foreignKey: "employee_benefit_id",
        as: "transactions",
    });

    EmployeeBenefitTransaction.belongsTo(EmployeeBenefit, {
        foreignKey: "employee_benefit_id",
        as: "benefit",
    });

    EmployeeBenefitTransaction.hasMany(EmployeeBenefitTransaction, {
        foreignKey: "reverses_transaction_id",
        as: "reversalTransactions",
    });

    EmployeeBenefitTransaction.belongsTo(EmployeeBenefitTransaction, {
        foreignKey: "reverses_transaction_id",
        as: "reversedTransaction",
    });

    SystemJob.hasMany(SystemJobError, {
        foreignKey: "job_id",
        as: "errors"
    });

    SystemJobError.belongsTo(SystemJob, {
        foreignKey: "job_id",
        as: "job"
    });

    Business.hasMany(BenefitProcessingIssue, {
        foreignKey: "business_id",
        as: "benefitProcessingIssues"
    });

    BenefitProcessingIssue.belongsTo(Business, {
        foreignKey: "business_id",
        as: "business"
    });

    Employee.hasMany(BenefitProcessingIssue, {
        foreignKey: "employee_id",
        as: "benefitProcessingIssues"
    });

    BenefitProcessingIssue.belongsTo(Employee, {
        foreignKey: "employee_id",
        as: "employee"
    });

    SystemJob.hasMany(BenefitProcessingIssue, {
        foreignKey: "processing_job_id",
        as: "benefitIssues"
    });

    BenefitProcessingIssue.belongsTo(SystemJob, {
        foreignKey: "processing_job_id",
        as: "processingJob"
    });
};