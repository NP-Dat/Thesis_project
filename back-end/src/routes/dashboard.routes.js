import { Router } from 'express';
import * as dashboardCtrl from '../controllers/dashboard.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { paginationQuery, positiveIntParam } from '../validators/common.schema.js';

const router = Router();

router.get(
  '/employee',
  authenticate,
  requireRole('employee'),
  asyncHandler(dashboardCtrl.employee)
);

router.get(
  '/admin',
  authenticate,
  requireRole('admin'),
  asyncHandler(dashboardCtrl.admin)
);

router.get(
  '/admin/department/:departmentId',
  authenticate,
  requireRole('admin'),
  validate(positiveIntParam('departmentId'), 'params'),
  validate(paginationQuery, 'query'),
  asyncHandler(dashboardCtrl.adminDepartment)
);

export default router;
