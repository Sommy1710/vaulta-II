import {Router} from "express";
import authMiddleware from "../../app/middleware/auth.middleware.js";
import { createDuoSavings, inviteUserToDuoSavings, getMyDuoSavingsInvites,
    getDuoSavingsHistory, acceptDuoSavingsInvite, depositToDuoSavings, getDuoSavingsTotalYield,
    requestDuoSavingsWithdrawal,
    approveDuoSavingsWithdrawal,
    rejectDuoSavingsWithdrawal,
    getPendingWithdrawalApprovals, getDuoSavingsWithdrawalHistory,
    getMyDuoPlans } from './duoSavingsController.js';
const router = Router();

router.get("/my-plans", authMiddleware, getMyDuoPlans);
router.post("/create-duo-savings", authMiddleware, createDuoSavings);
router.post("/invite-user/:duoSavingsId", authMiddleware, inviteUserToDuoSavings);
router.get("/invites", authMiddleware, getMyDuoSavingsInvites);
router.patch("/accept-invite/:inviteId", authMiddleware, acceptDuoSavingsInvite);
router.post("/deposit/:duoSavingsId", authMiddleware, depositToDuoSavings);
router.get("/get-duo-savings-yield/:planId", authMiddleware, getDuoSavingsTotalYield);
router.get("/get-duo-savings-history/:duoSavingsId", authMiddleware, getDuoSavingsHistory);
router.post("/withdraw-from-duo-savings/:duoSavingsId", authMiddleware, requestDuoSavingsWithdrawal);
router.get("/get-pending-duo-savings-withdrawal-approvals", authMiddleware, getPendingWithdrawalApprovals)
router.patch("/approve-duo-savings-withdrawal/:requestId", authMiddleware, approveDuoSavingsWithdrawal);
router.patch("/reject-duo-savings-withdrawal/:requestId", authMiddleware, rejectDuoSavingsWithdrawal);
router.get("/duo-savings-withdrawaal-history/:duoSavingsId", authMiddleware, getDuoSavingsWithdrawalHistory );


export const duoSavingsRouter = router;

