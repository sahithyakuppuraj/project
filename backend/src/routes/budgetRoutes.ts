import { Router } from 'express';
import { getBudget, setBudget, deleteBudget } from '../controllers/budgetController';
import { protect } from '../middleware/authMiddleware';
import { validate } from '../middleware/validateMiddleware';
import { setBudgetSchema } from '../validators/budgetValidator';

const router = Router();

router.use(protect);

router.get('/', getBudget);
router.post('/', validate(setBudgetSchema), setBudget);
router.delete('/:id', deleteBudget);

export default router;

