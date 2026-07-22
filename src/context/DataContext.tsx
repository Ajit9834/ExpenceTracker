import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Expense, Income, Budget, Category, FilterOptions, DashboardStats } from '../types';
import { useAuth } from './AuthContext';
import { generateId } from '../utils/formatCurrency';
import { isDemoMode, db } from '../firebase/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  getDocs,
  Timestamp,
  setDoc,
} from 'firebase/firestore';

interface DataContextType {
  expenses: Expense[];
  incomes: Income[];
  budgets: Budget[];
  categories: Category[];
  loading: boolean;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateExpense: (id: string, data: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addIncome: (income: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateIncome: (id: string, data: Partial<Income>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  addBudget: (budget: Omit<Budget, 'id' | 'spent'>) => Promise<void>;
  updateBudget: (id: string, data: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getFilteredExpenses: (filters: FilterOptions) => Expense[];
  getFilteredIncomes: (filters: FilterOptions) => Income[];
  getDashboardStats: (month?: number, year?: number) => DashboardStats;
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Food', type: 'expense', icon: '🍔', color: '#FF6B6B', isDefault: true },
  { id: 'cat-2', name: 'Shopping', type: 'expense', icon: '🛍️', color: '#4ECDC4', isDefault: true },
  { id: 'cat-3', name: 'Rent', type: 'expense', icon: '🏠', color: '#45B7D1', isDefault: true },
  { id: 'cat-4', name: 'Bills', type: 'expense', icon: '📱', color: '#96CEB4', isDefault: true },
  { id: 'cat-5', name: 'Education', type: 'expense', icon: '📚', color: '#FFEAA7', isDefault: true },
  { id: 'cat-6', name: 'Entertainment', type: 'expense', icon: '🎬', color: '#DDA0DD', isDefault: true },
  { id: 'cat-7', name: 'Transport', type: 'expense', icon: '🚗', color: '#98D8C8', isDefault: true },
  { id: 'cat-8', name: 'Travel', type: 'expense', icon: '✈️', color: '#F7DC6F', isDefault: true },
  { id: 'cat-9', name: 'Healthcare', type: 'expense', icon: '🏥', color: '#82E0AA', isDefault: true },
  { id: 'cat-10', name: 'Others', type: 'expense', icon: '📦', color: '#AEB6BF', isDefault: true },
  { id: 'cat-11', name: 'Salary', type: 'income', icon: '💰', color: '#2ECC71', isDefault: true },
  { id: 'cat-12', name: 'Freelancing', type: 'income', icon: '💻', color: '#3498DB', isDefault: true },
  { id: 'cat-13', name: 'Business', type: 'income', icon: '🏢', color: '#9B59B6', isDefault: true },
  { id: 'cat-14', name: 'Investment', type: 'income', icon: '📈', color: '#E67E22', isDefault: true },
  { id: 'cat-15', name: 'Gift', type: 'income', icon: '🎁', color: '#E74C3C', isDefault: true },
  { id: 'cat-16', name: 'Others', type: 'income', icon: '💎', color: '#1ABC9C', isDefault: true },
];

const generateSampleData = () => {
  const now = new Date();
  const expenses: Expense[] = [];
  const incomes: Income[] = [];
  const categories = ['Food', 'Shopping', 'Rent', 'Bills', 'Entertainment', 'Transport', 'Healthcare', 'Education'];
  const paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Bank Transfer'];
  const expenseTitles: Record<string, string[]> = {
    Food: ['Grocery Shopping', 'Restaurant Dinner', 'Coffee Shop', 'Lunch Takeout', 'Snacks'],
    Shopping: ['Amazon Order', 'Clothing Store', 'Electronics', 'Home Decor', 'Shoes'],
    Rent: ['Monthly Rent', 'Maintenance Fee'],
    Bills: ['Electricity Bill', 'Phone Bill', 'Internet Bill', 'Water Bill', 'Gas Bill'],
    Entertainment: ['Movie Tickets', 'Netflix Subscription', 'Concert Tickets', 'Gaming', 'Books'],
    Transport: ['Uber Ride', 'Gas Station', 'Metro Pass', 'Parking Fee', 'Car Service'],
    Healthcare: ['Doctor Visit', 'Pharmacy', 'Gym Membership', 'Health Insurance'],
    Education: ['Online Course', 'Books', 'Workshop Fee'],
  };

  for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const numExpenses = 8 + Math.floor(Math.random() * 10);
    
    for (let i = 0; i < numExpenses; i++) {
      const cat = categories[Math.floor(Math.random() * categories.length)];
      const titles = expenseTitles[cat] || ['Expense'];
      const day = 1 + Math.floor(Math.random() * 28);
      expenses.push({
        id: `exp-${monthOffset}-${i}`,
        title: titles[Math.floor(Math.random() * titles.length)],
        amount: Math.round((10 + Math.random() * 500) * 100) / 100,
        category: cat,
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), day).toISOString().split('T')[0],
        description: `Sample ${cat.toLowerCase()} expense`,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        notes: '',
        receiptURL: '',
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    incomes.push({
      id: `inc-${monthOffset}-0`,
      source: 'Monthly Salary',
      amount: 5000 + Math.floor(Math.random() * 2000),
      category: 'Salary',
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).toISOString().split('T')[0],
      description: 'Monthly salary deposit',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (Math.random() > 0.5) {
      incomes.push({
        id: `inc-${monthOffset}-1`,
        source: 'Freelance Project',
        amount: 500 + Math.floor(Math.random() * 2000),
        category: 'Freelancing',
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 15).toISOString().split('T')[0],
        description: 'Freelance work payment',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  const budgets: Budget[] = categories.slice(0, 6).map((cat, i) => ({
    id: `budget-${i}`,
    category: cat,
    amount: [800, 500, 1500, 300, 200, 400][i],
    month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    year: now.getFullYear(),
    spent: expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0),
  }));

  return { expenses, incomes, budgets, categories: DEFAULT_EXPENSE_CATEGORIES };
};

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_EXPENSE_CATEGORIES);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    if (!user) {
      setExpenses([]);
      setIncomes([]);
      setBudgets([]);
      setCategories(DEFAULT_EXPENSE_CATEGORIES);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Use localStorage for demo mode
    if (isDemoMode) {
      try {
        const storedExpenses = localStorage.getItem(`expenses_${user.uid}`);
        const storedIncomes = localStorage.getItem(`income_${user.uid}`);
        const storedBudgets = localStorage.getItem(`budgets_${user.uid}`);
        const storedCategories = localStorage.getItem(`categories_${user.uid}`);

        if (storedExpenses) {
          setExpenses(JSON.parse(storedExpenses));
        } else {
          const sample = generateSampleData();
          setExpenses(sample.expenses);
          localStorage.setItem(`expenses_${user.uid}`, JSON.stringify(sample.expenses));
        }

        if (storedIncomes) {
          setIncomes(JSON.parse(storedIncomes));
        } else {
          const sample = generateSampleData();
          setIncomes(sample.incomes);
          localStorage.setItem(`income_${user.uid}`, JSON.stringify(sample.incomes));
        }

        if (storedBudgets) {
          setBudgets(JSON.parse(storedBudgets));
        } else {
          const sample = generateSampleData();
          setBudgets(sample.budgets);
          localStorage.setItem(`budgets_${user.uid}`, JSON.stringify(sample.budgets));
        }

        if (storedCategories) {
          setCategories(JSON.parse(storedCategories));
        } else {
          setCategories(DEFAULT_EXPENSE_CATEGORIES);
          localStorage.setItem(`categories_${user.uid}`, JSON.stringify(DEFAULT_EXPENSE_CATEGORIES));
        }
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Use Firebase Firestore for real mode
    try {
      const unsubscribers: (() => void)[] = [];

      // Listen to expenses
      const expensesQuery = query(
        collection(db, 'expenses'),
        where('userId', '==', user.uid)
      );
      const unsubExpenses = onSnapshot(expensesQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Expense[];
        setExpenses(data.sort((a, b) => b.date.localeCompare(a.date)));
      }, (error) => {
        console.error('Error loading expenses:', error);
      });
      unsubscribers.push(unsubExpenses);

      // Listen to incomes
      const incomesQuery = query(
        collection(db, 'incomes'),
        where('userId', '==', user.uid)
      );
      const unsubIncomes = onSnapshot(incomesQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Income[];
        setIncomes(data.sort((a, b) => b.date.localeCompare(a.date)));
      }, (error) => {
        console.error('Error loading incomes:', error);
      });
      unsubscribers.push(unsubIncomes);

      // Listen to budgets
      const budgetsQuery = query(
        collection(db, 'budgets'),
        where('userId', '==', user.uid)
      );
      const unsubBudgets = onSnapshot(budgetsQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Budget[];
        setBudgets(data);
      }, (error) => {
        console.error('Error loading budgets:', error);
      });
      unsubscribers.push(unsubBudgets);

      // Listen to categories
      const categoriesQuery = query(
        collection(db, 'categories'),
        where('userId', '==', user.uid)
      );
      const unsubCategories = onSnapshot(categoriesQuery, async (snapshot) => {
        if (snapshot.empty) {
          // Initialize with default categories
          const batch = DEFAULT_EXPENSE_CATEGORIES.map(cat => 
            setDoc(doc(db, 'categories', cat.id), {
              ...cat,
              userId: user.uid,
            })
          );
          await Promise.all(batch);
          setCategories(DEFAULT_EXPENSE_CATEGORIES);
        } else {
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Category[];
          setCategories(data);
        }
      }, (error) => {
        console.error('Error loading categories:', error);
        setCategories(DEFAULT_EXPENSE_CATEGORIES);
      });
      unsubscribers.push(unsubCategories);

      setLoading(false);

      // Cleanup function
      return () => {
        unsubscribers.forEach(unsub => unsub());
      };
    } catch (error) {
      console.error('Error setting up Firebase listeners:', error);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    const now = new Date().toISOString();
    const newExpense = { 
      ...expense, 
      userId: user.uid,
      createdAt: now, 
      updatedAt: now 
    };

    if (isDemoMode) {
      const expenseWithId: Expense = { ...newExpense, id: generateId() };
      const updated = [expenseWithId, ...expenses];
      setExpenses(updated);
      localStorage.setItem(`expenses_${user.uid}`, JSON.stringify(updated));
    } else {
      await addDoc(collection(db, 'expenses'), newExpense);
    }
  };

  const updateExpense = async (id: string, data: Partial<Expense>) => {
    if (!user) return;

    const updatedData = { ...data, updatedAt: new Date().toISOString() };

    if (isDemoMode) {
      const updated = expenses.map(e => e.id === id ? { ...e, ...updatedData } : e);
      setExpenses(updated);
      localStorage.setItem(`expenses_${user.uid}`, JSON.stringify(updated));
    } else {
      await updateDoc(doc(db, 'expenses', id), updatedData);
    }
  };

  const deleteExpense = async (id: string) => {
    if (!user) return;

    if (isDemoMode) {
      const updated = expenses.filter(e => e.id !== id);
      setExpenses(updated);
      localStorage.setItem(`expenses_${user.uid}`, JSON.stringify(updated));
    } else {
      await deleteDoc(doc(db, 'expenses', id));
    }
  };

  const addIncome = async (income: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    const now = new Date().toISOString();
    const newIncome = { 
      ...income, 
      userId: user.uid,
      createdAt: now, 
      updatedAt: now 
    };

    if (isDemoMode) {
      const incomeWithId: Income = { ...newIncome, id: generateId() };
      const updated = [incomeWithId, ...incomes];
      setIncomes(updated);
      localStorage.setItem(`income_${user.uid}`, JSON.stringify(updated));
    } else {
      await addDoc(collection(db, 'incomes'), newIncome);
    }
  };

  const updateIncome = async (id: string, data: Partial<Income>) => {
    if (!user) return;

    const updatedData = { ...data, updatedAt: new Date().toISOString() };

    if (isDemoMode) {
      const updated = incomes.map(i => i.id === id ? { ...i, ...updatedData } : i);
      setIncomes(updated);
      localStorage.setItem(`income_${user.uid}`, JSON.stringify(updated));
    } else {
      await updateDoc(doc(db, 'incomes', id), updatedData);
    }
  };

  const deleteIncome = async (id: string) => {
    if (!user) return;

    if (isDemoMode) {
      const updated = incomes.filter(i => i.id !== id);
      setIncomes(updated);
      localStorage.setItem(`income_${user.uid}`, JSON.stringify(updated));
    } else {
      await deleteDoc(doc(db, 'incomes', id));
    }
  };

  const addBudget = async (budget: Omit<Budget, 'id' | 'spent'>) => {
    if (!user) return;

    const spent = expenses
      .filter(e => e.category === budget.category && e.date.startsWith(budget.month))
      .reduce((s, e) => s + e.amount, 0);
    
    const newBudget = { 
      ...budget, 
      spent,
      userId: user.uid 
    };

    if (isDemoMode) {
      const budgetWithId: Budget = { ...newBudget, id: generateId() };
      const updated = [...budgets, budgetWithId];
      setBudgets(updated);
      localStorage.setItem(`budgets_${user.uid}`, JSON.stringify(updated));
    } else {
      await addDoc(collection(db, 'budgets'), newBudget);
    }
  };

  const updateBudget = async (id: string, data: Partial<Budget>) => {
    if (!user) return;

    if (isDemoMode) {
      const updated = budgets.map(b => b.id === id ? { ...b, ...data } : b);
      setBudgets(updated);
      localStorage.setItem(`budgets_${user.uid}`, JSON.stringify(updated));
    } else {
      await updateDoc(doc(db, 'budgets', id), data);
    }
  };

  const deleteBudget = async (id: string) => {
    if (!user) return;

    if (isDemoMode) {
      const updated = budgets.filter(b => b.id !== id);
      setBudgets(updated);
      localStorage.setItem(`budgets_${user.uid}`, JSON.stringify(updated));
    } else {
      await deleteDoc(doc(db, 'budgets', id));
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    if (!user) return;

    const newCategory = { 
      ...category, 
      userId: user.uid 
    };

    if (isDemoMode) {
      const categoryWithId: Category = { ...newCategory, id: generateId() };
      const updated = [...categories, categoryWithId];
      setCategories(updated);
      localStorage.setItem(`categories_${user.uid}`, JSON.stringify(updated));
    } else {
      const id = generateId();
      await setDoc(doc(db, 'categories', id), { ...newCategory, id });
    }
  };

  const deleteCategory = async (id: string) => {
    if (!user) return;

    const cat = categories.find(c => c.id === id);
    if (cat?.isDefault) return;

    if (isDemoMode) {
      const updated = categories.filter(c => c.id !== id);
      setCategories(updated);
      localStorage.setItem(`categories_${user.uid}`, JSON.stringify(updated));
    } else {
      await deleteDoc(doc(db, 'categories', id));
    }
  };

  const getFilteredExpenses = (filters: FilterOptions): Expense[] => {
    let filtered = [...expenses];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(search) ||
        e.description.toLowerCase().includes(search) ||
        e.category.toLowerCase().includes(search) ||
        e.notes.toLowerCase().includes(search)
      );
    }
    if (filters.category) {
      filtered = filtered.filter(e => e.category === filters.category);
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(e => e.date >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(e => e.date <= filters.dateTo!);
    }
    if (filters.amountMin !== undefined) {
      filtered = filtered.filter(e => e.amount >= filters.amountMin!);
    }
    if (filters.amountMax !== undefined) {
      filtered = filtered.filter(e => e.amount <= filters.amountMax!);
    }
    if (filters.paymentMethod) {
      filtered = filtered.filter(e => e.paymentMethod === filters.paymentMethod);
    }

    const sortBy = filters.sortBy || 'date';
    const sortOrder = filters.sortOrder || 'desc';
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') comparison = a.date.localeCompare(b.date);
      else if (sortBy === 'amount') comparison = a.amount - b.amount;
      else if (sortBy === 'title') comparison = a.title.localeCompare(b.title);
      else if (sortBy === 'category') comparison = a.category.localeCompare(b.category);
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  };

  const getFilteredIncomes = (filters: FilterOptions): Income[] => {
    let filtered = [...incomes];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(i =>
        i.source.toLowerCase().includes(search) ||
        i.description.toLowerCase().includes(search) ||
        i.category.toLowerCase().includes(search)
      );
    }
    if (filters.category) {
      filtered = filtered.filter(i => i.category === filters.category);
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(i => i.date >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(i => i.date <= filters.dateTo!);
    }
    if (filters.amountMin !== undefined) {
      filtered = filtered.filter(i => i.amount >= filters.amountMin!);
    }
    if (filters.amountMax !== undefined) {
      filtered = filtered.filter(i => i.amount <= filters.amountMax!);
    }

    const sortBy = filters.sortBy || 'date';
    const sortOrder = filters.sortOrder || 'desc';
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') comparison = a.date.localeCompare(b.date);
      else if (sortBy === 'amount') comparison = a.amount - b.amount;
      else if (sortBy === 'source') comparison = a.source.localeCompare(b.source);
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  };

  const getDashboardStats = (month?: number, year?: number): DashboardStats => {
    const now = new Date();
    const m = month ?? now.getMonth();
    const y = year ?? now.getFullYear();
    const monthStr = `${y}-${String(m + 1).padStart(2, '0')}`;

    const monthExpenses = expenses.filter(e => e.date.startsWith(monthStr));
    const monthIncomes = incomes.filter(i => i.date.startsWith(monthStr));

    const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
    const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
    const monthlySpending = monthExpenses.reduce((s, e) => s + e.amount, 0);
    const monthlyIncome = monthIncomes.reduce((s, i) => s + i.amount, 0);
    const totalBudget = budgets.filter(b => b.month === monthStr).reduce((s, b) => s + b.amount, 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      monthlySpending,
      savings: monthlyIncome - monthlySpending,
      budgetUsed: totalBudget > 0 ? Math.round((monthlySpending / totalBudget) * 100) : 0,
    };
  };

  return (
    <DataContext.Provider value={{
      expenses,
      incomes,
      budgets,
      categories,
      loading,
      addExpense,
      updateExpense,
      deleteExpense,
      addIncome,
      updateIncome,
      deleteIncome,
      addBudget,
      updateBudget,
      deleteBudget,
      addCategory,
      deleteCategory,
      getFilteredExpenses,
      getFilteredIncomes,
      getDashboardStats,
      refreshData: loadData,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};

export default DataContext;
