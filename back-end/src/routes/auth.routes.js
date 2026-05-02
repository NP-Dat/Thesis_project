import { Router } from 'express';
import * as authCtrl from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { loginSchema, registerSchema } from '../validators/auth.schema.js';

const router = Router();

router.post('/register', validate(registerSchema), asyncHandler(authCtrl.register));
router.post('/login', validate(loginSchema), asyncHandler(authCtrl.login));
router.get('/me', authenticate, asyncHandler(authCtrl.me));

export default router;
