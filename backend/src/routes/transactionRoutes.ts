import { Router } from 'express';
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories,
} from '../controllers/transactionController';
import { protect } from '../middleware/authMiddleware';
import { validate } from '../middleware/validateMiddleware';
import {
  createTransactionSchema,
  updateTransactionSchema,
} from '../validators/transactionValidator';

const router = Router();

// All transaction routes are protected
router.use(protect);

router.get('/categories', getCategories);
router.get('/', getTransactions);
router.get('/:id', getTransactionById);
router.post('/', validate(createTransactionSchema), createTransaction);
router.put('/:id', validate(updateTransactionSchema), updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;

