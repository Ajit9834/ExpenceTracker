import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiTarget, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/UI/StatCard';
import { TrendLineChart, CategoryDoughnutChart, IncomeVsExpenseChart } from '../components/Charts/ExpenseChart';
import { formatCurrency, formatDate, getMonthName, groupByCategory } from '../utils/formatCurrency';

export default function Dashboard() {
  const { expenses, incomes, budgets, getDashboardStats } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const stats = getDashboardStats();
  const currency = user?.currency || 'USD';

  const recentTransactions = useMemo(() => {
    const all = [
      ...expenses.map(e => ({ ...e, type: 'expense' as const, title: e.title, source: e.title })),
      ...incomes.map(i => ({ ...i, type: 'income' as const, title: i.source })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);
    return all;
  }, [expenses, incomes]);

  const monthlyTrend = useMemo(() => {
    const months: string[] = [];
    const expenseValues: number[] = [];
    const incomeValues: number[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push(getMonthName(d.getMonth()));

      const monthExpenses = expenses.filter(e => e.date.startsWith(monthStr));
      const monthIncomes = incomes.filter(inc => inc.date.startsWith(monthStr));

      expenseValues.push(Math.round(monthExpenses.reduce((s, e) => s + e.amount, 0)));
      incomeValues.push(Math.round(monthIncomes.reduce((s, i) => s + i.amount, 0)));
    }

    return { labels: months, expenseValues, incomeValues };
  }, [expenses, incomes]);

  const categoryData = useMemo(() => {
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthExpenses = expenses.filter(e => e.date.startsWith(monthStr));
    const grouped = groupByCategory(monthExpenses);
    const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1]).slice(0, 8);

    return {
      labels: sorted.map(([cat]) => cat),
      values: sorted.map(([, amount]) => Math.round(amount)),
    };
  }, [expenses]);

  const budgetAlerts = useMemo(() => {
    return budgets.filter(b => {
      const now = new Date();
      const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      if (b.month !== monthStr) return false;
      const monthExpenses = expenses.filter(e => e.category === b.category && e.date.startsWith(monthStr));
      const spent = monthExpenses.reduce((s, e) => s + e.amount, 0);
      return spent > b.amount * 0.8;
    });
  }, [budgets, expenses]);

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      Food: '🍔', Shopping: '🛍️', Rent: '🏠', Bills: '📱',
      Education: '📚', Entertainment: '🎬', Transport: '🚗',
      Travel: '✈️', Healthcare: '🏥', Others: '📦',
      Salary: '💰', Freelancing: '💻', Business: '🏢',
      Investment: '📈', Gift: '🎁',
    };
    return icons[category] || '💰';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Overview of your financial activity
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Balance"
          value={formatCurrency(stats.balance, currency)}
          icon={FiDollarSign}
          color="text-violet-600"
          bgColor="bg-violet-100 dark:bg-violet-900/30"
          change={stats.balance >= 0 ? 'Positive balance' : 'Negative balance'}
          changeType={stats.balance >= 0 ? 'positive' : 'negative'}
          delay={0}
        />
        <StatCard
          title="Total Income"
          value={formatCurrency(stats.totalIncome, currency)}
          icon={FiTrendingUp}
          color="text-emerald-600"
          bgColor="bg-emerald-100 dark:bg-emerald-900/30"
          change="All time income"
          changeType="positive"
          delay={1}
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(stats.totalExpense, currency)}
          icon={FiTrendingDown}
          color="text-red-600"
          bgColor="bg-red-100 dark:bg-red-900/30"
          change="All time expenses"
          changeType="negative"
          delay={2}
        />
        <StatCard
          title="Monthly Savings"
          value={formatCurrency(stats.savings, currency)}
          icon={FiTarget}
          color="text-blue-600"
          bgColor="bg-blue-100 dark:bg-blue-900/30"
          change={stats.savings >= 0 ? 'Saving well!' : 'Overspending'}
          changeType={stats.savings >= 0 ? 'positive' : 'negative'}
          delay={3}
        />
      </div>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl"
        >
          <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">⚠️ Budget Alerts</h3>
          <div className="space-y-2">
            {budgetAlerts.map(b => (
              <p key={b.id} className="text-sm text-amber-700 dark:text-amber-400">
                Your <strong>{b.category}</strong> spending is approaching the {formatCurrency(b.amount, currency)} budget limit.
              </p>
            ))}
          </div>
        </motion.div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Monthly Trend</h3>
          <TrendLineChart
            data={{ labels: monthlyTrend.labels, values: monthlyTrend.expenseValues }}
            title="Expenses"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Income vs Expense</h3>
          <IncomeVsExpenseChart
            incomeData={monthlyTrend.incomeValues}
            expenseData={monthlyTrend.expenseValues}
            labels={monthlyTrend.labels}
          />
        </motion.div>
      </div>

      {/* Category & Transactions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Expense Categories</h3>
          {categoryData.labels.length > 0 ? (
            <CategoryDoughnutChart data={categoryData} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-10">No expenses this month</p>
          )}
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
            <button
              onClick={() => navigate('/expenses')}
              className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1"
            >
              View All <FiArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? recentTransactions.map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg">
                  {getCategoryIcon(t.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{t.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.category} · {formatDate(t.date)}</p>
                </div>
                <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currency)}
                </span>
              </div>
            )) : (
              <p className="text-sm text-gray-500 text-center py-8">No transactions yet</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Budget Overview */}
      {budgets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Budget Overview</h3>
            <button
              onClick={() => navigate('/budget')}
              className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1"
            >
              Manage <FiArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.slice(0, 6).map(b => {
              const now = new Date();
              const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
              const monthExpenses = expenses.filter(e => e.category === b.category && e.date.startsWith(monthStr));
              const spent = monthExpenses.reduce((s, e) => s + e.amount, 0);
              const percentage = b.amount > 0 ? Math.min(Math.round((spent / b.amount) * 100), 100) : 0;
              const isOver = spent > b.amount;

              return (
                <div key={b.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{b.category}</span>
                    <span className={`text-xs font-medium ${isOver ? 'text-red-500' : percentage > 80 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {percentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isOver ? 'bg-red-500' : percentage > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatCurrency(spent, currency)} spent
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatCurrency(b.amount, currency)} limit
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
