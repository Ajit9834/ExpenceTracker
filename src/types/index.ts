export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: string;
  currency: string;
  monthlyBudget: number;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  paymentMethod: string;
  notes: string;
  receiptURL: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Income {
  id: string;
  source: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  month: string;
  year: number;
  spent: number;
}

export interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  type: 'expense' | 'income';
  title: string;
  amount: number;
  category: string;
  date: string;
  description: string;
}

export interface FilterOptions {
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  paymentMethod?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthlySpending: number;
  savings: number;
  budgetUsed: number;
}

export const EXPENSE_CATEGORIES: Category[] = [
  { id: '1', name: 'Food', type: 'expense', icon: '🍔', color: '#FF6B6B', isDefault: true },
  { id: '2', name: 'Shopping', type: 'expense', icon: '🛍️', color: '#4ECDC4', isDefault: true },
  { id: '3', name: 'Rent', type: 'expense', icon: '🏠', color: '#45B7D1', isDefault: true },
  { id: '4', name: 'Bills', type: 'expense', icon: '📱', color: '#96CEB4', isDefault: true },
  { id: '5', name: 'Education', type: 'expense', icon: '📚', color: '#FFEAA7', isDefault: true },
  { id: '6', name: 'Entertainment', type: 'expense', icon: '🎬', color: '#DDA0DD', isDefault: true },
  { id: '7', name: 'Transport', type: 'expense', icon: '🚗', color: '#98D8C8', isDefault: true },
  { id: '8', name: 'Travel', type: 'expense', icon: '✈️', color: '#F7DC6F', isDefault: true },
  { id: '9', name: 'Healthcare', type: 'expense', icon: '🏥', color: '#82E0AA', isDefault: true },
  { id: '10', name: 'Others', type: 'expense', icon: '📦', color: '#AEB6BF', isDefault: true },
];

export const INCOME_CATEGORIES: Category[] = [
  { id: '11', name: 'Salary', type: 'income', icon: '💰', color: '#2ECC71', isDefault: true },
  { id: '12', name: 'Freelancing', type: 'income', icon: '💻', color: '#3498DB', isDefault: true },
  { id: '13', name: 'Business', type: 'income', icon: '🏢', color: '#9B59B6', isDefault: true },
  { id: '14', name: 'Investment', type: 'income', icon: '📈', color: '#E67E22', isDefault: true },
  { id: '15', name: 'Gift', type: 'income', icon: '🎁', color: '#E74C3C', isDefault: true },
  { id: '16', name: 'Others', type: 'income', icon: '💎', color: '#1ABC9C', isDefault: true },
];

export const PAYMENT_METHODS = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'UPI',
  'Digital Wallet',
  'Net Banking',
  'Cheque',
];

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];
