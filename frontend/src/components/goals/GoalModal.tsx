import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { FinancialGoal, GoalStatus } from '../../types';
import { goalService } from '../../services/goalService';
import { formatInputDate } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  goalToEdit?: FinancialGoal | null;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  goalToEdit,
}) => {
  const { success, error: toastError } = useToast();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [targetDate, setTargetDate] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Savings');
  const [status, setStatus] = useState<GoalStatus>('in_progress');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (goalToEdit) {
      setName(goalToEdit.name);
      setTargetAmount(goalToEdit.targetAmount.toString());
      setCurrentAmount(goalToEdit.currentAmount.toString());
      setTargetDate(formatInputDate(goalToEdit.targetDate));
      setDescription(goalToEdit.description || '');
      setCategory(goalToEdit.category || 'Savings');
      setStatus(goalToEdit.status);
    } else {
      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
      // default target date 6 months from now
      const future = new Date();
      future.setMonth(future.getMonth() + 6);
      setTargetDate(formatInputDate(future));
      setDescription('');
      setCategory('Savings');
      setStatus('in_progress');
    }
  }, [goalToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTarget = parseFloat(targetAmount);
    const parsedCurrent = parseFloat(currentAmount) || 0;

    if (!name.trim()) {
      toastError('Validation Error', 'Goal name is required');
      return;
    }

    if (isNaN(parsedTarget) || parsedTarget < 1) {
      toastError('Validation Error', 'Target amount must be at least ₹1');
      return;
    }

    if (parsedCurrent < 0) {
      toastError('Validation Error', 'Current amount cannot be negative');
      return;
    }

    if (!targetDate) {
      toastError('Validation Error', 'Target date is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        targetAmount: parsedTarget,
        currentAmount: parsedCurrent,
        targetDate,
        description: description.trim() || undefined,
        category: category.trim() || 'Savings',
        status,
      };

      if (goalToEdit) {
        await goalService.updateGoal(goalToEdit._id, payload);
        success('Goal Updated', 'Financial goal has been updated.');
      } else {
        await goalService.createGoal(payload);
        success('Goal Created', `Created savings goal: "${name}"`);
      }

      onSuccess();
    } catch (err: any) {
      toastError('Error', err.message || 'Failed to save goal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goalToEdit ? 'Edit Financial Goal' : 'Create Financial Goal'}
      description="Define a savings milestone to stay focused on your future dreams."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Goal Name *</label>
          <Input
            placeholder="e.g. Save for a Laptop, Emergency Fund..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Amount (₹) *</label>
            <Input
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 50000"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Starting / Saved Amount (₹)</label>
            <Input
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Date *</label>
            <Input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
            <Select value={status} onChange={(e) => setStatus(e.target.value as GoalStatus)}>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Description (Optional)</label>
          <textarea
            rows={2}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
            placeholder="Why are you saving for this?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {goalToEdit ? 'Save Goal' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

