import { Response } from 'express';
import { Transaction } from '../models/Transaction';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const DEFAULT_CATEGORIES = [
  'Food',
  'Transport',
  'Education',
  'Shopping',
  'Bills',
  'Entertainment',
  'Healthcare',
  'Salary',
  'Investment',
  'Freelance',
  'Other',
];

export const getTransactions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const {
      search,
      category,
      type,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc',
      page = '1',
      limit = '10',
    } = req.query;

    const query: any = { userId };

    if (type && (type === 'income' || type === 'expense')) {
      query.type = type;
    }

    if (category && typeof category === 'string' && category !== 'all') {
      query.category = category;
    }

    if (search && typeof search === 'string') {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate && typeof startDate === 'string') {
        query.date.$gte = new Date(startDate);
      }
      if (endDate && typeof endDate === 'string') {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const pageNumber = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNumber = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 10));
    const skip = (pageNumber - 1) * limitNumber;

    const sortOptions: any = {};
    const field = sortBy === 'amount' ? 'amount' : 'date';
    sortOptions[field] = sortOrder === 'asc' ? 1 : -1;

    const [transactions, total] = await Promise.all([
      Transaction.find(query).sort(sortOptions).skip(skip).limit(limitNumber),
      Transaction.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNumber);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving transactions',
    });
  }
};

export const getTransactionById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { id } = req.params;

    const transaction = await Transaction.findOne({ _id: id, userId });
    if (!transaction) {
      res.status(404).json({ success: false, message: 'Transaction not found' });
      return;
    }

    res.status(200).json({ success: true, data: transaction });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving transaction',
    });
  }
};

export const createTransaction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { amount, type, category, description, date, notes } = req.body;

    const transaction = await Transaction.create({
      userId,
      amount,
      type,
      category,
      description,
      date: date ? new Date(date) : new Date(),
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Transaction recorded successfully',
      data: transaction,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating transaction',
    });
  }
};

export const updateTransaction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { id } = req.params;

    const transaction = await Transaction.findOne({ _id: id, userId });
    if (!transaction) {
      res.status(404).json({ success: false, message: 'Transaction not found' });
      return;
    }

    const { amount, type, category, description, date, notes } = req.body;

    if (amount !== undefined) transaction.amount = amount;
    if (type !== undefined) transaction.type = type;
    if (category !== undefined) transaction.category = category;
    if (description !== undefined) transaction.description = description;
    if (date !== undefined) transaction.date = new Date(date);
    if (notes !== undefined) transaction.notes = notes;

    await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating transaction',
    });
  }
};

export const deleteTransaction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { id } = req.params;

    const transaction = await Transaction.findOneAndDelete({ _id: id, userId });
    if (!transaction) {
      res.status(404).json({ success: false, message: 'Transaction not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting transaction',
    });
  }
};

export const getCategories = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const userCategories = await Transaction.distinct('category', { userId });
    const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...userCategories]));

    res.status(200).json({
      success: true,
      data: allCategories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving categories',
    });
  }
};

