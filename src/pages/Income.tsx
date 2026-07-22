import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight, FiTrendingUp } from 'react-icons/fi';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/UI/Modal';
import EmptyState from '../components/UI/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatCurrency';
import { Income } from '../types';
import { toast } from 'react-toastify';

interface IncomeForm {
  source: string;
  amount: number;
  category: string;
  date: string;
  description: string;
}

const ITEMS_PER_PAGE = 10;

export default function IncomePage() {
  const { incomes, categories, addIncome, updateIncome, deleteIncome, getFilteredIncomes } = useData();
  const { user } = useAuth();
  const currency = user?.currency || 'USD';
  const [showModal, setShowModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const incomeCategories = categories.filter(c => c.type === 'income');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<IncomeForm>();

  const filteredIncomes = useMemo(() => {
    return getFilteredIncomes({ search });
  }, [incomes, search, getFilteredIncomes]);

  const totalPages = Math.ceil(filteredIncomes.length / ITEMS_PER_PAGE);
  const paginatedIncomes = filteredIncomes.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalIncome = filteredIncomes.reduce((s, i) => s + i.amount, 0);

  const getCategoryIcon = (cat: string) => {
    const found = categories.find(c => c.name === cat);
    return found?.icon || '💰';
  };

  const openAddModal = () => {
    setEditingIncome(null);
    reset({ source: '', amount: 0, category: '', date: new Date().toISOString().split('T')[0], description: '' });
    setShowModal(true);
  };

  const openEditModal = (income: Income) => {
    setEditingIncome(income);
    reset({
      source: income.source,
      amount: income.amount,
      category: income.category,
      date: income.date,
      description: income.description,
    });
    setShowModal(true);
  };

  const onSubmit = async (data: IncomeForm) => {
    try {
      if (editingIncome) {
        await updateIncome(editingIncome.id, data);
        toast.success('Income updated');
      } else {
        await addIncome(data);
        toast.success('Income added');
      }
      setShowModal(false);
      reset();
    } catch {
      toast.error('Failed to save income');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteIncome(id);
      toast.success('Income deleted');
      setDeleteConfirm(null);
    } catch {
      toast.error('Failed to delete income');
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Income</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Total: <span className="text-emerald-500 font-semibold">{formatCurrency(totalIncome, currency)}</span> · {filteredIncomes.length} entries
          </p>
        </div>
        <button onClick={openAddModal} className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl flex items-center gap-2 text-sm font-medium hover:shadow-lg transition-all self-start">
          <FiPlus className="w-4 h-4" /> Add Income
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
        <div className="relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search income..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
          />
        </div>
      </motion.div>

      <div className="space-y-3">
        {paginatedIncomes.length > 0 ? (
          paginatedIncomes.map((income, index) => (
            <motion.div
              key={income.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-xl flex-shrink-0">
                  {getCategoryIcon(income.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{income.source}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {income.category} · {formatDate(income.date)}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-emerald-500 flex-shrink-0">+{formatCurrency(income.amount, currency)}</p>
                  </div>
                  {income.description && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">{income.description}</p>}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => openEditModal(income)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-violet-500 transition-colors">
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteConfirm(income.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <EmptyState
            icon={FiTrendingUp}
            title="No income found"
            description={search ? "Try adjusting your search" : "Start by adding your first income"}
            action={!search ? { label: 'Add Income', onClick: openAddModal } : undefined}
          />
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {(page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(page * ITEMS_PER_PAGE, filteredIncomes.length)} of {filteredIncomes.length}
          </p>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-50">
              <FiChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const pageNum = start + i;
              if (pageNum > totalPages) return null;
              return (
                <button key={pageNum} onClick={() => setPage(pageNum)} className={`w-9 h-9 rounded-lg text-sm font-medium ${page === pageNum ? 'bg-violet-500 text-white' : 'border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}>
                  {pageNum}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-50">
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingIncome ? 'Edit Income' : 'Add Income'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source *</label>
            <input
              {...register('source', { required: 'Source is required' })}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
              placeholder="e.g. Monthly Salary"
            />
            {errors.source && <p className="mt-1 text-xs text-red-500">{errors.source.message}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                {incomeCategories.map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
              </select>
              {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
            </div>
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
              placeholder="Add a description..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 text-sm font-medium">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">
              {editingIncome ? 'Update Income' : 'Add Income'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Income" size="sm">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <FiTrash2 className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to delete this income?</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="px-5 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 text-sm font-medium">Cancel</button>
            <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
