import {Router} from "express";
import authMiddleware from "../../app/middleware/auth.middleware.js";
import { getMyFamilyPlans, createFamilySavings, inviteUserToFamilySavings, getMyFamilySavingsInvites,
    getFamilySavingsHistory, acceptFamilySavingsInvite, depositToFamilySavings, getFamilySavingsTotalYield,
    requestFamilySavingsWithdrawal,
    approveFamilySavingsWithdrawal,
    rejectFamilySavingsWithdrawal,
    getPendingWithdrawalApprovals, getFamilySavingsWithdrawalHistory } from './familySavingsController.js';
const router = Router();

router.get("/my-plans", authMiddleware, getMyFamilyPlans);
router.post("/create-family-savings", authMiddleware, createFamilySavings);
router.post("/invite-user/:familySavingsId", authMiddleware, inviteUserToFamilySavings);
router.get("/invites", authMiddleware, getMyFamilySavingsInvites);
router.patch("/accept-invite/:inviteId", authMiddleware, acceptFamilySavingsInvite);
router.post("/deposit/:familySavingsId", authMiddleware, depositToFamilySavings);
router.get("/get-family-savings-yield/:planId", authMiddleware, getFamilySavingsTotalYield);
router.get("/get-family-savings-history/:familySavingsId", authMiddleware, getFamilySavingsHistory);
router.post("/withdraw-from-family-savings/:familySavingsId", authMiddleware, requestFamilySavingsWithdrawal);
router.get("/get-pending-family-savings-withdrawal-approvals", authMiddleware, getPendingWithdrawalApprovals)
router.patch("/approve-family-savings-withdrawal/:requestId", authMiddleware, approveFamilySavingsWithdrawal);
router.patch("/reject-family-savings-withdrawal/:requestId", authMiddleware, rejectFamilySavingsWithdrawal);
router.get("/family-savings-withdrawal-history/:familySavingsId", authMiddleware, getFamilySavingsWithdrawalHistory);


export const familySavingsRouter = router;