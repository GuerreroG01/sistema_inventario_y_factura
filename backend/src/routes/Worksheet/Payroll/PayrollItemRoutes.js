import { Router } from "express";

import { create, get, getById, update, deletePayItem } from "../../../controllers/Worksheet/Payroll/PayrollItemController.js";

const router = Router();

router.post( "/:periodId/employees/:payrollEmployeeId/items", create );
router.get( "/:periodId/employees/:payrollEmployeeId/items", get );
router.get( "/:periodId/employees/:payrollEmployeeId/items/:id", getById );
router.patch( "/:periodId/employees/:payrollEmployeeId/items/:id", update );
router.delete( "/:periodId/employees/:payrollEmployeeId/items/:id", deletePayItem );

export default router;