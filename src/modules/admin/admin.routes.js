import {Router} from 'express';
import { createAdminAccount, authenticateAdmin, listAllUsersByAdmin, deleteUserByAdmin, listAllSavingsByAdmin,
     deleteSavingsByAdmin, getAllReportsByAdmin, respondToReport, deleteReport, getAllConversations, adminReply, getUserSavingsByAdmin } from './admin.controller.js';
import { adminLimiter } from './adminLimiter.js';
import adminMiddleware from './../../app/middleware/admin.middleware.js';
const router = Router();

router.post('/register', createAdminAccount);
router.post('/login', adminLimiter, authenticateAdmin);
router.get('/list-all-users', adminMiddleware, listAllUsersByAdmin);
router.delete('/delete-user-by-admin/:userId', adminMiddleware, deleteUserByAdmin);
router.get('/list-all-savings-by-admin', adminMiddleware, listAllSavingsByAdmin);
router.delete('/delete-savings-by-admin/:type/:id', adminMiddleware, deleteSavingsByAdmin);
router.get('/get-all-reports-by-admin', adminMiddleware, getAllReportsByAdmin);
router.patch('/respond-to-report/:id', adminMiddleware, respondToReport);
router.delete('/delete-report-by-admin/:id', adminMiddleware, deleteReport);
router.get('/get-all-conversations', adminMiddleware, getAllConversations);
router.post('/admin-reply/:conversationId', adminMiddleware, adminReply);
router.get('/get-user-savings-by-admin/:userId', adminMiddleware, getUserSavingsByAdmin);

export const adminRouter = router;  