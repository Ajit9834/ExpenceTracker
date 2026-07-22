import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiDownload } from 'react-icons/fi';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  TrendLineChart, CategoryBarChart, CategoryDoughnutChart,
  CategoryPieChart, IncomeVsExpenseChart
} from '../components/Charts/ExpenseChart';
import { formatCurrency, getMonthName, groupByCategory } from '../utils/formatCurrency';

export default function Reports() {
  const { expenses, incomes, categories } = useData();
  const { user } = useAuth();
  const currency = user?.currency || 'USD';
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const years = useMemo(() => {
    const allDates = [...expenses.map(e => e.date), ...incomes.map(i => i.date)];
    const uniqueYears = [...new Set(allDates.map(d => new Date(d).getFullYear()))];
    if (uniqueYears.length === 0) uniqueYears.push(new Date().getFullYear());
    return uniqueYears.sort((a, b) => b - a);
  }, [expenses, incomes]);

  const filteredData = useMemo(() => {
    let filteredExpenses = expenses;
    let filteredIncomes = incomes;

    if (period === 'month') {
      const monthStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
      filteredExpenses = expenses.filter(e => e.date.startsWith(monthStr));
      filteredIncomes = incomes.filter(i => i.date.startsWith(monthStr));
    } else if (period === 'year') {
      filteredExpenses = expenses.filter(e => new Date(e.date).getFullYear() === selectedYear);
      filteredIncomes = incomes.filter(i => new Date(i.date).getFullYear() === selectedYear);
    } else {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredExpenses = expenses.filter(e => new Date(e.date) >= weekAgo);
      filteredIncomes = incomes.filter(i => new Date(i.date) >= weekAgo);
    }

    return { expenses: filteredExpenses, incomes: filteredIncomes };
  }, [expenses, incomes, period, selectedMonth, selectedYear]);

  const totalExpense = filteredData.expenses.reduce((s, e) => s + e.amount, 0);
  const totalIncome = filteredData.incomes.reduce((s, i) => s + i.amount, 0);

  const categoryData = useMemo(() => {
    const grouped = groupByCategory(filteredData.expenses);
    const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
    return {
      labels: sorted.map(([cat]) => cat),
      values: sorted.map(([, amount]) => Math.round(amount)),
      colors: sorted.map(([cat]) => {
        const found = categories.find(c => c.name === cat);
        return found?.color || '#AEB6BF';
      }),
    };
  }, [filteredData.expenses, categories]);

  const incomeCategoryData = useMemo(() => {
    const grouped = groupByCategory(filteredData.incomes);
    const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
    return {
      labels: sorted.map(([cat]) => cat),
      values: sorted.map(([, amount]) => Math.round(amount)),
    };
  }, [filteredData.incomes]);

  const monthlyTrend = useMemo(() => {
    const months: string[] = [];
    const expenseValues: number[] = [];
    const incomeValues: number[] = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push(getMonthName(d.getMonth()));
      expenseValues.push(Math.round(expenses.filter(e => e.date.startsWith(monthStr)).reduce((s, e) => s + e.amount, 0)));
      incomeValues.push(Math.round(incomes.filter(inc => inc.date.startsWith(monthStr)).reduce((s, i) => s + i.amount, 0)));
    }

    return { labels: months, expenseValues, incomeValues };
  }, [expenses, incomes]);

  const topExpenses = useMemo(() => {
    return [...filteredData.expenses].sort((a, b) => b.amount - a.amount).slice(0, 5);
  }, [filteredData.expenses]);

  const paymentMethodData = useMemo(() => {
    const grouped = filteredData.expenses.reduce((acc, e) => {
      if (!acc[e.paymentMethod]) acc[e.paymentMethod] = 0;
      acc[e.paymentMethod] += e.amount;
      return acc;
    }, {} as Record<string, number>);
    const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
    return {
      labels: sorted.map(([method]) => method),
      values: sorted.map(([, amount]) => Math.round(amount)),
    };
  }, [filteredData.expenses]);

  const exportCSV = () => {
    const headers = ['Type', 'Title/Source', 'Amount', 'Category', 'Date', 'Description'];
    const expenseRows = filteredData.expenses.map(e => ['Expense', e.title, e.amount, e.category, e.date, e.description]);
    const incomeRows = filteredData.incomes.map(i => ['Income', i.source, i.amount, i.category, i.date, i.description]);
    const csv = [headers, ...expenseRows, ...incomeRows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${period}-${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Analyze your financial data</p>
        </div>
        <button onClick={exportCSV} className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-sm font-medium transition-colors self-start">
          <FiDownload className="w-4 h-4" /> Export CSV
        </button>
      </motion.div>

      {/* Period Selector */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
            {(['week', 'month', 'year'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  period === p ? 'bg-white dark:bg-gray-600 text-violet-600 shadow-sm' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          {period === 'month' && (
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>{getMonthName(i)}</option>
              ))}
            </select>
          )}
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Income</p>
          <p className="text-2xl font-bold text-emerald-500 mt-1">{formatCurrency(totalIncome, currency)}</p>
          <p className="text-xs text-gray-400 mt-1">{filteredData.incomes.length} transactions</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{formatCurrency(totalExpense, currency)}</p>
          <p className="text-xs text-gray-400 mt-1">{filteredData.expenses.length} transactions</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">Net Savings</p>
          <p className={`text-2xl font-bold mt-1 ${totalIncome - totalExpense >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {formatCurrency(totalIncome - totalExpense, currency)}
          </p>
          <p className="text-xs text-gray-400 mt-1">{totalIncome > 0 ? Math.round((totalIncome - totalExpense) / totalIncome * 100) : 0}% savings rate</p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Expense Distribution</h3>
          {categoryData.labels.length > 0 ? (
            <CategoryDoughnutChart data={categoryData} title="Expenses" />
          ) : (
            <p className="text-sm text-gray-500 text-center py-10">No data available</p>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Category Breakdown</h3>
          {categoryData.labels.length > 0 ? (
            <CategoryBarChart data={categoryData} title="Expenses" />
          ) : (
            <p className="text-sm text-gray-500 text-center py-10">No data available</p>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">12-Month Trend</h3>
          <TrendLineChart data={{ labels: monthlyTrend.labels, values: monthlyTrend.expenseValues }} title="Monthly Expenses" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Income vs Expense</h3>
          <IncomeVsExpenseChart incomeData={monthlyTrend.incomeValues} expenseData={monthlyTrend.expenseValues} labels={monthlyTrend.labels} />
        </motion.div>

        {incomeCategoryData.labels.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700"
          >
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Income Sources</h3>
            <CategoryPieChart data={incomeCategoryData} title="Income" />
          </motion.div>
        )}

        {paymentMethodData.labels.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700"
          >
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Payment Methods</h3>
            <CategoryBarChart data={paymentMethodData} title="Amount" />
          </motion.div>
        )}
      </div>

      {/* Top Expenses */}
      {topExpenses.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Top Expenses</h3>
          <div className="space-y-3">
            {topExpenses.map((expense, index) => (
              <div key={expense.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <span className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{expense.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{expense.category} · {expense.date}</p>
                </div>
                <span className="text-sm font-bold text-red-500">{formatCurrency(expense.amount, currency)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
