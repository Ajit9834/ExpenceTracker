import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  FiMoon, FiSun, FiDollarSign, FiShield,
  FiPlus, FiTrash2, FiTag
} from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Modal from '../components/UI/Modal';
import { CURRENCIES } from '../types';
import { toast } from 'react-toastify';

interface CategoryForm {
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
}

export default function Settings() {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, updateUserProfile } = useAuth();
  const { categories, addCategory, deleteCategory } = useData();
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryForm>();

  const handleCurrencyChange = async (currency: string) => {
    try {
      await updateUserProfile({ currency });
      toast.success('Currency updated');
    } catch {
      toast.error('Failed to update currency');
    }
  };

  const onCategorySubmit = async (data: CategoryForm) => {
    try {
      await addCategory({
        name: data.name,
        type: data.type,
        icon: data.icon || '📦',
        color: data.color || '#AEB6BF',
        isDefault: false,
      });
      toast.success('Category added');
      setShowCategoryModal(false);
      reset();
    } catch {
      toast.error('Failed to add category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      toast.success('Category deleted');
    } catch {
      toast.error('Failed to delete category');
    }
  };

  const expenseCategories = categories.filter(c => c.type === 'expense');
  const incomeCategories = categories.filter(c => c.type === 'income');

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Customize your experience</p>
      </motion.div>

      {/* Appearance */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
      >
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          {darkMode ? <FiMoon className="w-5 h-5" /> : <FiSun className="w-5 h-5" />} Appearance
        </h3>
        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Switch between light and dark themes</p>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative w-12 h-7 rounded-full transition-colors ${darkMode ? 'bg-violet-500' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </motion.div>

      {/* Currency */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
      >
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FiDollarSign className="w-5 h-5" /> Currency
        </h3>
        <select
          value={user?.currency || 'USD'}
          onChange={(e) => handleCurrencyChange(e.target.value)}
          className="w-full px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        >
          {CURRENCIES.map(c => (
            <option key={c.code} value={c.code}>{c.symbol} {c.code} - {c.name}</option>
          ))}
        </select>
      </motion.div>

      {/* Categories */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FiTag className="w-5 h-5" /> Categories
          </h3>
          <button
            onClick={() => { reset({ name: '', type: 'expense', icon: '📦', color: '#AEB6BF' }); setShowCategoryModal(true); }}
            className="px-3 py-2 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl text-sm font-medium flex items-center gap-1 hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors"
          >
            <FiPlus className="w-4 h-4" /> Add
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Expense Categories</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {expenseCategories.map(cat => (
                <div key={cat.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 group">
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">{cat.name}</span>
                  {!cat.isDefault && (
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-all"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Income Categories</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {incomeCategories.map(cat => (
                <div key={cat.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 group">
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">{cat.name}</span>
                  {!cat.isDefault && (
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-all"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* App Info */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
      >
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FiShield className="w-5 h-5" /> About
        </h3>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>App Name</span>
            <span className="font-medium text-gray-900 dark:text-white">ExpenseTracker</span>
          </div>
          <div className="flex justify-between">
            <span>Version</span>
            <span className="font-medium text-gray-900 dark:text-white">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>Storage</span>
            <span className="font-medium text-gray-900 dark:text-white">Local Storage</span>
          </div>
        </div>
      </motion.div>

      {/* Add Category Modal */}
      <Modal isOpen={showCategoryModal} onClose={() => setShowCategoryModal(false)} title="Add Category">
        <form onSubmit={handleSubmit(onCategorySubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
            <input
              {...register('name', { required: 'Name is required' })}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
              placeholder="Category name"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
              <select
                {...register('type')}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon (emoji)</label>
              <input
                {...register('icon')}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                placeholder="📦"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
            <input
              type="color"
              {...register('color')}
              className="w-full h-10 rounded-xl border border-gray-200 dark:border-gray-600 cursor-pointer"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowCategoryModal(false)} className="px-5 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 text-sm font-medium">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">Add Category</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
