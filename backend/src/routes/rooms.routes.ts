import { Router } from 'express';
import * as roomController from '../controllers/rooms.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { CreateRoomSchema, UpdateRoomSchema } from '../utils/validators';

const router = Router();

// Public routes
router.get('/', roomController.getAllRooms);
router.get('/availability', roomController.checkAvailability);
router.get('/:id', roomController.getRoom);

// Protected routes (Admin only)
router.post('/', authenticate, isAdmin, validateBody(CreateRoomSchema), roomController.createRoom);
router.put('/:id', authenticate, isAdmin, validateBody(UpdateRoomSchema), roomController.updateRoom);
router.delete('/:id', authenticate, isAdmin, roomController.deleteRoom);

export default router;
