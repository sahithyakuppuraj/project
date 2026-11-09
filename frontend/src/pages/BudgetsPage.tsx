import React, { useState, useEffect, useCallback } from 'react';
import { budgetService } from '../../src/services/budgetService';
import { BudgetData } from '../types';
import { SetBudgetModal } from '../components/budgets/SetBudgetModal';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Progress } from '../components/ui/Progress';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatCurrency } from '../utils/formatters';
import { useToast } from '../hooks/useToast';
import {
  PieChart,
  Plus,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
} from 'lucide-react';

export const BudgetsPage: React.FC = () => {
  const { error: toastError } = useToast();
  const now = new Date();

  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [year, setYear] = useState<number>(now.getFullYear());
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const fetchBudget = useCallback(async () => {
    setLoading(true);
    try {
      const res = await budgetService.getBudget(month, year);
      if (res.success && res.data) {
        setBudgetData(res.data);
      }
    } catch (err: any) {
      toastError('Error', err.message || 'Failed to load budget');
    } finally {
      setLoading(false);
    }
  }, [month, year, toastError]);

  useEffect(() => {
    fetchBudget();
    const handleUpdate = () => fetchBudget();
    window.addEventListener('finance_data_updated', handleUpdate);
    return () => window.removeEventListener('finance_data_updated', handleUpdate);
  }, [fetchBudget]);

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((prev) => prev - 1);
    } else {
      setMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((prev) => prev + 1);
    } else {
      setMonth((prev) => prev + 1);
    }
  };

  const isConfigured = budgetData && budgetData.totalBudget > 0;
  const isExceeded = isConfigured && budgetData.totalSpent > budgetData.totalBudget;
  const isWarning =
    isConfigured &&
    !isExceeded &&
    budgetData.percentageUsed >= 80;

  return (
    <div className="space-y-6">
      {/* Header and Month Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Budget Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Plan monthly expenses, enforce spending limits and avoid overdrafts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month Selector */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-xs">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-semibold text-slate-800 min-w-28 text-center">
              {monthNames[month - 1]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Button onClick={() => setIsModalOpen(true)} size="sm" className="h-9 shadow-sm">
            <Plus className="w-4 h-4 mr-1" />
            <span>{isConfigured ? 'Edit Budget' : 'Set Budget'}</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Calculating budget thresholds..." />
      ) : (
        <>
          {/* Warning Banner if threshold exceeded */}
          {isExceeded && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 shadow-xs">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Critical Warning: Budget Exceeded!</h4>
                <p className="text-xs text-rose-700 mt-0.5">
                  You have spent {formatCurrency(budgetData.totalSpent)} which exceeds your limit of{' '}
                  {formatCurrency(budgetData.totalBudget)} by{' '}
                  <span className="font-bold">{formatCurrency(budgetData.totalSpent - budgetData.totalBudget)}</span>{' '}
                  ({budgetData.percentageUsed}% used). Consider reviewing discretionary categories.
                </p>
              </div>
            </div>
          )}

          {isWarning && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Caution: Approaching Monthly Budget Limit</h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  You have consumed {budgetData.percentageUsed}% of your budget. Remaining limit:{' '}
                  <span className="font-bold">{formatCurrency(budgetData.remainingBudget)}</span>.
                </p>
              </div>
            </div>
          )}

          {/* Primary Budget Overview Card */}
          <Card className="border-slate-200/80 bg-white shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">
                    Total Monthly Budget Overview
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {monthNames[month - 1]} {year} spending pace
                  </CardDescription>
                </div>
                <Badge
                  variant={isExceeded ? 'danger' : isWarning ? 'warning' : 'success'}
                  className="text-xs px-3 py-1 font-bold"
                >
                  {isExceeded ? 'Exceeded' : isWarning ? 'Warning (>80%)' : 'On Track'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {isConfigured ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50/70 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-xs text-slate-400 font-semibold uppercase">Total Budget</span>
                      <p className="text-xl font-bold text-slate-800 mt-0.5">
                        {formatCurrency(budgetData.totalBudget)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-semibold uppercase">Actual Spent</span>
                      <p
                        className={`text-xl font-bold mt-0.5 ${
                          isExceeded ? 'text-rose-600' : 'text-slate-800'
                        }`}
                      >
                        {formatCurrency(budgetData.totalSpent)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-semibold uppercase">Remaining Limit</span>
                      <p
                        className={`text-xl font-bold mt-0.5 ${
                          isExceeded ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {formatCurrency(budgetData.remainingBudget)}
                      </p>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold mb-2">
                      <span className="text-slate-600">Budget Consumed</span>
                      <span
                        className={
                          isExceeded
                            ? 'text-rose-600 font-bold'
                            : isWarning
                            ? 'text-amber-600 font-bold'
                            : 'text-emerald-600'
                        }
                      >
                        {budgetData.percentageUsed}%
                      </span>
                    </div>
                    <Progress value={budgetData.percentageUsed} className="h-3" />
                  </div>
                </>
              ) : (
                <div className="py-10 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                    <PieChart className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">No Budget Defined for {monthNames[month - 1]} {year}</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                    Setting a monthly budget enables real-time progress tracking and intelligent warnings before you overspend.
                  </p>
                  <Button onClick={() => setIsModalOpen(true)} size="sm">
                    Configure {monthNames[month - 1]} Budget
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Budgets Grid */}
          {budgetData && budgetData.categoryBudgets && budgetData.categoryBudgets.length > 0 && (
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-3">Category-Wise Budget Quotas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {budgetData.categoryBudgets.map((cat) => (
                  <Card key={cat.category} className="border-slate-200/80 bg-white shadow-xs">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-slate-800">{cat.category}</h4>
                          <span className="text-xs text-slate-400">
                            Limit: {formatCurrency(cat.budgetAmount)}
                          </span>
                        </div>
                        <Badge
                          variant={cat.isExceeded ? 'danger' : cat.isWarning ? 'warning' : 'default'}
                          className="text-[11px]"
                        >
                          {cat.percentageUsed}%
                        </Badge>
                      </div>

                      <Progress value={cat.percentageUsed} className="h-2" />

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                          Spent: <strong className="text-slate-800">{formatCurrency(cat.spentAmount)}</strong>
                        </span>
                        <span className={cat.isExceeded ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                          {cat.isExceeded
                            ? `Over by ${formatCurrency(cat.spentAmount - cat.budgetAmount)}`
                            : `Left: ${formatCurrency(cat.remainingAmount)}`}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Set Budget Modal */}
      <SetBudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchBudget();
          window.dispatchEvent(new Event('finance_data_updated'));
        }}
        currentMonth={month}
        currentYear={year}
        initialTotalBudget={budgetData?.totalBudget || 0}
        initialCategoryBudgets={budgetData?.categoryBudgets || []}
      />
    </div>
  );
};

