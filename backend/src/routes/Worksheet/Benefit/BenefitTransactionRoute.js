import express from "express";
import { accrue, consume, pay, adjust, reverse, get, getBenefit } from "../../../controllers/Worksheet/Benefit/BenefitTransactionController.js";
import licenseMiddleware from "../../../middlewares/licenseMiddleware.js";

const router = express.Router();
router.use(licenseMiddleware);

router.post("/:employeeBenefitId/accrue", accrue);
router.post("/:employeeBenefitId/consume", consume);
router.post("/:employeeBenefitId/pay", pay);
router.post("/:employeeBenefitId/adjust", adjust);
router.get("/:employeeBenefitId/balance", get);
router.get("/:employeeBenefitId/transactions", getBenefit);
router.post("/transactions/:transactionId/reverse", reverse);

export default router;