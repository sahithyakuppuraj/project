import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';
import { ArrowDownLeft, ArrowUpRight, Wallet, PieChart, ShieldAlert } from 'lucide-react';

interface SummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  monthlyBudget: number;
  remainingBudget: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalIncome,
  totalExpenses,
  currentBalance,
  monthlyBudget,
  remainingBudget,
}) => {
  const isBudgetConfigured = monthlyBudget > 0;
  const isBudgetExceeded = isBudgetConfigured && remainingBudget < 0;
  const isBudgetWarning = isBudgetConfigured && !isBudgetExceeded && remainingBudget < monthlyBudget * 0.2;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Current Balance */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-md">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Total Net Balance</span>
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold tracking-tight text-white">{formatCurrency(currentBalance)}</h3>
            <p className="text-xs text-slate-400 mt-1">Cumulative income minus expenses</p>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Income */}
      <Card className="border-slate-200/80 bg-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">This Month's Income</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold tracking-tight text-emerald-600">{formatCurrency(totalIncome)}</h3>
            <p className="text-xs text-slate-400 mt-1">Earned during current calendar month</p>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Expenses */}
      <Card className="border-slate-200/80 bg-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">This Month's Spending</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold tracking-tight text-rose-600">{formatCurrency(totalExpenses)}</h3>
            <p className="text-xs text-slate-400 mt-1">Total expenses incurred this month</p>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Budget & Remaining */}
      <Card className={`border ${isBudgetExceeded ? 'border-rose-200 bg-rose-50/30' : isBudgetWarning ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200/80 bg-white'}`}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isBudgetConfigured ? 'Budget Status' : 'Monthly Budget'}
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isBudgetExceeded ? 'bg-rose-100 text-rose-600' : isBudgetWarning ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
              {isBudgetExceeded ? <ShieldAlert className="w-4 h-4" /> : <PieChart className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-3">
            {isBudgetConfigured ? (
              <>
                <h3 className={`text-2xl font-bold tracking-tight ${isBudgetExceeded ? 'text-rose-600' : 'text-slate-800'}`}>
                  {formatCurrency(remainingBudget)}
                </h3>
                <p className={`text-xs mt-1 ${isBudgetExceeded ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
                  {isBudgetExceeded
                    ? 'Exceeded budget limit!'
                    : `Remaining from ${formatCurrency(monthlyBudget)}`}
                </p>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold tracking-tight text-slate-400">Not Set</h3>
                <p className="text-xs text-slate-400 mt-1">Set a budget in Budgets page</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

