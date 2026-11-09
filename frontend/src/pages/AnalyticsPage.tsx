import React, { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '../services/analyticsService';
import { AnalyticsData } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { InsightsCard } from '../components/dashboard/InsightsCard';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useToast } from '../hooks/useToast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Award,
  Calendar,
  Filter,
} from 'lucide-react';

const CATEGORY_COLORS = [
  '#059669',
  '#0284c7',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#64748b',
  '#e11d48',
  '#a855f7',
];

export const AnalyticsPage: React.FC = () => {
  const { error: toastError } = useToast();

  const [timeRange, setTimeRange] = useState<'this_month' | 'last_month' | 'last_3_months' | 'custom'>('this_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getAnalytics({
        timeRange,
        startDate: timeRange === 'custom' ? startDate : undefined,
        endDate: timeRange === 'custom' ? endDate : undefined,
      });

      if (res.success && res.data) {
        setAnalytics(res.data);
      }
    } catch (err: any) {
      toastError('Error', err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [timeRange, startDate, endDate, toastError]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const summary = analytics?.summary || {
    totalIncome: 0,
    totalExpense: 0,
    savings: 0,
    savingsRate: 0,
    highestCategory: { name: 'None', amount: 0, percentage: 0 },
  };

  const hasActivity = summary.totalIncome > 0 || summary.totalExpense > 0;

  return (
    <div className="space-y-6">
      {/* Page Header and Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Spending Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Evaluate your savings rate, category concentrations and financial velocity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="w-44 text-xs font-semibold"
          >
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="last_3_months">Last 3 Months</option>
            <option value="custom">Custom Range</option>
          </Select>

          {timeRange === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 px-2 text-xs rounded-lg border border-slate-300 bg-white"
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 px-2 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Calculating financial analytics..." />
      ) : (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200/80 bg-white">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Total Inflow</p>
                  <h3 className="text-lg font-bold text-emerald-600">{formatCurrency(summary.totalIncome)}</h3>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 bg-white">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Total Outflow</p>
                  <h3 className="text-lg font-bold text-rose-600">{formatCurrency(summary.totalExpense)}</h3>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 bg-white">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Net Savings</p>
                  <h3 className={`text-lg font-bold ${summary.savings >= 0 ? 'text-teal-600' : 'text-rose-600'}`}>
                    {formatCurrency(summary.savings)} ({summary.savingsRate}%)
                  </h3>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 bg-white">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400 font-semibold uppercase">Top Expense Category</p>
                  <h3 className="text-lg font-bold text-slate-900 truncate">
                    {summary.highestCategory.name}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {formatCurrency(summary.highestCategory.amount)} ({summary.highestCategory.percentage}%)
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Smart Insights for this range */}
          {analytics?.insights && analytics.insights.length > 0 && (
            <InsightsCard insights={analytics.insights} />
          )}

          {/* Category Breakdown Charts & List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 border-slate-200/80 bg-white shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-slate-900">Category Proportions</CardTitle>
                <CardDescription className="text-xs">Relative distribution of expenses</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.categoryBreakdown && analytics.categoryBreakdown.length > 0 ? (
                  <div className="h-60 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.categoryBreakdown}
                          dataKey="amount"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={45}
                        >
                          {analytics.categoryBreakdown.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) => [formatCurrency(Number(value)), 'Expense']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-60 flex items-center justify-center text-xs text-slate-400">
                    No expense data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 border-slate-200/80 bg-white shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-slate-900">Category Spending Table</CardTitle>
                <CardDescription className="text-xs">Exact amounts and share of total spending</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {analytics?.categoryBreakdown && analytics.categoryBreakdown.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase text-slate-400">
                          <th className="py-2.5 px-4">Category</th>
                          <th className="py-2.5 px-4 text-right">Amount</th>
                          <th className="py-2.5 px-4 text-right">% of Spending</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {analytics.categoryBreakdown.map((item, idx) => (
                          <tr key={item.name} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-4 font-semibold text-slate-800 flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                              />
                              <span>{item.name}</span>
                            </td>
                            <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                              {formatCurrency(item.amount)}
                            </td>
                            <td className="py-2.5 px-4 text-right font-medium text-slate-600">
                              {item.percentage}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No category data in selected time frame.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Daily Cashflow Trend */}
          <Card className="border-slate-200/80 bg-white shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-slate-900">Daily Cashflow Trend</CardTitle>
              <CardDescription className="text-xs">Daily income vs daily expenses</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.spendingTrend && analytics.spendingTrend.length > 0 ? (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.spendingTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip
                        formatter={(val: any, name: any) => [
                          formatCurrency(Number(val)),
                          name === 'income' ? 'Income' : 'Expense',
                        ]}
                      />
                      <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                      <Line
                        type="monotone"
                        dataKey="income"
                        name="Income"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="expense"
                        name="Expense"
                        stroke="#f43f5e"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 flex items-center justify-center text-xs text-slate-400">
                  No trend data in selected time range.
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

