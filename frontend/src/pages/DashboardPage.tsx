import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { analyticsService } from '../services/analyticsService';
import { DashboardSummary } from '../types';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { IncomeExpenseChart } from '../components/dashboard/IncomeExpenseChart';
import { CategoryPieChart } from '../components/dashboard/CategoryPieChart';
import { SpendingTrendChart } from '../components/dashboard/SpendingTrendChart';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { InsightsCard } from '../components/dashboard/InsightsCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { RefreshCw, Plus, ArrowUpRight } from 'lucide-react';
import { useToast } from '../hooks/useToast';

interface LayoutContextType {
  openAddTransaction: () => void;
}

export const DashboardPage: React.FC = () => {
  const { openAddTransaction } = useOutletContext<LayoutContextType>();
  const { error: toastError } = useToast();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setLoading(true);

    try {
      const res = await analyticsService.getDashboardSummary();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      toastError('Error', err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchDashboardData();

    // Listen for data updates triggered elsewhere
    const handleDataUpdate = () => fetchDashboardData(true);
    window.addEventListener('finance_data_updated', handleDataUpdate);
    return () => window.removeEventListener('finance_data_updated', handleDataUpdate);
  }, [fetchDashboardData]);

  if (loading && !data) {
    return <LoadingSpinner message="Calculating your financial summary..." />;
  }

  const summary = data?.summary || {
    totalIncome: 0,
    totalExpenses: 0,
    currentBalance: 0,
    monthlyBudget: 0,
    remainingBudget: 0,
    savings: 0,
  };

  return (
    <div className="space-y-6">
      {/* Page Header / Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Financial Overview</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor cashflow, track budget allocation and gain intelligent spending habits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDashboardData(true)}
            isLoading={isRefreshing}
            className="h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline ml-1.5">Refresh</span>
          </Button>
          <Button size="sm" onClick={openAddTransaction} className="h-9 shadow-sm">
            <Plus className="w-4 h-4 mr-1" />
            <span>New Transaction</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards
        totalIncome={summary.totalIncome}
        totalExpenses={summary.totalExpenses}
        currentBalance={summary.currentBalance}
        monthlyBudget={summary.monthlyBudget}
        remainingBudget={summary.remainingBudget}
      />

      {/* Smart Insights (if generated) */}
      {data?.insights && data.insights.length > 0 && (
        <InsightsCard insights={data.insights} />
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomeExpenseChart data={data?.charts.incomeVsExpense || []} />
        <CategoryPieChart data={data?.charts.expenseByCategory || []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SpendingTrendChart data={data?.charts.spendingTrend || []} />
        </div>
        <div className="lg:col-span-1">
          <RecentTransactions
            transactions={data?.recentTransactions || []}
            onOpenAdd={openAddTransaction}
          />
        </div>
      </div>
    </div>
  );
};

