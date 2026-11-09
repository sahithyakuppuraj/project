import { Response } from 'express';
import { Transaction } from '../models/Transaction';
import { Budget } from '../models/Budget';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { generateSmartInsights } from '../services/insightsService';

export const getDashboardSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Date range for current month
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    // 1. Current month transactions and all-time totals
    const [allTransactions, currentMonthTransactions, currentBudget, recentTransactions] =
      await Promise.all([
        Transaction.find({ userId }),
        Transaction.find({
          userId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        }),
        Budget.findOne({ userId, month: currentMonth, year: currentYear }),
        Transaction.find({ userId }).sort({ date: -1, createdAt: -1 }).limit(5),
      ]);

    // All-time balance
    let allTimeIncome = 0;
    let allTimeExpense = 0;
    allTransactions.forEach((t) => {
      if (t.type === 'income') allTimeIncome += t.amount;
      else allTimeExpense += t.amount;
    });
    const currentBalance = allTimeIncome - allTimeExpense;

    // Current month totals
    let monthIncome = 0;
    let monthExpense = 0;
    const categorySpending: Record<string, number> = {};

    currentMonthTransactions.forEach((t) => {
      if (t.type === 'income') {
        monthIncome += t.amount;
      } else {
        monthExpense += t.amount;
        categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
      }
    });

    const totalBudget = currentBudget ? currentBudget.totalBudget : 0;
    const remainingBudget = totalBudget > 0 ? totalBudget - monthExpense : 0;

    // 2. Monthly comparison chart data (last 6 months)
    const monthlyComparison: Array<{
      name: string;
      month: number;
      year: number;
      income: number;
      expense: number;
      savings: number;
    }> = [];

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const sDate = new Date(y, m - 1, 1);
      const eDate = new Date(y, m, 0, 23, 59, 59, 999);

      const mTrans = allTransactions.filter((t) => {
        const tDate = new Date(t.date);
        return tDate >= sDate && tDate <= eDate;
      });

      let inc = 0;
      let exp = 0;
      mTrans.forEach((t) => {
        if (t.type === 'income') inc += t.amount;
        else exp += t.amount;
      });

      monthlyComparison.push({
        name: `${monthNames[m - 1]} ${y % 100}`,
        month: m,
        year: y,
        income: inc,
        expense: exp,
        savings: inc - exp,
      });
    }

    // 3. Category chart data for current month
    const categoryChartData = Object.entries(categorySpending).map(([name, value]) => ({
      name,
      value,
    }));

    // 4. Daily spending trend for current month (last 30 days)
    const trendMap: Record<string, number> = {};
    for (let day = 1; day <= endOfMonth.getDate(); day++) {
      const dayKey = `${monthNames[currentMonth - 1]} ${day}`;
      trendMap[dayKey] = 0;
    }

    currentMonthTransactions.forEach((t) => {
      if (t.type === 'expense') {
        const tDate = new Date(t.date);
        const dayKey = `${monthNames[tDate.getMonth()]} ${tDate.getDate()}`;
        trendMap[dayKey] = (trendMap[dayKey] || 0) + t.amount;
      }
    });

    const spendingTrend = Object.entries(trendMap).map(([date, amount]) => ({
      date,
      amount,
    }));

    // 5. Smart insights
    const insights = await generateSmartInsights(userId);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalIncome: monthIncome,
          totalExpenses: monthExpense,
          currentBalance,
          monthlyBudget: totalBudget,
          remainingBudget,
          savings: monthIncome - monthExpense,
        },
        recentTransactions,
        charts: {
          incomeVsExpense: monthlyComparison,
          expenseByCategory: categoryChartData,
          spendingTrend,
        },
        insights,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error loading dashboard summary',
    });
  }
};

export const getAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { timeRange = 'this_month', startDate, endDate } = req.query;

    const now = new Date();
    let queryStartDate: Date;
    let queryEndDate: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (timeRange === 'this_month') {
      queryStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
      queryEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (timeRange === 'last_month') {
      queryStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      queryEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    } else if (timeRange === 'last_3_months') {
      queryStartDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      queryEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (timeRange === 'custom' && startDate && endDate) {
      queryStartDate = new Date(startDate as string);
      queryEndDate = new Date(endDate as string);
      queryEndDate.setHours(23, 59, 59, 999);
    } else {
      queryStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
      queryEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const transactions = await Transaction.find({
      userId,
      date: { $gte: queryStartDate, $lte: queryEndDate },
    }).sort({ date: 1 });

    let totalIncome = 0;
    let totalExpense = 0;
    const categorySpending: Record<string, number> = {};
    const categoryIncome: Record<string, number> = {};

    transactions.forEach((t) => {
      if (t.type === 'income') {
        totalIncome += t.amount;
        categoryIncome[t.category] = (categoryIncome[t.category] || 0) + t.amount;
      } else {
        totalExpense += t.amount;
        categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
      }
    });

    const savings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;

    // Highest spending category
    let highestCategory = { name: 'None', amount: 0, percentage: 0 };
    const sortedCategories = Object.entries(categorySpending).sort((a, b) => b[1] - a[1]);
    if (sortedCategories.length > 0) {
      const [name, amount] = sortedCategories[0];
      highestCategory = {
        name,
        amount,
        percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
      };
    }

    // Category breakdown list
    const categoryBreakdown = sortedCategories.map(([name, amount]) => ({
      name,
      amount,
      percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
    }));

    // Daily spending trend in the selected range
    const trendMap: Record<string, { date: string; expense: number; income: number }> = {};
    transactions.forEach((t) => {
      const d = new Date(t.date);
      const dateKey = d.toISOString().split('T')[0];
      if (!trendMap[dateKey]) {
        trendMap[dateKey] = { date: dateKey, expense: 0, income: 0 };
      }
      if (t.type === 'expense') trendMap[dateKey].expense += t.amount;
      else trendMap[dateKey].income += t.amount;
    });

    const spendingTrend = Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date));

    // Smart insights
    const insights = await generateSmartInsights(userId);

    res.status(200).json({
      success: true,
      data: {
        timeRange,
        dateRange: {
          startDate: queryStartDate.toISOString(),
          endDate: queryEndDate.toISOString(),
        },
        summary: {
          totalIncome,
          totalExpense,
          savings,
          savingsRate,
          highestCategory,
        },
        categoryBreakdown,
        spendingTrend,
        insights,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error loading analytics',
    });
  }
};

