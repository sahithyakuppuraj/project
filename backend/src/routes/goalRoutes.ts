import { Router } from 'express';
import {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  addGoalProgress,
  deleteGoal,
} from '../controllers/goalController';
import { protect } from '../middleware/authMiddleware';
import { validate } from '../middleware/validateMiddleware';
import {
  createGoalSchema,
  updateGoalSchema,
  addProgressSchema,
} from '../validators/goalValidator';

const router = Router();

router.use(protect);

router.get('/', getGoals);
router.get('/:id', getGoalById);
router.post('/', validate(createGoalSchema), createGoal);
router.put('/:id', validate(updateGoalSchema), updateGoal);
router.patch('/:id/progress', validate(addProgressSchema), addGoalProgress);
router.delete('/:id', deleteGoal);

export default router;

