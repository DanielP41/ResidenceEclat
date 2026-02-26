import { Router } from 'express';
import * as bookingController from '../controllers/bookings.controller';
import { authenticate, isStaff } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { CreateBookingSchema, UpdateBookingSchema } from '../utils/validators';

const router = Router();

// Public route: Create booking
router.post('/', validateBody(CreateBookingSchema), bookingController.createBooking);

// Protected routes: Manage bookings (Admin/Staff)
router.get('/', authenticate, isStaff, bookingController.getBookings);
router.get('/:id', authenticate, isStaff, bookingController.getBooking);
router.put('/:id', authenticate, isStaff, validateBody(UpdateBookingSchema), bookingController.updateBooking);

export default router;
