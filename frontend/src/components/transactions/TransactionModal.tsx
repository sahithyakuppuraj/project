import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Transaction, TransactionType } from '../../types';
import { transactionService } from '../../services/transactionService';
import { formatInputDate } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transactionToEdit?: Transaction | null;
}

const DEFAULT_EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Education',
  'Shopping',
  'Bills',
  'Entertainment',
  'Healthcare',
  'Other',
];

const DEFAULT_INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other'];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  transactionToEdit,
}) => {
  const { success, error: toastError } = useToast();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Food');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(formatInputDate());
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setAmount(transactionToEdit.amount.toString());
      setCategory(transactionToEdit.category);
      setDescription(transactionToEdit.description);
      setDate(formatInputDate(transactionToEdit.date));
      setNotes(transactionToEdit.notes || '');
    } else {
      setType('expense');
      setAmount('');
      setCategory('Food');
      setDescription('');
      setDate(formatInputDate());
      setNotes('');
    }
    setFormErrors({});
  }, [transactionToEdit, isOpen]);

  // Update default category when type toggles if current category is not in list
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'expense') {
      setCategory(DEFAULT_EXPENSE_CATEGORIES[0]);
    } else {
      setCategory(DEFAULT_INCOME_CATEGORIES[0]);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const parsedAmount = parseFloat(amount);

    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      errors.amount = 'Please enter a valid amount greater than 0';
    }

    if (!description.trim()) {
      errors.description = 'Description is required';
    } else if (description.trim().length > 200) {
      errors.description = 'Description cannot exceed 200 characters';
    }

    if (!category.trim()) {
      errors.category = 'Category is required';
    }

    if (!date) {
      errors.date = 'Date is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        amount: parseFloat(amount),
        type,
        category,
        description: description.trim(),
        date,
        notes: notes.trim() || undefined,
      };

      if (transactionToEdit) {
        await transactionService.updateTransaction(transactionToEdit._id, payload);
        success('Transaction Updated', 'Your transaction changes have been saved.');
      } else {
        await transactionService.createTransaction(payload);
        success('Transaction Recorded', `${type === 'income' ? 'Income' : 'Expense'} of ₹${payload.amount} added.`);
      }

      onSuccess();
    } catch (err: any) {
      toastError('Save Failed', err.message || 'Could not save transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeCategories = type === 'expense' ? DEFAULT_EXPENSE_CATEGORIES : DEFAULT_INCOME_CATEGORIES;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transactionToEdit ? 'Edit Transaction' : 'Record Transaction'}
      description="Track your money flow with accurate categorization."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selector (Income / Expense) */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition ${
              type === 'expense'
                ? 'bg-white text-rose-600 shadow-xs border border-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Expense</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition ${
              type === 'income'
                ? 'bg-white text-emerald-600 shadow-xs border border-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Income</span>
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹ INR) *</label>
          <Input
            type="number"
            step="any"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={formErrors.amount}
            className="text-base font-semibold"
            autoFocus
          />
        </div>

        {/* Category & Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              error={formErrors.category}
            >
              {activeCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              error={formErrors.date}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
          <Input
            type="text"
            placeholder="e.g. Grocery shopping, Freelance payment..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={formErrors.description}
          />
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Notes (Optional)</label>
          <textarea
            rows={2}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
            placeholder="Payment method, invoice reference, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {transactionToEdit ? 'Save Changes' : 'Add Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

