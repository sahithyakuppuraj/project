import { Types } from 'mongoose';
import { Transaction } from '../models/Transaction';
import { Budget } from '../models/Budget';

export interface SpendingInsight {
  id: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  title: string;
  message: string;
  category?: string;
}

export const generateSmartInsights = async (userId: Types.ObjectId): Promise<SpendingInsight[]> => {
  const insights: SpendingInsight[] = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12

  // Date ranges
  const startOfCurrentMonth = new Date(currentYear, currentMonth - 1, 1);
  const endOfCurrentMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

  const prevMonthDate = new Date(currentYear, currentMonth - 2, 1);
  const startOfPrevMonth = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), 1);
  const endOfPrevMonth = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1, 0, 23, 59, 59, 999);

  // Fetch transactions for both months
  const [currentMonthTransactions, prevMonthTransactions, budget] = await Promise.all([
    Transaction.find({
      userId,
      date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
    }),
    Transaction.find({
      userId,
      date: { $gte: startOfPrevMonth, $lte: endOfPrevMonth },
    }),
    Budget.findOne({ userId, month: currentMonth, year: currentYear }),
  ]);

  if (currentMonthTransactions.length === 0 && prevMonthTransactions.length === 0) {
    insights.push({
      id: 'welcome_insight',
      type: 'info',
      title: 'Welcome to Finance Tracker!',
      message: 'Add your income and expenses to unlock intelligent spending trends and budget insights.',
    });
    return insights;
  }

  // Current month aggregates
  let currentIncome = 0;
  let currentExpense = 0;
  const currentCategoryMap: Record<string, number> = {};

  currentMonthTransactions.forEach((t) => {
    if (t.type === 'income') {
      currentIncome += t.amount;
    } else {
      currentExpense += t.amount;
      currentCategoryMap[t.category] = (currentCategoryMap[t.category] || 0) + t.amount;
    }
  });

  // Previous month aggregates
  let prevIncome = 0;
  let prevExpense = 0;
  const prevCategoryMap: Record<string, number> = {};

  prevMonthTransactions.forEach((t) => {
    if (t.type === 'income') {
      prevIncome += t.amount;
    } else {
      prevExpense += t.amount;
      prevCategoryMap[t.category] = (prevCategoryMap[t.category] || 0) + t.amount;
    }
  });

  // Rule 1: Budget Alert
  if (budget && budget.totalBudget > 0) {
    const percentUsed = Math.round((currentExpense / budget.totalBudget) * 100);
    if (percentUsed >= 100) {
      insights.push({
        id: 'budget_exceeded',
        type: 'alert',
        title: 'Budget Exceeded',
        message: `You have exceeded your monthly budget of ₹${budget.totalBudget.toLocaleString('en-IN')} by ₹${(currentExpense - budget.totalBudget).toLocaleString('en-IN')}.`,
      });
    } else if (percentUsed >= 80) {
      insights.push({
        id: 'budget_warning',
        type: 'warning',
        title: 'Budget Alert',
        message: `You have used ${percentUsed}% of your ₹${budget.totalBudget.toLocaleString('en-IN')} monthly budget.`,
      });
    }
  }

  // Rule 2: Highest Expense Category
  const sortedCategories = Object.entries(currentCategoryMap).sort((a, b) => b[1] - a[1]);
  if (sortedCategories.length > 0) {
    const [topCategory, topAmount] = sortedCategories[0];
    const percentageOfExpenses = currentExpense > 0 ? Math.round((topAmount / currentExpense) * 100) : 0;
    insights.push({
      id: 'highest_spending_category',
      type: 'info',
      title: 'Top Expense Category',
      message: `${topCategory} is your highest expense category this month at ₹${topAmount.toLocaleString('en-IN')} (${percentageOfExpenses}% of total spending).`,
      category: topCategory,
    });
  }

  // Rule 3: Category Increase vs Last Month
  for (const [category, currentCatAmount] of Object.entries(currentCategoryMap)) {
    const prevCatAmount = prevCategoryMap[category] || 0;
    if (prevCatAmount > 0 && currentCatAmount > prevCatAmount) {
      const diff = currentCatAmount - prevCatAmount;
      const pctIncrease = Math.round((diff / prevCatAmount) * 100);
      if (pctIncrease >= 20 && diff >= 500) {
        insights.push({
          id: `category_increase_${category}`,
          type: 'warning',
          title: `${category} Spending Increased`,
          message: `Your ${category.toLowerCase()} expenses increased by ${pctIncrease}% (₹${diff.toLocaleString('en-IN')}) compared with last month.`,
          category,
        });
        break; // Show top category increase
      }
    }
  }

  // Rule 4: Savings Comparison vs Previous Month
  const currentSavings = currentIncome - currentExpense;
  const prevSavings = prevIncome - prevExpense;

  if (prevMonthTransactions.length > 0 && currentIncome > 0) {
    if (currentSavings > prevSavings && currentSavings > 0) {
      const extraSaved = currentSavings - Math.max(0, prevSavings);
      insights.push({
        id: 'savings_growth',
        type: 'success',
        title: 'Great Savings Progress!',
        message: `You saved more this month compared with last month (+₹${extraSaved.toLocaleString('en-IN')}). Keep up the great discipline!`,
      });
    } else if (currentExpense > currentIncome && currentIncome > 0) {
      insights.push({
        id: 'negative_savings',
        type: 'alert',
        title: 'Expenses Exceeding Income',
        message: `Your expenses (₹${currentExpense.toLocaleString('en-IN')}) exceed your income (₹${currentIncome.toLocaleString('en-IN')}) this month by ₹${(currentExpense - currentIncome).toLocaleString('en-IN')}.`,
      });
    }
  }

  // Rule 5: Healthy savings rate (if savings > 30% of income)
  if (currentIncome > 0) {
    const savingsRate = Math.round((currentSavings / currentIncome) * 100);
    if (savingsRate >= 30) {
      insights.push({
        id: 'healthy_savings_rate',
        type: 'success',
        title: 'Healthy Savings Rate',
        message: `Your current savings rate is ${savingsRate}%, which meets recommended healthy financial benchmarks!`,
      });
    }
  }

  return insights;
};

