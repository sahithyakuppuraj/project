import { api } from './api';
import { BudgetData } from '../types';

export const budgetService = {
  async getBudget(month?: number, year?: number): Promise<{ success: boolean; data: BudgetData }> {
    const query = new URLSearchParams();
    if (month) query.append('month', month.toString());
    if (year) query.append('year', year.toString());
    const qs = query.toString();
    return api.get<{ success: boolean; data: BudgetData }>(`/budgets${qs ? `?${qs}` : ''}`);
  },

  async setBudget(data: {
    month: number;
    year: number;
    totalBudget: number;
    categoryBudgets?: Array<{ category: string; amount: number }>;
  }): Promise<{ success: boolean; message: string; data: any }> {
    return api.post('/budgets', data);
  },

  async deleteBudget(id: string): Promise<{ success: boolean; message: string }> {
    return api.delete(`/budgets/${id}`);
  },
};

