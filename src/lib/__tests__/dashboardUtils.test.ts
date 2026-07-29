import { describe, it, expect } from 'vitest'
import {
  getTxMonthKey,
  calculateDashboardStats,
  calculateCategoryBreakdown,
  calculateMonthlyTrend,
  filterDashboardTransactions,
} from '../dashboardUtils'
import type { Transaction, Category } from '../../types'

describe('dashboardUtils', () => {
  const sampleCategories: Category[] = [
    { id: 'cat-1', name: 'Food', type: 'EXPENSE', icon: 'Tag', color: '#ff0000', isDefault: true },
    { id: 'cat-2', name: 'Salary', type: 'INCOME', icon: 'Tag', color: '#00ff00', isDefault: true },
  ]

  const sampleTransactions: Transaction[] = [
    {
      id: 'tx-1',
      userId: 'user-1',
      categoryId: 'cat-2',
      amount: 10000000,
      type: 'INCOME',
      transactionDate: '2026-07-15T10:00:00.000Z',
      paymentMethod: 'BANK_TRANSFER',
      note: 'July Salary',
      source: 'WEB',
      category: sampleCategories[1],
    },
    {
      id: 'tx-2',
      userId: 'user-1',
      categoryId: 'cat-1',
      amount: 200000,
      type: 'EXPENSE',
      transactionDate: '2026-07-16T12:00:00.000Z',
      paymentMethod: 'CASH',
      note: 'Groceries',
      source: 'WEB',
      category: sampleCategories[0],
    },
    {
      id: 'tx-3',
      userId: 'user-1',
      categoryId: 'cat-1',
      amount: 150000,
      type: 'EXPENSE',
      transactionDate: '2026-06-10T12:00:00.000Z',
      paymentMethod: 'CREDIT_CARD',
      note: 'Dinner',
      source: 'WEB',
      category: sampleCategories[0],
    },
  ]

  describe('getTxMonthKey', () => {
    it('formats ISO date to YYYY-MM', () => {
      expect(getTxMonthKey('2026-07-15T10:00:00.000Z')).toBe('2026-07')
    })

    it('handles empty date gracefully', () => {
      expect(getTxMonthKey('')).toBe('')
    })
  })

  describe('calculateDashboardStats', () => {
    it('calculates income, expenses, and balance for selected month', () => {
      const stats = calculateDashboardStats(sampleTransactions, '2026-07')
      expect(stats.totalIncome).toBe(10000000)
      expect(stats.totalExpenses).toBe(200000)
      expect(stats.totalBalance).toBe(9800000)
    })

    it('returns zeroes for month with no transactions', () => {
      const stats = calculateDashboardStats(sampleTransactions, '2025-01')
      expect(stats.totalIncome).toBe(0)
      expect(stats.totalExpenses).toBe(0)
      expect(stats.totalBalance).toBe(0)
    })
  })

  describe('calculateCategoryBreakdown', () => {
    it('aggregates expenses by category name', () => {
      const breakdown = calculateCategoryBreakdown(sampleTransactions, '2026-07', sampleCategories)
      expect(breakdown).toHaveLength(1)
      expect(breakdown[0]).toEqual({
        name: 'Food',
        value: 200000,
        color: '#ff0000',
      })
    })
  })

  describe('calculateMonthlyTrend', () => {
    it('returns trend data for 6 months', () => {
      const trend = calculateMonthlyTrend(sampleTransactions)
      expect(trend).toHaveLength(6)
    })
  })

  describe('filterDashboardTransactions', () => {
    it('filters by month, type, and search query', () => {
      const filtered = filterDashboardTransactions(sampleTransactions, {
        selectedMonth: '2026-07',
        typeFilter: 'EXPENSE',
        searchQuery: 'groc',
      })
      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('tx-2')
    })
  })
})
