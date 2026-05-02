import { Router } from 'express';
import * as resourceCtrl from '../controllers/resource.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/async-handler.js';
import {
  createResourceSchema,
  updateResourceSchema,
} from '../validators/resource.schema.js';
import { positiveIntParam } from '../validators/common.schema.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/resources', asyncHandler(resourceCtrl.listForAdmin));
router.post(
  '/resources',
  validate(createResourceSchema),
  asyncHandler(resourceCtrl.create)
);
router.put(
  '/resources/:resourceId',
  validate(positiveIntParam('resourceId'), 'params'),
  validate(updateResourceSchema),
  asyncHandler(resourceCtrl.update)
);
router.delete(
  '/resources/:resourceId',
  validate(positiveIntParam('resourceId'), 'params'),
  asyncHandler(resourceCtrl.remove)
);

export default router;
