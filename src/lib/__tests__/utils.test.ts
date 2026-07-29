import { describe, it, expect } from 'vitest'
import { formatCurrency, calculateFinancialSummary, filterTransactions } from '../utils'
import type { Transaction } from '../../types'

const sampleTransactions: Transaction[] = [
  {
    id: 'tx-1',
    userId: 'u1',
    amount: 1000000,
    type: 'INCOME',
    transactionDate: '2026-07-01T00:00:00Z',
    categoryId: 'cat-income',
    paymentMethod: 'BANK_TRANSFER',
    source: 'WEB',
    note: 'Project Payment',
    createdAt: '',
    updatedAt: '',
    category: {
      id: 'cat-income',
      userId: 'u1',
      name: 'Freelance',
      type: 'INCOME',
      icon: 'briefcase',
      color: '#10B981',
      isDefault: true,
      createdAt: '',
    },
  },
  {
    id: 'tx-2',
    userId: 'u1',
    amount: 250000,
    type: 'EXPENSE',
    transactionDate: '2026-07-05T00:00:00Z',
    categoryId: 'cat-food',
    paymentMethod: 'CASH',
    source: 'WEB',
    note: 'Restaurant Dinner',
    createdAt: '',
    updatedAt: '',
    category: {
      id: 'cat-food',
      userId: 'u1',
      name: 'Food & Dining',
      type: 'EXPENSE',
      icon: 'utensils',
      color: '#EF4444',
      isDefault: true,
      createdAt: '',
    },
  },
  {
    id: 'tx-3',
    userId: 'u1',
    amount: 150000,
    type: 'EXPENSE',
    transactionDate: '2026-07-10T00:00:00Z',
    categoryId: 'cat-food',
    paymentMethod: 'E_WALLET',
    source: 'WEB',
    note: 'Supermarket Groceries',
    createdAt: '',
    updatedAt: '',
    category: {
      id: 'cat-food',
      userId: 'u1',
      name: 'Food & Dining',
      type: 'EXPENSE',
      icon: 'utensils',
      color: '#EF4444',
      isDefault: true,
      createdAt: '',
    },
  },
]

describe('Financial Utilities & Helpers', () => {
  describe('formatCurrency', () => {
    it('formats numerical and string amounts to IDR format', () => {
      expect(formatCurrency(150000)).toMatch(/Rp\s*150\.000/)
      expect(formatCurrency('5000000')).toMatch(/Rp\s*5\.000\.000/)
      expect(formatCurrency(0)).toMatch(/Rp\s*0/)
    })
  })

  describe('calculateFinancialSummary', () => {
    it('correctly sums income, expenses, net balance and savings rate', () => {
      const summary = calculateFinancialSummary(sampleTransactions)

      expect(summary.totalIncome).toBe(1000000)
      expect(summary.totalExpense).toBe(400000)
      expect(summary.netBalance).toBe(600000)
      expect(summary.savingsRate).toBe(60) // (600,000 / 1,000,000) * 100
    })

    it('handles empty transaction array', () => {
      const summary = calculateFinancialSummary([])

      expect(summary.totalIncome).toBe(0)
      expect(summary.totalExpense).toBe(0)
      expect(summary.netBalance).toBe(0)
      expect(summary.savingsRate).toBe(0)
    })
  })

  describe('filterTransactions', () => {
    it('filters transactions by type (EXPENSE)', () => {
      const filtered = filterTransactions(sampleTransactions, { type: 'EXPENSE' })
      expect(filtered).toHaveLength(2)
      expect(filtered.every((tx) => tx.type === 'EXPENSE')).toBe(true)
    })

    it('filters transactions by categoryId', () => {
      const filtered = filterTransactions(sampleTransactions, { categoryId: 'cat-food' })
      expect(filtered).toHaveLength(2)
      expect(filtered.every((tx) => tx.categoryId === 'cat-food')).toBe(true)
    })

    it('filters transactions by search query matching note or category name', () => {
      const filtered = filterTransactions(sampleTransactions, { searchQuery: 'restaurant' })
      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('tx-2')
    })

    it('returns all transactions when filters are set to ALL or empty', () => {
      const filtered = filterTransactions(sampleTransactions, { type: 'ALL', categoryId: 'ALL', searchQuery: '' })
      expect(filtered).toHaveLength(3)
    })
  })
})
