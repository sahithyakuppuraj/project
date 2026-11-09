import React, { useState, useEffect, useCallback } from 'react';
import { transactionService } from '../services/transactionService';
import { Transaction, TransactionType, Pagination } from '../types';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent } from '../components/ui/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useToast } from '../hooks/useToast';
import {
  Search,
  Plus,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RotateCcw,
} from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Filter States
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [type, setType] = useState<TransactionType | 'all'>('all');
  const [category, setCategory] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState<number>(1);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await transactionService.getCategories();
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Failed to load categories');
      }
    };
    loadCategories();
  }, []);

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await transactionService.getTransactions({
        search: debouncedSearch || undefined,
        type: type !== 'all' ? type : undefined,
        category: category !== 'all' ? category : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortBy,
        sortOrder,
        page,
        limit: 10,
      });

      if (res.success) {
        setTransactions(res.data);
        setPagination(res.pagination);
      }
    } catch (err: any) {
      toastError('Error', err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, type, category, startDate, endDate, sortBy, sortOrder, page, toastError]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;

    setDeletingId(id);
    try {
      await transactionService.deleteTransaction(id);
      success('Transaction Deleted', 'The transaction record was removed.');
      fetchTransactions();
      window.dispatchEvent(new Event('finance_data_updated'));
    } catch (err: any) {
      toastError('Delete Failed', err.message || 'Could not delete transaction');
    } finally {
      setDeletingId(null);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setType('all');
    setCategory('all');
    setStartDate('');
    setEndDate('');
    setSortBy('date');
    setSortOrder('desc');
    setPage(1);
  };

  const handleEdit = (transaction: Transaction) => {
    setTransactionToEdit(transaction);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setTransactionToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Transactions</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Search, filter and organize all your income and expense transactions.
          </p>
        </div>
        <Button onClick={handleAddNew} size="sm" className="h-9 shadow-sm self-start sm:self-auto">
          <Plus className="w-4 h-4 mr-1" />
          <span>Add Transaction</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-slate-200/80 bg-white shadow-xs">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search description or note..."
                icon={<Search className="w-4 h-4" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Type Filter */}
            <div>
              <Select value={type} onChange={(e) => { setType(e.target.value as any); setPage(1); }}>
                <option value="all">All Types (Income & Expense)</option>
                <option value="expense">Expense Only</option>
                <option value="income">Income Only</option>
              </Select>
            </div>

            {/* Category Filter */}
            <div>
              <Select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </div>

            {/* Sort Filter */}
            <div>
              <Select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as 'date' | 'amount');
                  setSortOrder(order as 'asc' | 'desc');
                  setPage(1);
                }}
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="amount-desc">Highest Amount</option>
                <option value="amount-asc">Lowest Amount</option>
              </Select>
            </div>
          </div>

          {/* Date range row */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="h-8 px-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                className="h-8 px-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {(search || type !== 'all' || category !== 'all' || startDate || endDate) && (
              <button
                onClick={handleResetFilters}
                className="ml-auto inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table / List */}
      <Card className="border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <LoadingSpinner message="Loading transactions..." className="py-20" />
          ) : transactions.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={<Filter className="w-6 h-6" />}
                title="No transactions found"
                description={
                  search || type !== 'all' || category !== 'all' || startDate || endDate
                    ? 'No records match your selected search or filter parameters.'
                    : 'Get started by recording your first income or expense.'
                }
                actionText="Record Transaction"
                onAction={handleAddNew}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4 sm:px-6">Description</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {transactions.map((t) => {
                    const isIncome = t.type === 'income';
                    return (
                      <tr key={t._id} className="hover:bg-slate-50/60 transition group">
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                              }`}
                            >
                              {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 truncate">{t.description}</p>
                              {t.notes && <p className="text-xs text-slate-400 truncate max-w-xs">{t.notes}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant="outline" className="text-xs font-medium">
                            {t.category}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={isIncome ? 'success' : 'danger'} className="text-[11px] font-semibold">
                            {isIncome ? 'Income' : 'Expense'}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                          {formatDate(t.date)}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap font-bold">
                          <span className={isIncome ? 'text-emerald-600' : 'text-slate-900'}>
                            {isIncome ? '+' : '-'}
                            {formatCurrency(t.amount)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEdit(t)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                              title="Edit Transaction"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(t._id)}
                              disabled={deletingId === t._id}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Delete Transaction"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination bar */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} transactions
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-2 font-medium">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit / Add Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchTransactions();
          window.dispatchEvent(new Event('finance_data_updated'));
        }}
        transactionToEdit={transactionToEdit}
      />
    </div>
  );
};

