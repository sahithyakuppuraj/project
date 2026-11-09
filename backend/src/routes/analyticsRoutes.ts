import { Router } from 'express';
import { getDashboardSummary, getAnalytics } from '../controllers/analyticsController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.get('/dashboard', getDashboardSummary);
router.get('/', getAnalytics);

export default router;

