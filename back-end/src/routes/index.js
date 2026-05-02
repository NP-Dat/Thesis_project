import { Router } from 'express';
import authRoutes from './auth.routes.js';
import quizRoutes from './quiz.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import alertRoutes from './alert.routes.js';
import resourceRoutes from './resource.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', uptime: process.uptime() } });
});

router.use('/auth', authRoutes);
router.use('/quiz', quizRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/alerts', alertRoutes);
router.use('/resources', resourceRoutes);
router.use('/admin', adminRoutes);

export default router;
