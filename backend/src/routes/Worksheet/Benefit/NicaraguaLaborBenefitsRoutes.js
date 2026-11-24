import { Router } from "express";

import { getEmployeeVacationBenefit, calculateEmployeeThirteenthMonth, calculateEmployeeIndemnification
} from "../../../controllers/Worksheet/Benefit/NicaraguaLaborBenefitsController.js";
import licenseMiddleware from "../../../middlewares/licenseMiddleware.js";

const router = Router();
router.use(licenseMiddleware);

router.get( "/vacations/:business_id/:employee_id", getEmployeeVacationBenefit);
router.post("/thirteenth_month/:employee_id",calculateEmployeeThirteenthMonth);
router.post("/indemnification/:employee_id",calculateEmployeeIndemnification);
export default router;