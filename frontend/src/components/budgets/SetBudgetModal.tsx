import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { budgetService } from '../../services/budgetService';
import { useToast } from '../../hooks/useToast';
import { formatCurrency } from '../../utils/formatters';

interface SetBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentMonth: number;
  currentYear: number;
  initialTotalBudget?: number;
  initialCategoryBudgets?: Array<{ category: string; budgetAmount: number }>;
}

const DEFAULT_BUDGET_CATEGORIES = [
  'Food',
  'Transport',
  'Bills',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Education',
  'Other',
];

export const SetBudgetModal: React.FC<SetBudgetModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentMonth,
  currentYear,
  initialTotalBudget = 0,
  initialCategoryBudgets = [],
}) => {
  const { success, error: toastError } = useToast();
  const [totalBudget, setTotalBudget] = useState<string>('');
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTotalBudget(initialTotalBudget > 0 ? initialTotalBudget.toString() : '');
      const map: Record<string, string> = {};
      DEFAULT_BUDGET_CATEGORIES.forEach((cat) => {
        const found = initialCategoryBudgets.find((b) => b.category === cat);
        map[cat] = found && found.budgetAmount > 0 ? found.budgetAmount.toString() : '';
      });
      setCategoryBudgets(map);
    }
  }, [isOpen, initialTotalBudget, initialCategoryBudgets]);

  const handleCategoryChange = (category: string, value: string) => {
    setCategoryBudgets((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const calculateCategorySum = (): number => {
    return Object.values(categoryBudgets).reduce((sum, val) => {
      const num = parseFloat(val);
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTotal = parseFloat(totalBudget);
    if (isNaN(parsedTotal) || parsedTotal < 1) {
      toastError('Invalid Budget', 'Please enter a total monthly budget of at least ₹1.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedCategoryBudgets = Object.entries(categoryBudgets)
        .map(([category, amountStr]) => ({
          category,
          amount: parseFloat(amountStr) || 0,
        }))
        .filter((b) => b.amount > 0);

      await budgetService.setBudget({
        month: currentMonth,
        year: currentYear,
        totalBudget: parsedTotal,
        categoryBudgets: formattedCategoryBudgets,
      });

      success('Budget Saved', `Monthly budget of ${formatCurrency(parsedTotal)} configured.`);
      onSuccess();
    } catch (err: any) {
      toastError('Failed to Save', err.message || 'Could not update budget.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categorySum = calculateCategorySum();
  const parsedTotal = parseFloat(totalBudget) || 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure Monthly Budget"
      description="Set your maximum spending limit and assign category quotas."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Total Budget Input */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl">
          <label className="block text-xs font-bold text-emerald-900 mb-1">
            Total Monthly Budget (₹ INR) *
          </label>
          <Input
            type="number"
            step="1"
            min="1"
            placeholder="e.g. 50000"
            value={totalBudget}
            onChange={(e) => setTotalBudget(e.target.value)}
            className="text-base font-bold bg-white"
            autoFocus
          />
          <div className="mt-2 flex items-center justify-between text-xs text-emerald-800">
            <span>Allocated in Categories: {formatCurrency(categorySum)}</span>
            <span className={categorySum > parsedTotal && parsedTotal > 0 ? 'text-rose-600 font-bold' : ''}>
              {parsedTotal > 0
                ? categorySum > parsedTotal
                  ? `Exceeds Total by ${formatCurrency(categorySum - parsedTotal)}`
                  : `Unallocated: ${formatCurrency(parsedTotal - categorySum)}`
                : ''}
            </span>
          </div>
        </div>

        {/* Category breakdown inputs */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Category Allocations (Optional)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
            {DEFAULT_BUDGET_CATEGORIES.map((cat) => (
              <div key={cat} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-xs font-medium text-slate-700 w-28 truncate">{cat}</span>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  placeholder="0"
                  value={categoryBudgets[cat] || ''}
                  onChange={(e) => handleCategoryChange(cat, e.target.value)}
                  className="h-8 text-xs bg-white text-right font-medium"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Save Budget
          </Button>
        </div>
      </form>
    </Modal>
  );
};

