export type TransactionType = 'INCOME' | 'EXPENSE'
export type TransactionSource = 'WEB' | 'WHATSAPP' | 'IMPORT' | 'RECURRING'
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'E_WALLET'
export type RecurringFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'

export interface Category {
  id: string
  userId?: string | null
  name: string
  type: TransactionType
  icon: string
  color: string
  isDefault: boolean
  monthlyBudget?: number | null
  createdAt?: string
}

export interface SavingsGoal {
  id: string
  userId: string
  name: string
  targetAmount: number
  currentAmount: number
  color: string
  icon: string
  targetDate?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface RecurringTransaction {
  id: string
  userId: string
  title: string
  amount: number
  type: TransactionType
  categoryId: string | null
  paymentMethod: PaymentMethod
  frequency: RecurringFrequency
  startDate: string
  nextDueDate: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
  // Populated fields
  category?: Category | null
}

export interface Transaction {
  id: string
  userId: string
  categoryId: string | null
  amount: number
  type: TransactionType
  transactionDate: string // ISO string date
  paymentMethod: PaymentMethod
  note?: string | null
  source: TransactionSource
  createdAt?: string
  updatedAt?: string
  // Populated fields
  category?: Category | null
}

export interface StatSummary {
  totalBalance: number
  totalIncome: number
  totalExpenses: number
}

export interface CategorySpending {
  categoryId: string
  categoryName: string
  color: string
  totalAmount: number
  percentage: number
}

export interface MonthlyTrend {
  month: string
  income: number
  expenses: number
}

export interface FilterParams {
  searchQuery: string
  typeFilter: 'ALL' | 'INCOME' | 'EXPENSE'
  categoryFilter: string // 'ALL' or categoryId
  monthYear: string // 'YYYY-MM'
}

export interface UserProfile {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
  phoneNumber?: string | null
}
