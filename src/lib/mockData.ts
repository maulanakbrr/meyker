import type { Category, Transaction, TransactionType, RecurringTransaction } from '../types'
import { DEFAULT_CATEGORIES } from '../db/schema'

export const MOCK_CATEGORIES: Category[] = DEFAULT_CATEGORIES.map((cat, idx) => ({
  id: `cat-default-${idx}`,
  name: cat.name,
  type: cat.type as TransactionType,
  icon: cat.icon,
  color: cat.color,
  isDefault: cat.isDefault,
}))

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    userId: 'user-demo',
    categoryId: 'cat-default-7', // Salary
    amount: 15000000,
    type: 'INCOME',
    transactionDate: new Date().toISOString(),
    paymentMethod: 'BANK_TRANSFER',
    note: 'Monthly Salary Payment',
    source: 'WEB',
    category: MOCK_CATEGORIES[7],
  },
  {
    id: 'tx-2',
    userId: 'user-demo',
    categoryId: 'cat-default-0', // Food
    amount: 120000,
    type: 'EXPENSE',
    transactionDate: new Date().toISOString(),
    paymentMethod: 'E_WALLET',
    note: 'Dinner with client',
    source: 'WEB',
    category: MOCK_CATEGORIES[0],
  },
  {
    id: 'tx-3',
    userId: 'user-demo',
    categoryId: 'cat-default-1', // Housing
    amount: 3500000,
    type: 'EXPENSE',
    transactionDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    paymentMethod: 'BANK_TRANSFER',
    note: 'Apartment Maintenance & Rent',
    source: 'WEB',
    category: MOCK_CATEGORIES[1],
  },
  {
    id: 'tx-4',
    userId: 'user-demo',
    categoryId: 'cat-default-8', // Freelance
    amount: 4500000,
    type: 'INCOME',
    transactionDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    paymentMethod: 'BANK_TRANSFER',
    note: 'UI Design Freelance Project',
    source: 'WEB',
    category: MOCK_CATEGORIES[8],
  },
  {
    id: 'tx-5',
    userId: 'user-demo',
    categoryId: 'cat-default-2', // Transport
    amount: 250000,
    type: 'EXPENSE',
    transactionDate: new Date(Date.now() - 3 * 86400000).toISOString(),
    paymentMethod: 'CREDIT_CARD',
    note: 'Weekly fuel fill-up',
    source: 'WEB',
    category: MOCK_CATEGORIES[2],
  },
  {
    id: 'tx-6',
    userId: 'user-demo',
    categoryId: 'cat-default-4', // Entertainment
    amount: 150000,
    type: 'EXPENSE',
    transactionDate: new Date(Date.now() - 1 * 86400000).toISOString(),
    paymentMethod: 'E_WALLET',
    note: 'Movie tickets',
    source: 'WEB',
    category: MOCK_CATEGORIES[4],
  },
  {
    id: 'tx-7',
    userId: 'user-demo',
    categoryId: 'cat-default-5', // Shopping
    amount: 850000,
    type: 'EXPENSE',
    transactionDate: new Date(Date.now() - 10 * 86400000).toISOString(),
    paymentMethod: 'CREDIT_CARD',
    note: 'New shoes',
    source: 'WEB',
    category: MOCK_CATEGORIES[5],
  },
  {
    id: 'tx-8',
    userId: 'user-demo',
    categoryId: 'cat-default-0', // Food
    amount: 45000,
    type: 'EXPENSE',
    transactionDate: new Date(Date.now() - 1 * 86400000).toISOString(),
    paymentMethod: 'CASH',
    note: 'Coffee and snacks',
    source: 'WEB',
    category: MOCK_CATEGORIES[0],
  },
  {
    id: 'tx-9',
    userId: 'user-demo',
    categoryId: 'cat-default-3', // Utilities
    amount: 1200000,
    type: 'EXPENSE',
    transactionDate: new Date(Date.now() - 4 * 86400000).toISOString(),
    paymentMethod: 'BANK_TRANSFER',
    note: 'Electricity and Internet',
    source: 'WEB',
    category: MOCK_CATEGORIES[3],
  },
  {
    id: 'tx-10',
    userId: 'user-demo',
    categoryId: 'cat-default-6', // Health
    amount: 300000,
    type: 'EXPENSE',
    transactionDate: new Date(Date.now() - 15 * 86400000).toISOString(),
    paymentMethod: 'CREDIT_CARD',
    note: 'Pharmacy',
    source: 'WEB',
    category: MOCK_CATEGORIES[6],
  }
]

export const MOCK_SAVINGS_GOALS = [
  {
    id: 'goal-1',
    userId: 'user-demo',
    name: 'Emergency Fund',
    targetAmount: 50000000,
    currentAmount: 15000000,
    targetDate: new Date(Date.now() + 180 * 86400000).toISOString(),
    icon: 'Shield',
    color: '#10b981',
    createdAt: new Date().toISOString()
  },
  {
    id: 'goal-2',
    userId: 'user-demo',
    name: 'New Laptop',
    targetAmount: 25000000,
    currentAmount: 10000000,
    targetDate: new Date(Date.now() + 90 * 86400000).toISOString(),
    icon: 'Laptop',
    color: '#6366f1',
    createdAt: new Date().toISOString()
  }
]

export const MOCK_RECURRING_RULES: RecurringTransaction[] = [
  {
    id: 'rec-1',
    userId: 'user-demo',
    categoryId: 'cat-default-1',
    title: 'Apartment Rent',
    amount: 3500000,
    type: 'EXPENSE',
    frequency: 'MONTHLY',
    startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
    isActive: true,
    nextDueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    paymentMethod: 'BANK_TRANSFER',
    createdAt: new Date().toISOString()
  },
  {
    id: 'rec-2',
    userId: 'user-demo',
    categoryId: 'cat-default-4',
    title: 'Netflix Subscription',
    amount: 186000,
    type: 'EXPENSE',
    frequency: 'MONTHLY',
    startDate: new Date(Date.now() - 60 * 86400000).toISOString(),
    isActive: true,
    nextDueDate: new Date(Date.now() + 10 * 86400000).toISOString(),
    paymentMethod: 'CREDIT_CARD',
    createdAt: new Date().toISOString()
  }
]
