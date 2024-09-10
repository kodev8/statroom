import { Router } from 'express';
import { getContactMessages } from '~/controllers/admin.controller';
import adminProtected from '~/middleware/adminProtected';
const router = Router();

router.get('/contact-messages', adminProtected, getContactMessages); // get all contact messages

export default router;
