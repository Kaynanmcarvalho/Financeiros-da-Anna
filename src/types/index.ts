import { Timestamp } from 'firebase/firestore';

// ==========================================
// User Profile
// ==========================================

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
  buttonColor: string;
  cardColor: string;
  accentColor: string;
  bottomBarColor: string;
  chartPalette: string[];
  fontSize: 'sm' | 'md' | 'lg';
  borderRadius: 'sm' | 'md' | 'lg' | 'xl';
  animationsEnabled: boolean;
  hideValues: boolean;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string | null;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  preferences: UserPreferences;
}

// ==========================================
// Accounts (Cards & Wallets)
// ==========================================

export type AccountType = 'credit_card' | 'debit_card' | 'wallet' | 'bank_account' | 'pix';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  color: string;
  icon: string;
  creditLimit: number | null;
  closingDay: number | null;
  dueDay: number | null;
  initialBalance: number;
  archived: boolean;
  createdAt: Timestamp;
}

// ==========================================
// Categories
// ==========================================

export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
  isDefault: boolean;
  createdAt: Timestamp;
}

// ==========================================
// Transactions
// ==========================================

export type TransactionType = 'income' | 'expense' | 'transfer';
export type RecurrenceRule = 'monthly' | 'weekly' | 'yearly';

export interface Installment {
  current: number;
  total: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  categoryId: string;
  accountId: string | null;
  toAccountId: string | null;
  date: Timestamp;
  isPaid: boolean;
  isRecurring: boolean;
  recurrenceRule: RecurrenceRule | null;
  installments: Installment | null;
  notes: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ==========================================
// Goals (Wishes)
// ==========================================

export type GoalStatus = 'active' | 'completed' | 'archived';

export interface GoalContribution {
  amount: number;
  date: Timestamp;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  deadline: Timestamp | null;
  color: string;
  icon: string;
  imageURL: string | null;
  status: GoalStatus;
  contributions: GoalContribution[];
  createdAt: Timestamp;
}

// ==========================================
// Reminders
// ==========================================

export type ReminderRecurrence = 'none' | 'monthly' | 'weekly' | 'yearly';

export interface Reminder {
  id: string;
  title: string;
  amount: number | null;
  dueDate: Timestamp;
  recurrence: ReminderRecurrence;
  isDone: boolean;
  linkedAccountId: string | null;
  notifyDaysBefore: number;
  createdAt: Timestamp;
}

// ==========================================
// Budgets
// ==========================================

export interface BudgetLimit {
  categoryId: string;
  limit: number;
}

export interface Budget {
  id: string;
  month: string;
  limits: BudgetLimit[];
  createdAt: Timestamp;
}

// ==========================================
// Theme Presets
// ==========================================

export interface ThemePreset {
  name: string;
  preferences: Pick<
    UserPreferences,
    'primaryColor' | 'buttonColor' | 'cardColor' | 'accentColor' | 'bottomBarColor' | 'chartPalette'
  >;
}
