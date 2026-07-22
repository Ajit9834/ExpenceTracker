import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  FiPlus, FiSearch, FiEdit2, FiTrash2,
  FiChevronLeft, FiChevronRight, FiSliders, FiDownload
} from 'react-icons/fi';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/UI/Modal';
import EmptyState from '../components/UI/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatCurrency';
import { Expense, FilterOptions, PAYMENT_METHODS } from '../types';
import { toast } from 'react-toastify';

interface ExpenseForm {
  title: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  paymentMethod: string;
  notes: string;
  tags: string;
}

const ITEMS_PER_PAGE = 10;

export default function Expenses() {
  const { expenses, categories, addExpense, updateExpense, deleteExpense, getFilteredExpenses } = useData();
  const { user } = useAuth();
  const currency = user?.currency || 'USD';
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const expenseCategories = categories.filter(c => c.type === 'expense');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ExpenseForm>();

  const filteredExpenses = useMemo(() => {
    return getFilteredExpenses({ ...filters, search });
  }, [expenses, filters, search, getFilteredExpenses]);

  const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE);
  const paginatedExpenses = filteredExpenses.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const getCategoryIcon = (cat: string) => {
    const found = categories.find(c => c.name === cat);
    return found?.icon || '📦';
  };

  const openAddModal = () => {
    setEditingExpense(null);
    reset({ title: '', amount: 0, category: '', date: new Date().toISOString().split('T')[0], description: '', paymentMethod: 'Cash', notes: '', tags: '' });
    setShowModal(true);
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    reset({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      description: expense.description,
      paymentMethod: expense.paymentMethod,
      notes: expense.notes,
      tags: expense.tags.join(', '),
    });
    setShowModal(true);
  };

  const onSubmit = async (data: ExpenseForm) => {
    try {
      const expenseData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        receiptURL: '',
      };

      if (editingExpense) {
        await updateExpense(editingExpense.id, expenseData);
        toast.success('Expense updated successfully');
      } else {
        await addExpense(expenseData);
        toast.success('Expense added successfully');
      }
      setShowModal(false);
      reset();
    } catch {
      toast.error('Failed to save expense');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id);
      toast.success('Expense deleted');
      setDeleteConfirm(null);
    } catch {
      toast.error('Failed to delete expense');
    }
  };

  const clearFilters = () => {
    setFilters({});
    setSearch('');
    setPage(1);
  };

  const exportCSV = () => {
    const headers = ['Title', 'Amount', 'Category', 'Date', 'Payment Method', 'Description'];
    const rows = filteredExpenses.map(e => [e.title, e.amount, e.category, e.date, e.paymentMethod, e.description]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported to CSV');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{filteredExpenses.length} total expenses</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-sm font-medium transition-colors">
            <FiDownload className="w-4 h-4" /> Export
          </button>
          <button onClick={openAddModal} className="px-4 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-xl flex items-center gap-2 text-sm font-medium hover:shadow-lg transition-all">
            <FiPlus className="w-4 h-4" /> Add Expense
          </button>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors ${
              showFilters ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 border border-violet-200 dark:border-violet-800' : 'border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <FiSliders className="w-4 h-4" /> Filters
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <select
                  value={filters.category || ''}
                  onChange={e => { setFilters({ ...filters, category: e.target.value || undefined }); setPage(1); }}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">All Categories</option>
                  {expenseCategories.map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
                </select>
                <select
                  value={filters.paymentMethod || ''}
                  onChange={e => { setFilters({ ...filters, paymentMethod: e.target.value || undefined }); setPage(1); }}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">All Payment Methods</option>
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={e => { setFilters({ ...filters, dateFrom: e.target.value || undefined }); setPage(1); }}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="From date"
                />
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={e => { setFilters({ ...filters, dateTo: e.target.value || undefined }); setPage(1); }}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="To date"
                />
              </div>
              <div className="flex justify-end mt-3">
                <button onClick={clearFilters} className="text-sm text-violet-600 hover:text-violet-700 font-medium">
                  Clear All Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Expenses List */}
      <div className="space-y-3">
        {paginatedExpenses.length > 0 ? (
          paginatedExpenses.map((expense, index) => (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl flex-shrink-0">
                  {getCategoryIcon(expense.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{expense.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {expense.category} · {expense.paymentMethod} · {formatDate(expense.date)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-red-500">-{formatCurrency(expense.amount, currency)}</p>
                    </div>
                  </div>
                  {expense.description && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">{expense.description}</p>
                  )}
                  {expense.tags.length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {expense.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => openEditModal(expense)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-violet-500 transition-colors"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(expense.id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <EmptyState
            icon={FiSearch}
            title="No expenses found"
            description={search || Object.keys(filters).length > 0 ? "Try adjusting your search or filters" : "Start by adding your first expense"}
            action={!search && Object.keys(filters).length === 0 ? { label: 'Add Expense', onClick: openAddModal } : undefined}
          />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {(page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(page * ITEMS_PER_PAGE, filteredExpenses.length)} of {filteredExpenses.length}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const pageNum = start + i;
              if (pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    page === pageNum
                      ? 'bg-violet-500 text-white'
                      : 'border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingExpense ? 'Edit Expense' : 'Add Expense'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
              <input
                {...register('title', { required: 'Title is required' })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                placeholder="e.g. Grocery Shopping"
              />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount *</label>
              <input
                type="number"
                step="0.01"
                {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be positive' } })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                placeholder="0.00"
              />
              {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
              <select
                {...register('category', { required: 'Category is required' })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="">Select Category</option>
                {expenseCategories.map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
              </select>
              {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
              <input
                type="date"
                {...register('date', { required: 'Date is required' })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
              <select
                {...register('paymentMethod')}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma separated)</label>
              <input
                {...register('tags')}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                placeholder="food, weekly, essential"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
              placeholder="Add a description..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea
              {...register('notes')}
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
              placeholder="Additional notes..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">
              {editingExpense ? 'Update Expense' : 'Add Expense'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Expense" size="sm">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <FiTrash2 className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to delete this expense? This action cannot be undone.</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="px-5 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 text-sm font-medium">
              Cancel
            </button>
            <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600">
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
