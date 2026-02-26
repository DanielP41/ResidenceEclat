import { Router } from 'express';
import { getOccupancyStats } from '../controllers/stats.controller';

const router = Router();

router.get('/occupancy', getOccupancyStats);

export default router;
