import { Router } from "express";

import { create, get, getById, deletePayEmployee } from "../../../controllers/Worksheet/Payroll/PayrollEmployeeController.js";

const router = Router();

router.post( "/:periodId/employees", create );
router.get( "/:periodId/employees", get );
router.get( "/:periodId/employees/:id", getById );
router.delete( "/:periodId/employees/:id", deletePayEmployee );

export default router;