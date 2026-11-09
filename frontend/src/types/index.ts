export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
  createdAt: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  _id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryBudget {
  category: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  isExceeded: boolean;
  isWarning: boolean;
}

export interface BudgetData {
  id?: string;
  month: number;
  year: number;
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  percentageUsed: number;
  warningLevel: 'normal' | 'warning' | 'danger';
  warningMessage: string;
  categoryBudgets: CategoryBudget[];
}

export type GoalStatus = 'in_progress' | 'completed' | 'paused';

export interface FinancialGoal {
  _id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  description?: string;
  category?: string;
  status: GoalStatus;
  percentage: number;
  remainingAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SpendingInsight {
  id: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  title: string;
  message: string;
  category?: string;
}

export interface DashboardSummary {
  summary: {
    totalIncome: number;
    totalExpenses: number;
    currentBalance: number;
    monthlyBudget: number;
    remainingBudget: number;
    savings: number;
  };
  recentTransactions: Transaction[];
  charts: {
    incomeVsExpense: Array<{
      name: string;
      month: number;
      year: number;
      income: number;
      expense: number;
      savings: number;
    }>;
    expenseByCategory: Array<{
      name: string;
      value: number;
    }>;
    spendingTrend: Array<{
      date: string;
      amount: number;
    }>;
  };
  insights: SpendingInsight[];
}

export interface AnalyticsData {
  timeRange: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalIncome: number;
    totalExpense: number;
    savings: number;
    savingsRate: number;
    highestCategory: {
      name: string;
      amount: number;
      percentage: number;
    };
  };
  categoryBreakdown: Array<{
    name: string;
    amount: number;
    percentage: number;
  }>;
  spendingTrend: Array<{
    date: string;
    expense: number;
    income: number;
  }>;
  insights: SpendingInsight[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

