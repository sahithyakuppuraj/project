import { Response } from 'express';
import { Budget } from '../models/Budget';
import { Transaction } from '../models/Transaction';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getBudget = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const now = new Date();
    const month = parseInt(req.query.month as string, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year as string, 10) || now.getFullYear();

    // Find saved budget
    const budget = await Budget.findOne({ userId, month, year });

    // Calculate actual expenses for this month
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const expenseTransactions = await Transaction.find({
      userId,
      type: 'expense',
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const totalSpent = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Group expenses by category
    const categorySpendingMap: Record<string, number> = {};
    expenseTransactions.forEach((t) => {
      categorySpendingMap[t.category] = (categorySpendingMap[t.category] || 0) + t.amount;
    });

    const totalBudget = budget ? budget.totalBudget : 0;
    const remainingBudget = totalBudget - totalSpent;
    const percentageUsed = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    let warningLevel: 'normal' | 'warning' | 'danger' = 'normal';
    let warningMessage = 'Spending is within budget.';

    if (totalBudget > 0) {
      if (percentageUsed >= 100) {
        warningLevel = 'danger';
        warningMessage = `Budget exceeded by ₹${(totalSpent - totalBudget).toLocaleString('en-IN')}!`;
      } else if (percentageUsed >= 80) {
        warningLevel = 'warning';
        warningMessage = `Approaching budget limit! You have used ${percentageUsed}% of your budget.`;
      }
    }

    // Category breakdown
    const categoryDetails = (budget?.categoryBudgets || []).map((cb) => {
      const spent = categorySpendingMap[cb.category] || 0;
      const remaining = cb.amount - spent;
      const percent = cb.amount > 0 ? Math.round((spent / cb.amount) * 100) : 0;
      return {
        category: cb.category,
        budgetAmount: cb.amount,
        spentAmount: spent,
        remainingAmount: remaining,
        percentageUsed: percent,
        isExceeded: spent > cb.amount,
        isWarning: percent >= 80 && percent < 100,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        month,
        year,
        totalBudget,
        totalSpent,
        remainingBudget,
        percentageUsed,
        warningLevel,
        warningMessage,
        categoryBudgets: categoryDetails,
        id: budget?._id,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving budget',
    });
  }
};

export const setBudget = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { month, year, totalBudget, categoryBudgets } = req.body;

    const budget = await Budget.findOneAndUpdate(
      { userId, month, year },
      {
        totalBudget,
        categoryBudgets: categoryBudgets || [],
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Monthly budget saved successfully',
      data: budget,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error setting budget',
    });
  }
};

export const deleteBudget = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { id } = req.params;

    const budget = await Budget.findOneAndDelete({ _id: id, userId });
    if (!budget) {
      res.status(404).json({ success: false, message: 'Budget not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Budget removed successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting budget',
    });
  }
};

