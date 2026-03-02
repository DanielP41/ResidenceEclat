import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate.middleware';
import { LoginSchema } from '../utils/validators';


const router = Router();

router.post('/login', validateBody(LoginSchema), authController.login);
router.post('/refresh', authController.refreshToken);

export default router;
