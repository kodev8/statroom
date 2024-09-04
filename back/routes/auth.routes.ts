import { Router } from 'express';
import {
    login,
    register,
    refreshToken,
    resetPasswordAnon,
    resetPassword,
    handleOAuthProvider,
    verifyOTP,
    sendOTP,
    logout,
    verifyUser,
    me,
} from '~/controllers/auth.controller';
import verifyToken from '~/middleware/verifyToken';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/refresh-token', refreshToken);
router.patch('/reset-password-anon', resetPasswordAnon);
// router.post('/request-reset-password', requestPasswordReset)
router.post('/oauth/:provider', handleOAuthProvider);
router.post('/verify-user', verifyUser);
router.post('/verify-otp', verifyOTP);
router.post('/send-otp-2fa', sendOTP);

router.get('/me', verifyToken, me);
router.post('/send-otp', verifyToken, sendOTP);
router.patch('/reset-password', verifyToken, resetPassword);
router.post('/logout', verifyToken, logout);

export default router;
