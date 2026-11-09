import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ArrowDownLeft, ArrowUpRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecentTransactionsProps {
  transactions: Transaction[];
  onOpenAdd: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions, onOpenAdd }) => {
  return (
    <Card className="border-slate-200/80 bg-white shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-bold text-slate-900">Recent Transactions</CardTitle>
          <CardDescription className="text-xs">Latest income and expenses</CardDescription>
        </div>
        <Link
          to="/transactions"
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {transactions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {transactions.map((t) => {
              const isIncome = t.type === 'income';
              return (
                <div key={t._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{t.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {t.category}
                        </Badge>
                        <span className="text-[11px] text-slate-400">{formatDate(t.date)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm font-bold ${
                        isIncome ? 'text-emerald-600' : 'text-slate-800'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatCurrency(t.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-xs text-slate-400 mb-3">No transactions recorded yet.</p>
            <button
              onClick={onOpenAdd}
              className="text-xs font-semibold text-emerald-600 hover:underline"
            >
              + Record your first transaction
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

