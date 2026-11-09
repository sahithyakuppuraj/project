import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

interface CategoryPieChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

const COLORS = [
  '#059669', // Emerald
  '#0284c7', // Sky
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#64748b', // Slate
  '#e11d48', // Rose
  '#a855f7', // Purple
];

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  const filteredData = data.filter((d) => d.value > 0);
  const total = filteredData.reduce((acc, curr) => acc + curr.value, 0);

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-xl text-xs space-y-0.5 border border-slate-700">
          <p className="font-semibold text-slate-200">{item.name}</p>
          <p className="text-emerald-400 font-bold">{formatCurrency(item.value)}</p>
          <p className="text-slate-400">{percentage}% of total expenses</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-slate-200/80 bg-white shadow-xs">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-slate-900">Expenses by Category</CardTitle>
        <CardDescription className="text-xs">Category allocation breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        {filteredData.length > 0 ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="h-56 w-56 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={customTooltip} />
                  <Pie
                    data={filteredData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {filteredData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend list */}
            <div className="flex-1 w-full max-h-56 overflow-y-auto space-y-1.5 pr-2">
              {filteredData.map((item, idx) => {
                const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                return (
                  <div key={item.name} className="flex items-center justify-between text-xs py-0.5">
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <span className="font-medium text-slate-700 truncate">{item.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-semibold text-slate-800">{formatCurrency(item.value)}</span>
                      <span className="text-slate-400 ml-1.5">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-56 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-100 rounded-lg">
            No expenses recorded this month
          </div>
        )}
      </CardContent>
    </Card>
  );
};

