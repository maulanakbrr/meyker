import { describe, it, expect } from 'vitest'
import {
  calculateNextDueDate,
  getDueRecurringRules,
  formatFrequencyLabel,
} from '../recurringUtils'
import type { RecurringTransaction } from '../../types'

describe('recurringUtils', () => {
  describe('calculateNextDueDate', () => {
    it('advances DAILY frequency by 1 day', () => {
      const start = '2026-08-01T00:00:00.000Z'
      const next = calculateNextDueDate(start, 'DAILY')
      expect(new Date(next).getUTCDate()).toBe(2)
    })

    it('advances WEEKLY frequency by 7 days', () => {
      const start = '2026-08-01T00:00:00.000Z'
      const next = calculateNextDueDate(start, 'WEEKLY')
      expect(new Date(next).getUTCDate()).toBe(8)
    })

    it('advances MONTHLY frequency by 1 month', () => {
      const start = '2026-08-15T00:00:00.000Z'
      const next = calculateNextDueDate(start, 'MONTHLY')
      expect(new Date(next).getUTCMonth()).toBe(8) // September (0-indexed 8)
    })

    it('advances YEARLY frequency by 1 year', () => {
      const start = '2026-08-15T00:00:00.000Z'
      const next = calculateNextDueDate(start, 'YEARLY')
      expect(new Date(next).getUTCFullYear()).toBe(2027)
    })
  })

  describe('getDueRecurringRules', () => {
    const sampleRules: RecurringTransaction[] = [
      {
        id: 'rule-1',
        userId: 'user-1',
        title: 'Spotify',
        amount: 54900,
        type: 'EXPENSE',
        categoryId: 'cat-1',
        paymentMethod: 'CREDIT_CARD',
        frequency: 'MONTHLY',
        startDate: '2026-07-01T00:00:00.000Z',
        nextDueDate: '2026-08-01T00:00:00.000Z',
        isActive: true,
      },
      {
        id: 'rule-2',
        userId: 'user-1',
        title: 'Rent',
        amount: 3500000,
        type: 'EXPENSE',
        categoryId: 'cat-2',
        paymentMethod: 'BANK_TRANSFER',
        frequency: 'MONTHLY',
        startDate: '2026-08-01T00:00:00.000Z',
        nextDueDate: '2026-09-01T00:00:00.000Z',
        isActive: true,
      },
      {
        id: 'rule-3',
        userId: 'user-1',
        title: 'Gym',
        amount: 300000,
        type: 'EXPENSE',
        categoryId: 'cat-3',
        paymentMethod: 'CREDIT_CARD',
        frequency: 'MONTHLY',
        startDate: '2026-07-01T00:00:00.000Z',
        nextDueDate: '2026-08-01T00:00:00.000Z',
        isActive: false, // Inactive rule should not be due
      },
    ]

    it('returns active rules that are due on or before reference date', () => {
      const refDate = new Date('2026-08-15T00:00:00.000Z')
      const due = getDueRecurringRules(sampleRules, refDate)
      expect(due).toHaveLength(1)
      expect(due[0].id).toBe('rule-1')
    })
  })

  describe('formatFrequencyLabel', () => {
    it('formats frequency keys correctly', () => {
      expect(formatFrequencyLabel('DAILY')).toBe('Daily')
      expect(formatFrequencyLabel('WEEKLY')).toBe('Weekly')
      expect(formatFrequencyLabel('MONTHLY')).toBe('Monthly')
      expect(formatFrequencyLabel('YEARLY')).toBe('Yearly')
    })
  })
})
