// Auxilary api enpoints

import { Router } from 'express';
import {
    contact,
    getPlans,
    getPlan,
    subscribeToNewsletter,
    unsubscribeFromNewsletter,
} from '~/controllers/base.controller';

const router = Router();

router.post('/contact', contact);

router.get('/plans', getPlans); // get offered plans
router.get('/plans/:slug', getPlan); // get a plan by id
router.post('/newsletter', subscribeToNewsletter); // subscribe to newsletter
router.delete('/newsletter', unsubscribeFromNewsletter); // unsubscribe from newsletter

export default router;
