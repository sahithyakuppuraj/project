import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCompactCurrency, formatCurrency } from '../../utils/formatters';

interface SpendingTrendChartProps {
  data: Array<{
    date: string;
    amount: number;
  }>;
}

export const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({ data }) => {
  const hasExpenses = data.some((d) => d.amount > 0);

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-xl text-xs space-y-0.5 border border-slate-700">
          <p className="text-slate-400">{label}</p>
          <p className="text-emerald-400 font-bold">{formatCurrency(payload[0]?.value || 0)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-slate-200/80 bg-white shadow-xs">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-slate-900">Monthly Spending Trend</CardTitle>
        <CardDescription className="text-xs">Daily expense trajectory this month</CardDescription>
      </CardHeader>
      <CardContent>
        {hasExpenses ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} minTickGap={20} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCompactCurrency}
                />
                <Tooltip content={customTooltip} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#spendingGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-100 rounded-lg">
            No daily expense activity recorded yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};

