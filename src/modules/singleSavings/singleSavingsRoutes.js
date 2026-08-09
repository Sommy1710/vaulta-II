import { Router } from "express";
import { createSingleSavingsPlan, getTotalYield, getMySavingsHistory, withdrawSingleSavings,
    getSingleSavingsWithdrawalHistory
 } from "./singleSavingsController.js";
import authMiddleware from "../../app/middleware/auth.middleware.js";
const router = Router();

router.post('/create-single-savings',authMiddleware, createSingleSavingsPlan);
router.get("/get-total-yield/:planId", authMiddleware, getTotalYield);
router.get("/get-single-savings-history", authMiddleware, getMySavingsHistory);
router.patch("/withdraw-single-savings/:planId", authMiddleware, withdrawSingleSavings);
router.get("/single-savings-withdrawal-history", authMiddleware, getSingleSavingsWithdrawalHistory);

export const singleSavingsRouter = router;