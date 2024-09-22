import { Router } from 'express';
import {
    getActivity,
    resolveSeen,
    resolveAction,
} from '~/controllers/activity.controller';
const router = Router();

// activity routes
router.get('', getActivity);
router.post('/:id/resolve', resolveAction);
router.post('/:id/read', resolveSeen);

export default router;
