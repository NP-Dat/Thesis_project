import { Router } from 'express';
import * as resourceCtrl from '../controllers/resource.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { resourceListQuerySchema } from '../validators/resource.schema.js';

const router = Router();

router.get(
  '/',
  authenticate,
  requireRole('employee'),
  validate(resourceListQuerySchema, 'query'),
  asyncHandler(resourceCtrl.listForEmployee)
);

export default router;
