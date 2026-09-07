import { describe, it, expect } from 'vitest'
import {
  calculateCategoryBudgets,
  calculateSavingsGoalProgress,
} from '../dashboardUtils'
import type { Transaction, Category } from '../../types'

describe('Category Budgets & Savings Goals logic', () => {
  it('correctly calculates category spending budgets and status indicators', () => {
    const categories: Category[] = [
      {
        id: 'cat-1',
        name: 'Food & Dining',
        type: 'EXPENSE',
        icon: 'Utensils',
        color: '#f59e0b',
        isDefault: true,
        monthlyBudget: 2000000,
      },
      {
        id: 'cat-2',
        name: 'Transport',
        type: 'EXPENSE',
        icon: 'Car',
        color: '#3b82f6',
        isDefault: true,
        monthlyBudget: 500000,
      },
      {
        id: 'cat-3',
        name: 'Rent',
        type: 'EXPENSE',
        icon: 'Home',
        color: '#ef4444',
        isDefault: true,
        monthlyBudget: 3000000,
      },
    ]

    const transactions: Transaction[] = [
      {
        id: '1',
        userId: 'u-1',
        categoryId: 'cat-1',
        amount: 1600000, // 80% -> CAUTION
        type: 'EXPENSE',
        transactionDate: '2026-08-15',
        paymentMethod: 'CASH',
        source: 'WEB',
      },
      {
        id: '2',
        userId: 'u-1',
        categoryId: 'cat-2',
        amount: 600000, // 120% -> EXCEEDED (exceeded by 100,000)
        type: 'EXPENSE',
        transactionDate: '2026-08-16',
        paymentMethod: 'CASH',
        source: 'WEB',
      },
      {
        id: '3',
        userId: 'u-1',
        categoryId: 'cat-3',
        amount: 1000000, // 33% -> HEALTHY
        type: 'EXPENSE',
        transactionDate: '2026-08-17',
        paymentMethod: 'BANK_TRANSFER',
        source: 'WEB',
      },
    ]

    const budgets = calculateCategoryBudgets(transactions, '2026-08', categories)
    expect(budgets.length).toBe(3)

    const foodBudget = budgets.find((b) => b.categoryId === 'cat-1')
    expect(foodBudget).toBeDefined()
    expect(foodBudget?.spent).toBe(1600000)
    expect(foodBudget?.percentage).toBe(80)
    expect(foodBudget?.status).toBe('CAUTION')

    const transportBudget = budgets.find((b) => b.categoryId === 'cat-2')
    expect(transportBudget).toBeDefined()
    expect(transportBudget?.spent).toBe(600000)
    expect(transportBudget?.status).toBe('EXCEEDED')
    expect(transportBudget?.exceededAmount).toBe(100000)

    const rentBudget = budgets.find((b) => b.categoryId === 'cat-3')
    expect(rentBudget).toBeDefined()
    expect(rentBudget?.status).toBe('HEALTHY')
  })

  it('correctly calculates savings goal progress and completion state', () => {
    const inProgress = calculateSavingsGoalProgress(10000000, 4500000)
    expect(inProgress.percentage).toBe(45)
    expect(inProgress.remainingAmount).toBe(5500000)
    expect(inProgress.isCompleted).toBe(false)

    const completed = calculateSavingsGoalProgress(5000000, 5000000)
    expect(completed.percentage).toBe(100)
    expect(completed.remainingAmount).toBe(0)
    expect(completed.isCompleted).toBe(true)

    const largeTarget = calculateSavingsGoalProgress(20000000, 5000000)
    expect(largeTarget.percentage).toBe(25)
    expect(largeTarget.remainingAmount).toBe(15000000)
    expect(largeTarget.isCompleted).toBe(false)
  })
})
