import {Router} from 'express';
import authMiddleware from '../../app/middleware/auth.middleware.js';
import {userlimiter} from './userlimiter.js';
import { createUserAccount, verifyEmailOTP, authenticateUser, deleteUserAccount,
     getAuthenticatedUser, getDashboardSummary, findUserByUsername, logoutUser, updateUserAccount, forgotPassword, resetPassword,
      reportProblem, getMyReports } from './auth.controller.js';
const router = Router();

router.post('/register', createUserAccount);
router.post('/verify', verifyEmailOTP);
router.post('/login', userlimiter, authenticateUser);
router.get('/user', authMiddleware, getAuthenticatedUser);
router.get('/dashboard-summary', authMiddleware, getDashboardSummary);
router.get('/find-user', authMiddleware, findUserByUsername);
router.delete('/delete/:userId', authMiddleware, deleteUserAccount);
router.put('/users/:userId', authMiddleware, updateUserAccount);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/report-Problem', authMiddleware, reportProblem);
router.get('/get-My-Reports', authMiddleware, getMyReports);
router.post("/logout", logoutUser);


export const authRouter = router;