import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { FinancialGoal } from '../../types';
import { goalService } from '../../services/goalService';
import { formatCurrency } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';

interface AddProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  goal: FinancialGoal | null;
}

export const AddProgressModal: React.FC<AddProgressModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  goal,
}) => {
  const { success, error: toastError } = useToast();
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!goal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed < 1) {
      toastError('Validation Error', 'Please enter an amount of at least ₹1');
      return;
    }

    setIsSubmitting(true);
    try {
      await goalService.addGoalProgress(goal._id, parsed);
      success('Contribution Recorded', `Added ${formatCurrency(parsed)} towards "${goal.name}".`);
      setAmount('');
      onSuccess();
    } catch (err: any) {
      toastError('Error', err.message || 'Failed to add progress.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Savings to "${goal.name}"`}
      description={`Currently saved: ${formatCurrency(goal.currentAmount)} of ${formatCurrency(goal.targetAmount)} (${goal.percentage}%)`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Deposit Amount (₹ INR) *
          </label>
          <Input
            type="number"
            min="1"
            step="1"
            placeholder="e.g. 2000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            autoFocus
          />
        </div>

        {/* Quick add buttons */}
        <div className="flex gap-2">
          {[500, 1000, 2000, 5000].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(preset.toString())}
              className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              +₹{preset}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Add Funds
          </Button>
        </div>
      </form>
    </Modal>
  );
};

