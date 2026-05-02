import { Router } from 'express';
import * as alertCtrl from '../controllers/alert.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { listAlertsQuerySchema } from '../validators/alert.schema.js';
import { positiveIntParam } from '../validators/common.schema.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/', validate(listAlertsQuerySchema, 'query'), asyncHandler(alertCtrl.list));
router.patch('/read-all', asyncHandler(alertCtrl.markAllRead));
router.patch(
  '/:alertId/read',
  validate(positiveIntParam('alertId'), 'params'),
  asyncHandler(alertCtrl.markRead)
);

export default router;
