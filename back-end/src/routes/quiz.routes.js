import { Router } from 'express';
import * as quizCtrl from '../controllers/quiz.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { submitQuizSchema } from '../validators/quiz.schema.js';
import { paginationQuery } from '../validators/common.schema.js';

const router = Router();

router.use(authenticate, requireRole('employee'));

router.get('/', asyncHandler(quizCtrl.getQuiz));
router.post('/submit', validate(submitQuizSchema), asyncHandler(quizCtrl.submit));
router.get('/history', validate(paginationQuery, 'query'), asyncHandler(quizCtrl.history));

export default router;
