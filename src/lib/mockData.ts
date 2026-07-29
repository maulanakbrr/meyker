import type { Category, Transaction, TransactionType } from '../types'
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
    transactionDate: new Date().toISOString(),
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
    transactionDate: new Date().toISOString(),
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
    transactionDate: new Date().toISOString(),
    paymentMethod: 'CREDIT_CARD',
    note: 'Weekly fuel fill-up',
    source: 'WEB',
    category: MOCK_CATEGORIES[2],
  },
]
