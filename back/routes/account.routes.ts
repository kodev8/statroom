import { Router } from 'express';
import {
    upadteAccount,
    updateEmail,
    handleTwoFactorReq,
    updateNotifications,
} from '~/controllers/account.controller';

const router = Router();

router.patch('/', upadteAccount); // update account
router.patch('/update-email', updateEmail); // update email
router.patch('/manage-2fa', handleTwoFactorReq); // enable 2fa
router.patch('/notification-settings', updateNotifications); // update notification settings

// router.patch('/billing') // update billing information
// router.patch('/subscription') // update subscription plan

// router.delete('/') // delete account
// router.delete('/subscription') // cancel subscription
// router.delete('/billing') // delete billing information

// router.get('/subscription') // get subscription plan
// router.get('/billing') // get billing information

// router.post('/subscription') // subscribe to a plan
// router.post('/billing') // add billing information

export default router;
