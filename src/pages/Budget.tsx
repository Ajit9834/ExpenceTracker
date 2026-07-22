import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { FiPlus, FiEdit2, FiTrash2, FiTarget } from 'react-icons/fi';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/UI/Modal';
import EmptyState from '../components/UI/EmptyState';
import { formatCurrency } from '../utils/formatCurrency';
import { Budget } from '../types';
import { toast } from 'react-toastify';

interface BudgetForm {
  category: string;
  amount: number;
}

export default function BudgetPage() {
  const { budgets, expenses, categories, addBudget, updateBudget, deleteBudget } = useData();
  const { user } = useAuth();
  const currency = user?.currency || 'USD';
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const expenseCategories = categories.filter(c => c.type === 'expense');
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BudgetForm>();

  const budgetData = useMemo(() => {
    return budgets.map(b => {
      const monthExpenses = expenses.filter(e => e.category === b.category && e.date.startsWith(b.month));
      const spent = monthExpenses.reduce((s, e) => s + e.amount, 0);
      const percentage = b.amount > 0 ? Math.min(Math.round((spent / b.amount) * 100), 100) : 0;
      const remaining = b.amount - spent;
      return { ...b, spent, percentage, remaining };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [budgets, expenses]);

  const currentMonthBudgets = budgetData.filter(b => b.month === currentMonth);
  const totalBudget = currentMonthBudgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = currentMonthBudgets.reduce((s, b) => s + b.spent, 0);
  const overallPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const openAddModal = () => {
    setEditingBudget(null);
    reset({ category: '', amount: 0 });
    setShowModal(true);
  };

  const openEditModal = (budget: Budget) => {
    setEditingBudget(budget);
    reset({ category: budget.category, amount: budget.amount });
    setShowModal(true);
  };

  const onSubmit = async (data: BudgetForm) => {
    try {
      if (editingBudget) {
        await updateBudget(editingBudget.id, { category: data.category, amount: data.amount });
        toast.success('Budget updated');
      } else {
        const existing = budgets.find(b => b.category === data.category && b.month === currentMonth);
        if (existing) {
          toast.error('Budget already exists for this category');
          return;
        }
        await addBudget({ category: data.category, amount: data.amount, month: currentMonth, year: now.getFullYear() });
        toast.success('Budget added');
      }
      setShowModal(false);
      reset();
    } catch {
      toast.error('Failed to save budget');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBudget(id);
      toast.success('Budget deleted');
      setDeleteConfirm(null);
    } catch {
      toast.error('Failed to delete budget');
    }
  };

  const getCategoryIcon = (cat: string) => {
    const found = categories.find(c => c.name === cat);
    return found?.icon || '📦';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getStatusText = (percentage: number) => {
    if (percentage >= 100) return 'Over Budget!';
    if (percentage >= 80) return 'Almost there';
    return 'On Track';
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budget</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your monthly spending limits</p>
        </div>
        <button onClick={openAddModal} className="px-4 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-xl flex items-center gap-2 text-sm font-medium hover:shadow-lg transition-all self-start">
          <FiPlus className="w-4 h-4" /> Set Budget
        </button>
      </motion.div>

      {/* Overall Budget Summary */}
      {totalBudget > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Monthly Overview</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              overallPercentage >= 100 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
              overallPercentage >= 80 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
              'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
            }`}>
              {getStatusText(overallPercentage)}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Budget</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalBudget, currency)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
              <p className="text-xl font-bold text-red-500">{formatCurrency(totalSpent, currency)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Remaining</p>
              <p className={`text-xl font-bold ${totalBudget - totalSpent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {formatCurrency(totalBudget - totalSpent, currency)}
              </p>
            </div>
          </div>
          <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(overallPercentage, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full ${getProgressColor(overallPercentage)}`}
            />
          </div>
          <p className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">{overallPercentage}% used</p>
        </motion.div>
      )}

      {/* Budget Cards */}
      {currentMonthBudgets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentMonthBudgets.map((budget, index) => (
            <motion.div
              key={budget.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg">
                    {getCategoryIcon(budget.category)}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{budget.category}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {budget.percentage >= 100 ? '⚠️ Exceeded' : `${formatCurrency(budget.remaining, currency)} left`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(budget)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-violet-500">
                    <FiEdit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteConfirm(budget.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500">
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className={`h-full rounded-full ${getProgressColor(budget.percentage)}`}
                />
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatCurrency(budget.spent, currency)} spent
                </span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {formatCurrency(budget.amount, currency)} limit
                </span>
              </div>
              {budget.percentage >= 80 && (
                <div className={`mt-3 p-2 rounded-lg text-xs font-medium ${
                  budget.percentage >= 100
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                    : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                }`}>
                  {budget.percentage >= 100
                    ? `Over budget by ${formatCurrency(Math.abs(budget.remaining), currency)}`
                    : `${formatCurrency(budget.remaining, currency)} remaining`
                  }
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FiTarget}
          title="No budgets set"
          description="Set monthly budgets to track your spending limits"
          action={{ label: 'Set Budget', onClick: openAddModal }}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingBudget ? 'Edit Budget' : 'Set Budget'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
            <select
              {...register('category', { required: 'Category is required' })}
              disabled={!!editingBudget}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm disabled:opacity-60"
            >
              <option value="">Select Category</option>
              {expenseCategories.map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
            </select>
            {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget Amount *</label>
            <input
              type="number"
              step="0.01"
              {...register('amount', { required: 'Amount is required', min: { value: 1, message: 'Must be at least 1' } })}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
              placeholder="0.00"
            />
            {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 text-sm font-medium">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">
              {editingBudget ? 'Update Budget' : 'Set Budget'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Budget" size="sm">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <FiTrash2 className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to delete this budget?</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="px-5 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 text-sm font-medium">Cancel</button>
            <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
