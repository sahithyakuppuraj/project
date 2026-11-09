import { api } from './api';
import { DashboardSummary, AnalyticsData } from '../types';

export const analyticsService = {
  async getDashboardSummary(): Promise<{ success: boolean; data: DashboardSummary }> {
    return api.get<{ success: boolean; data: DashboardSummary }>('/analytics/dashboard');
  },

  async getAnalytics(params: {
    timeRange?: 'this_month' | 'last_month' | 'last_3_months' | 'custom';
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{ success: boolean; data: AnalyticsData }> {
    const query = new URLSearchParams();
    if (params.timeRange) query.append('timeRange', params.timeRange);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    const qs = query.toString();
    return api.get<{ success: boolean; data: AnalyticsData }>(`/analytics${qs ? `?${qs}` : ''}`);
  },
};

