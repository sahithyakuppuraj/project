import { api } from './api';
import { Transaction, Pagination, TransactionType } from '../types';

export interface GetTransactionsParams {
  search?: string;
  category?: string;
  type?: TransactionType | 'all';
  startDate?: string;
  endDate?: string;
  sortBy?: 'date' | 'amount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface TransactionsResponse {
  success: boolean;
  data: Transaction[];
  pagination: Pagination;
}

export const transactionService = {
  async getTransactions(params: GetTransactionsParams = {}): Promise<TransactionsResponse> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.type && params.type !== 'all') query.append('type', params.type);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    const qs = query.toString();
    return api.get<TransactionsResponse>(`/transactions${qs ? `?${qs}` : ''}`);
  },

  async getTransactionById(id: string): Promise<{ success: boolean; data: Transaction }> {
    return api.get<{ success: boolean; data: Transaction }>(`/transactions/${id}`);
  },

  async createTransaction(data: {
    amount: number;
    type: TransactionType;
    category: string;
    description: string;
    date?: string;
    notes?: string;
  }): Promise<{ success: boolean; message: string; data: Transaction }> {
    return api.post('/transactions', data);
  },

  async updateTransaction(
    id: string,
    data: {
      amount?: number;
      type?: TransactionType;
      category?: string;
      description?: string;
      date?: string;
      notes?: string;
    }
  ): Promise<{ success: boolean; message: string; data: Transaction }> {
    return api.put(`/transactions/${id}`, data);
  },

  async deleteTransaction(id: string): Promise<{ success: boolean; message: string }> {
    return api.delete(`/transactions/${id}`);
  },

  async getCategories(): Promise<{ success: boolean; data: string[] }> {
    return api.get<{ success: boolean; data: string[] }>('/transactions/categories');
  },
};

