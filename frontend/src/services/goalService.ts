import { api } from './api';
import { FinancialGoal, GoalStatus } from '../types';

export const goalService = {
  async getGoals(): Promise<{ success: boolean; data: FinancialGoal[] }> {
    return api.get<{ success: boolean; data: FinancialGoal[] }>('/goals');
  },

  async getGoalById(id: string): Promise<{ success: boolean; data: FinancialGoal }> {
    return api.get<{ success: boolean; data: FinancialGoal }>(`/goals/${id}`);
  },

  async createGoal(data: {
    name: string;
    targetAmount: number;
    currentAmount?: number;
    targetDate: string;
    description?: string;
    category?: string;
    status?: GoalStatus;
  }): Promise<{ success: boolean; message: string; data: FinancialGoal }> {
    return api.post('/goals', data);
  },

  async updateGoal(
    id: string,
    data: {
      name?: string;
      targetAmount?: number;
      currentAmount?: number;
      targetDate?: string;
      description?: string;
      category?: string;
      status?: GoalStatus;
    }
  ): Promise<{ success: boolean; message: string; data: FinancialGoal }> {
    return api.put(`/goals/${id}`, data);
  },

  async addGoalProgress(id: string, amount: number): Promise<{ success: boolean; message: string; data: FinancialGoal }> {
    return api.patch(`/goals/${id}/progress`, { amount });
  },

  async deleteGoal(id: string): Promise<{ success: boolean; message: string }> {
    return api.delete(`/goals/${id}`);
  },
};

