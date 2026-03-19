import { Router } from 'express';
import { getObservation, upsertObservation } from '../controllers/observations.controller';
import { authenticate, isStaff } from '../middleware/auth.middleware';

const router = Router();

router.get('/:residenceId', authenticate, isStaff, getObservation);
router.put('/:residenceId', authenticate, isStaff, upsertObservation);


export default router;
