import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { SpendingInsight } from '../../types';
import { Sparkles, AlertTriangle, TrendingUp, Info, ShieldAlert } from 'lucide-react';

interface InsightsCardProps {
  insights: SpendingInsight[];
}

export const InsightsCard: React.FC<InsightsCardProps> = ({ insights }) => {
  if (!insights || insights.length === 0) return null;

  const getInsightIcon = (type: SpendingInsight['type']) => {
    switch (type) {
      case 'alert':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'success':
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      default:
        return <Info className="w-4 h-4 text-sky-600" />;
    }
  };

  const getInsightBg = (type: SpendingInsight['type']) => {
    switch (type) {
      case 'alert':
        return 'bg-rose-50/70 border-rose-200/80 text-rose-950';
      case 'warning':
        return 'bg-amber-50/70 border-amber-200/80 text-amber-950';
      case 'success':
        return 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950';
      default:
        return 'bg-sky-50/70 border-sky-200/80 text-sky-950';
    }
  };

  return (
    <Card className="border-slate-200/80 bg-white shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900">Smart Financial Insights</CardTitle>
            <CardDescription className="text-xs">Rule-based intelligence on your monthly finances</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border flex items-start gap-3 transition ${getInsightBg(item.type)}`}
            >
              <div className="mt-0.5 shrink-0">{getInsightIcon(item.type)}</div>
              <div className="text-xs leading-relaxed">
                <p className="font-bold text-slate-900 mb-0.5">{item.title}</p>
                <p className="text-slate-600">{item.message}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

