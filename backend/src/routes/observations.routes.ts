import { Router } from 'express';
import { getObservation, upsertObservation } from '../controllers/observations.controller';

const router = Router();

router.get('/:residence', getObservation);
router.put('/:residence', upsertObservation);

export default router;
