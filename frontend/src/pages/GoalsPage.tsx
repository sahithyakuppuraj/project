import React, { useState, useEffect, useCallback } from 'react';
import { goalService } from '../services/goalService';
import { FinancialGoal } from '../types';
import { GoalModal } from '../components/goals/GoalModal';
import { AddProgressModal } from '../components/goals/AddProgressModal';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Progress } from '../components/ui/Progress';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useToast } from '../hooks/useToast';
import {
  Target,
  Plus,
  Calendar,
  Pencil,
  Trash2,
  CheckCircle2,
  PiggyBank,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export const GoalsPage: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<FinancialGoal | null>(null);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [goalForProgress, setGoalForProgress] = useState<FinancialGoal | null>(null);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await goalService.getGoals();
      if (res.success && res.data) {
        setGoals(res.data);
      }
    } catch (err: any) {
      toastError('Error', err.message || 'Failed to fetch financial goals');
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await goalService.deleteGoal(id);
      success('Goal Deleted', `Removed goal "${name}".`);
      fetchGoals();
    } catch (err: any) {
      toastError('Delete Failed', err.message || 'Could not delete goal');
    }
  };

  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const completedGoalsCount = goals.filter((g) => g.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Financial Goals</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Turn your financial dreams into achievable milestones.
          </p>
        </div>
        <Button
          onClick={() => {
            setGoalToEdit(null);
            setIsGoalModalOpen(true);
          }}
          size="sm"
          className="h-9 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1" />
          <span>New Goal</span>
        </Button>
      </div>

      {/* Aggregate Milestones Card */}
      {goals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-slate-200/80 bg-white">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <PiggyBank className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Total Goal Savings</p>
                <h3 className="text-lg font-bold text-slate-900">{formatCurrency(totalSaved)}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-white">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Total Target Milestone</p>
                <h3 className="text-lg font-bold text-slate-900">{formatCurrency(totalTarget)}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-white">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Completed Goals</p>
                <h3 className="text-lg font-bold text-slate-900">
                  {completedGoalsCount} of {goals.length} achieved
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Goals Grid */}
      {loading ? (
        <LoadingSpinner message="Loading financial milestones..." />
      ) : goals.length === 0 ? (
        <EmptyState
          icon={<Target className="w-6 h-6" />}
          title="No financial goals yet"
          description="Create savings targets like buying a laptop, vacation fund, or emergency reserves."
          actionText="Create Goal"
          onAction={() => {
            setGoalToEdit(null);
            setIsGoalModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((goal) => {
            const isCompleted = goal.status === 'completed' || goal.percentage >= 100;
            return (
              <Card
                key={goal._id}
                className={`border bg-white transition hover:shadow-md ${
                  isCompleted ? 'border-emerald-200 shadow-emerald-900/5' : 'border-slate-200/80'
                }`}
              >
                <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                  {/* Goal Header */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-500 mb-1">
                          {goal.category || 'General Savings'}
                        </Badge>
                        <h3 className="text-base font-bold text-slate-900 truncate">{goal.name}</h3>
                      </div>
                      <Badge
                        variant={isCompleted ? 'success' : goal.status === 'paused' ? 'warning' : 'info'}
                        className="text-[11px] font-semibold shrink-0"
                      >
                        {isCompleted ? 'Completed' : goal.status === 'paused' ? 'Paused' : 'In Progress'}
                      </Badge>
                    </div>

                    {goal.description && (
                      <p className="text-xs text-slate-500 line-clamp-2">{goal.description}</p>
                    )}
                  </div>

                  {/* Financial Progress */}
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between text-xs">
                      <div>
                        <span className="text-slate-400 text-[11px]">Saved: </span>
                        <span className="font-bold text-slate-800 text-sm">
                          {formatCurrency(goal.currentAmount)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 text-[11px]">Target: </span>
                        <span className="font-semibold text-slate-700">{formatCurrency(goal.targetAmount)}</span>
                      </div>
                    </div>

                    <Progress value={goal.percentage} className="h-2.5" />

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-semibold text-emerald-600">{goal.percentage}% saved</span>
                      <span>
                        {goal.remainingAmount > 0
                          ? `Remaining: ${formatCurrency(goal.remainingAmount)}`
                          : 'Goal reached! 🎉'}
                      </span>
                    </div>
                  </div>

                  {/* Target Date & Quick Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(goal.targetDate)}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {!isCompleted && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setGoalForProgress(goal);
                            setIsProgressModalOpen(true);
                          }}
                          className="h-7 text-xs px-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                        >
                          + Add Savings
                        </Button>
                      )}
                      <button
                        onClick={() => {
                          setGoalToEdit(goal);
                          setIsGoalModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                        title="Edit Goal"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal._id, goal.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Goal Modal (Create/Edit) */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSuccess={() => {
          setIsGoalModalOpen(false);
          fetchGoals();
        }}
        goalToEdit={goalToEdit}
      />

      {/* Add Progress Modal */}
      <AddProgressModal
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        onSuccess={() => {
          setIsProgressModalOpen(false);
          fetchGoals();
        }}
        goal={goalForProgress}
      />
    </div>
  );
};

