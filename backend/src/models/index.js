import Branch from "./Branch.js";
import Business from "./Business.js";
import CustomerMarketing from "./CustomerMarketing.js";
import Customers from "./Customers.js";
import Expense from "./Expense.js";
import InventoryMov from "./Inventory_mov.js";
import License from "./License.js";
import Products from "./Products.js";
import ProductsUnits from "./ProductsUnits.js";
import SaleDetails from "./SaleDetails.js";
import Sales from "./Sales.js";
import SystemJob from "./SystemJob.js";
import SystemJobError from "./SystemJobError.js";
import User from "./User.js";
import { associateModels } from "./associations.js";
import Employee from "./Worksheet/Employee/Employee.js";
import EmployeeEmployment from "./Worksheet/Employee/EmployeeEmployment.js";
import EmployeeSalaryHistory from "./Worksheet/Employee/EmployeeSalaryHistory.js";
import PayrollRule from "./Worksheet/Payroll/PayrollRules/PayrollRule.js";
import PayrollRuleTier from "./Worksheet/Payroll/PayrollRules/PayrollRuleTier.js";
import PayrollEmployee from "./Worksheet/Payroll/PayrollEmployee.js";
import PayrollItem from "./Worksheet/Payroll/PayrollItem.js";
import PayrollPeriod from "./Worksheet/Payroll/PayrollPeriod.js";
import BenefitRule from "./Worksheet/Benefits/BenefitRule.js";
import EmployeeBenefit from "./Worksheet/Benefits/EmployeeBenefits.js";
import EmployeeBenefitTransaction from "./Worksheet/Benefits/EmployeeBenefitTransaction.js";
import BenefitProcessingIssue from "./BenefitProcessingIssue.js";

const models = {
    Branch,
    Business,
    CustomerMarketing,
    Customers,
    Expense,
    InventoryMov,
    License,
    Products,
    ProductsUnits,
    SaleDetails,
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
};

associateModels(models);
export default models;

export {
    Branch,
    Business,
    CustomerMarketing,
    Customers,
    Expense,
    InventoryMov,
    License,
    Products,
    ProductsUnits,
    SaleDetails,
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
};
/*Ya encuentra las asociaciones pero aún hay que mejorar los metodos de los beneficios para que este 
preparado y no tome como errores cuando un empleado aún no tiene configurado salario o puesto. Para que 
si no encuentra esos datos que necesita solo ignore y siga con el siguiente para que en la proxima vuelta
si encuentra ya la información entonces ahi si asigne los beneficios y también agregar seeders para los 
beneficios principales*/
