import {Router} from 'express';
import { createAdminAccount, authenticateAdmin, listAllUsersByAdmin, deleteUserByAdmin, listAllSavingsByAdmin,
     deleteSavingsByAdmin, getAllReportsByAdmin, respondToReport, deleteReport, getAllConversations, adminReply, getUserSavingsByAdmin,
     approveSavingsPlan, rejectSavingsPlan,getAllPendingSavingsPlans, approveSavingsDeposit, rejectSavingsDeposit, getPendingSavingsDeposits,
     getPendingSingleSavingsWithdrawals, approveSingleSavingsWithdrawal, rejectSingleSavingsWithdrawal } from './admin.controller.js';
import { adminLimiter } from './adminLimiter.js';
import adminMiddleware from './../../app/middleware/admin.middleware.js';
const router = Router();

router.post('/register', adminMiddleware, createAdminAccount);
router.post('/login', adminLimiter, authenticateAdmin);
router.get('/list-all-users', adminMiddleware, listAllUsersByAdmin);
router.delete('/delete-user-by-admin/:userId', adminMiddleware, deleteUserByAdmin);
router.get('/list-all-savings-by-admin', adminMiddleware, listAllSavingsByAdmin);
router.delete('/delete-savings-by-admin/:id', adminMiddleware, deleteSavingsByAdmin);
router.get('/get-all-reports-by-admin', adminMiddleware, getAllReportsByAdmin);
router.patch('/respond-to-report/:id', adminMiddleware, respondToReport);
router.delete('/delete-report-by-admin/:id', adminMiddleware, deleteReport);
router.get('/get-all-conversations', adminMiddleware, getAllConversations);
router.post('/admin-reply/:conversationId', adminMiddleware, adminReply);
router.get('/get-user-savings-by-admin/:userId', adminMiddleware, getUserSavingsByAdmin);

router.patch('/approve-savings-plan/:planId', adminMiddleware, approveSavingsPlan);
router.patch('/reject-savings-plan/:planId', adminMiddleware, rejectSavingsPlan);
router.get('/pending-savings-plans', adminMiddleware, getAllPendingSavingsPlans);
router.patch('/approve-deposit/:depositId', adminMiddleware, approveSavingsDeposit);
router.patch('/reject-deposit/:depositId', adminMiddleware, rejectSavingsDeposit);
router.get('/pending-deposits', adminMiddleware, getPendingSavingsDeposits);

router.get('/pending-single-savings-withdrawals', adminMiddleware, getPendingSingleSavingsWithdrawals);
router.patch('/approve-single-savings-withdrawal/:withdrawalId', adminMiddleware, approveSingleSavingsWithdrawal);
router.patch('/reject-single-savings-withdrawal/:withdrawalId', adminMiddleware, rejectSingleSavingsWithdrawal);

export const adminRouter = router;