import { Response } from 'express';
import { FinancialGoal } from '../models/FinancialGoal';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getGoals = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const goals = await FinancialGoal.find({ userId }).sort({ createdAt: -1 });

    const formattedGoals = goals.map((goal) => {
      const percentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
      const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);

      return {
        ...goal.toObject(),
        percentage,
        remainingAmount,
      };
    });

    res.status(200).json({
      success: true,
      data: formattedGoals,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving financial goals',
    });
  }
};

export const getGoalById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { id } = req.params;

    const goal = await FinancialGoal.findOne({ _id: id, userId });
    if (!goal) {
      res.status(404).json({ success: false, message: 'Goal not found' });
      return;
    }

    const percentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
    const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);

    res.status(200).json({
      success: true,
      data: {
        ...goal.toObject(),
        percentage,
        remainingAmount,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving goal',
    });
  }
};

export const createGoal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { name, targetAmount, currentAmount = 0, targetDate, description, category } = req.body;

    const status = currentAmount >= targetAmount ? 'completed' : 'in_progress';

    const goal = await FinancialGoal.create({
      userId,
      name,
      targetAmount,
      currentAmount,
      targetDate: new Date(targetDate),
      description,
      category,
      status,
    });

    res.status(201).json({
      success: true,
      message: 'Financial goal created successfully',
      data: goal,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating goal',
    });
  }
};

export const updateGoal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { id } = req.params;

    const goal = await FinancialGoal.findOne({ _id: id, userId });
    if (!goal) {
      res.status(404).json({ success: false, message: 'Goal not found' });
      return;
    }

    const { name, targetAmount, currentAmount, targetDate, description, category, status } = req.body;

    if (name !== undefined) goal.name = name;
    if (targetAmount !== undefined) goal.targetAmount = targetAmount;
    if (currentAmount !== undefined) goal.currentAmount = currentAmount;
    if (targetDate !== undefined) goal.targetDate = new Date(targetDate);
    if (description !== undefined) goal.description = description;
    if (category !== undefined) goal.category = category;
    if (status !== undefined) {
      goal.status = status;
    } else if (goal.currentAmount >= goal.targetAmount) {
      goal.status = 'completed';
    }

    await goal.save();

    res.status(200).json({
      success: true,
      message: 'Financial goal updated successfully',
      data: goal,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating goal',
    });
  }
};

export const addGoalProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { id } = req.params;
    const { amount } = req.body;

    const goal = await FinancialGoal.findOne({ _id: id, userId });
    if (!goal) {
      res.status(404).json({ success: false, message: 'Goal not found' });
      return;
    }

    goal.currentAmount = (goal.currentAmount || 0) + amount;
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = 'completed';
    }

    await goal.save();

    res.status(200).json({
      success: true,
      message: `Added ₹${amount.toLocaleString('en-IN')} to goal`,
      data: goal,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error adding goal progress',
    });
  }
};

export const deleteGoal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { id } = req.params;

    const goal = await FinancialGoal.findOneAndDelete({ _id: id, userId });
    if (!goal) {
      res.status(404).json({ success: false, message: 'Goal not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Financial goal deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting goal',
    });
  }
};

